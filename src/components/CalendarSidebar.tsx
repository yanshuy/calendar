import { format } from "date-fns";
import { Suspense, useMemo, useState } from "react";
import { useEventModal } from "../context/useEventModal";
import { useRouter } from "../router/useRouter";
import { CalendarEvent, EventStore } from "../store/EventStore";
import { useEventStore } from "../hooks/useEventStore";

type CalendarSidebarProps = {
    sideViewIsOpen: boolean;
};

type TabType = "current" | "past";

export default function CalendarSidebar({
    sideViewIsOpen,
}: CalendarSidebarProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<TabType>("current");

    return (
        <aside
            className={`pt-12 overflow-hidden md:mt-0 transition-all ${
                sideViewIsOpen ? "min-w-80 max-w-80" : "min-w-0 max-w-0"
            }`}
        >
            <div
                style={{
                    paddingInlineEnd: "1rem",
                }}
                className="[&>*:not(ol)]:min-w-max"
            >
                <div className="px-1">
                    <div className="flex overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-1 focus-within:ring focus-within:ring-slate-900 focus-within:ring-offset-2">
                        <input
                            type="text"
                            id="search"
                            className="w-full rounded-md bg-slate-50 px-2 outline-none placeholder:text-slate-400 text-sm"
                            placeholder="Search events..."
                            onChange={(e) => setSearchTerm(e.target.value)}
                            tabIndex={sideViewIsOpen ? 0 : -1}
                        />
                        <label htmlFor="search">
                            <span className="overflow-hidden block size-px">
                                Search
                            </span>

                            <span className="-translate-y-px">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="#000000"
                                    version="1.1"
                                    id="Capa_1"
                                    viewBox="0 0 488.4 488.4"
                                    className="size-7 bg-slate-50 fill-slate-400 py-[.35rem]"
                                >
                                    <g>
                                        <g>
                                            <path d="M0,203.25c0,112.1,91.2,203.2,203.2,203.2c51.6,0,98.8-19.4,134.7-51.2l129.5,129.5c2.4,2.4,5.5,3.6,8.7,3.6 s6.3-1.2,8.7-3.6c4.8-4.8,4.8-12.5,0-17.3l-129.6-129.5c31.8-35.9,51.2-83,51.2-134.7c0-112.1-91.2-203.2-203.2-203.2 S0,91.15,0,203.25z M381.9,203.25c0,98.5-80.2,178.7-178.7,178.7s-178.7-80.2-178.7-178.7s80.2-178.7,178.7-178.7 S381.9,104.65,381.9,203.25z" />
                                        </g>
                                    </g>
                                </svg>
                            </span>
                        </label>
                    </div>
                </div>

                <div className="px-1 pt-4">
                    {/* View tab styled identically to Day/Week */}
                    <div className="flex w-full rounded-lg border border-slate-200 bg-slate-50 p-[1px] mb-2">
                        <button
                            type="button"
                            className={`${
                                activeTab === "current"
                                    ? "bg-white border-slate-200 shadow-xs"
                                    : "border-transparent text-slate-500 hover:text-slate-900"
                            } basis-full rounded-[7px] border p-1 text-xs font-semibold text-slate-700 transition-colors cursor-pointer text-center`}
                            onClick={() => setActiveTab("current")}
                        >
                            Current
                        </button>
                        <button
                            type="button"
                            className={`${
                                activeTab === "past"
                                    ? "bg-white border-slate-200 shadow-xs"
                                    : "border-transparent text-slate-500 hover:text-slate-900"
                            } basis-full rounded-[7px] translate-x-[1px] border p-1 text-xs font-semibold text-slate-700 transition-colors cursor-pointer text-center`}
                            onClick={() => setActiveTab("past")}
                        >
                            Past
                        </button>
                    </div>

                    <Suspense fallback={<div className="text-sm text-slate-400 py-4">Loading...</div>}>
                        <SideBarEvents
                            searchTerm={searchTerm}
                            activeTab={activeTab}
                        />
                    </Suspense>
                </div>
            </div>
        </aside>
    );
}

function SideBarEvents({
    searchTerm,
    activeTab,
}: {
    searchTerm: string;
    activeTab: TabType;
}) {
    const { events, isLoading } = useEventStore();

    const filteredEvents = useMemo(() => {
        const now = Date.now();

        // Separate active/current (ongoing & upcoming) and past events
        const tabEvents = events.filter((event) => {
            const endMs = new Date(event.endDateTime).getTime();
            if (activeTab === "current") {
                // Event is ongoing or in the future
                return endMs >= now;
            } else {
                // Event has ended
                return endMs < now;
            }
        });

        // Sort:
        // Current: Ongoing events first (start <= now <= end), then upcoming events (start > now) ascending
        // Past: Most recently ended first (descending)
        tabEvents.sort((a, b) => {
            const startA = new Date(a.startDateTime).getTime();
            const startB = new Date(b.startDateTime).getTime();
            const endA = new Date(a.endDateTime).getTime();
            const endB = new Date(b.endDateTime).getTime();

            if (activeTab === "current") {
                const isOngoingA = startA <= now && endA >= now;
                const isOngoingB = startB <= now && endB >= now;

                if (isOngoingA && !isOngoingB) return -1;
                if (!isOngoingA && isOngoingB) return 1;

                return startA - startB;
            } else {
                return startB - startA;
            }
        });

        // Apply search filter
        if (!searchTerm.trim()) return tabEvents;

        const term = searchTerm.toLowerCase();
        return tabEvents.filter((event) => {
            const text = `${format(new Date(event.startDateTime), "EEE, MMM dd yyyy")} ${format(new Date(event.startDateTime), "h:mm a")} ${format(new Date(event.endDateTime), "h:mm a")} ${event.title} ${event.description || ""} ${event.category || ""}`;
            return text.toLowerCase().includes(term);
        });
    }, [events, activeTab, searchTerm]);

    return (
        <ol
            className="mt-2 flex h-[calc(100vh-175px)] min-w-[calc(320px-2rem)] flex-col gap-1 overflow-y-auto overflow-x-hidden text-sm leading-6 text-gray-500 pr-1"
        >
            {isLoading ? (
                <p className="py-4 text-center text-xs text-slate-400">Loading events...</p>
            ) : filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))
            ) : (
                <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-1">
                    <p className="font-medium text-slate-500">
                        {searchTerm
                            ? "No matching events"
                            : activeTab === "current"
                              ? "No current or upcoming events"
                              : "No past events"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                        {searchTerm
                            ? "Try adjusting your search terms"
                            : activeTab === "current"
                              ? "Schedule a new event above"
                              : "Past events will appear here"}
                    </p>
                </div>
            )}
        </ol>
    );
}

function EventCard({ event }: { event: CalendarEvent }) {
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const { openModal } = useEventModal();
    const { setCurrentDate } = useRouter();

    async function handleDelete(
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) {
        e.preventDefault();
        e.stopPropagation();

        const confirmed = window.confirm(
            "Are you sure you want to delete this event?",
        );
        if (!confirmed) return false;
        EventStore.deleteEvent(event.id);
    }

    const startDate = new Date(event.startDateTime);
    const endDate = new Date(event.endDateTime);
    const now = Date.now();
    const isOngoing = startDate.getTime() <= now && endDate.getTime() >= now;
    const isPast = endDate.getTime() < now;

    return (
        <li
            className="mt-1 h-max rounded"
            onMouseLeave={() => {
                setMenuIsOpen(false);
            }}
        >
            <div
                data-category={event.category}
                className={`block p-3 relative group focus-within:bg-(--category-bg-hover) focus-within:text-(--category-text-hover) hover:bg-(--category-bg-hover) hover:text-(--category-text-hover) bg-(--category-bg-light) text-(--category-text) transition-colors duration-200 h-full w-full rounded-xl focus:outline-none focus:focus-visible:ring focus:ring-slate-900 focus:ring-offset-2 ${
                    isPast ? "opacity-85" : ""
                }`}
                onClick={(e) => {
                    e.preventDefault();
                    setCurrentDate(startDate);
                    window.location.hash = "";
                    window.location.hash = event.id;
                }}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setMenuIsOpen(true);
                }}
            >
                <a
                    href={"#" + event.id}
                    className="before:inset-0 before:absolute"
                ></a>
                <div className="flex items-center justify-between">
                    <time dateTime={format(startDate, "yyyy-MM-dd")}>
                        {format(startDate, "EEE, MMM dd y")}
                    </time>
                    {isOngoing && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live
                        </span>
                    )}
                </div>
                <p className="text-(--category-text-name) font-medium">{event.title}</p>
                <span className="mt-0.5 text-xs">
                    <time dateTime={startDate.toLocaleTimeString()}>
                        {format(startDate, "h:mm a")}
                    </time>
                    {" - "}
                    <time dateTime={endDate.toLocaleTimeString()}>
                        {format(endDate, "h:mm a")}
                    </time>
                </span>
                <div className="absolute top-3 right-3">
                    <button
                        className="menu flex h-5 -translate-y-1 translate-x-1 items-center gap-[2.5px] px-1 hover:cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuIsOpen((prev) => !prev);
                        }}
                    >
                        {[...Array(3)].map((_, index) => (
                            <span
                                key={index}
                                className="group-hover:bg-(--category-dots-hover) group-focus-within:bg-(--category-dots-hover) size-1 rounded-[100%]"
                            ></span>
                        ))}
                    </button>
                    <ol
                        className={`${
                            menuIsOpen ? "absolute" : "hidden"
                        } right-0 top-4 grid w-32 rounded-lg bg-white px-1 py-[0.3rem] text-slate-700 shadow-md z-30`}
                    >
                        <li>
                            <button
                                className="w-full rounded-md px-2 py-1 text-left hover:bg-slate-100 focus:bg-slate-100 disabled:opacity-50 text-xs"
                                disabled={isPast}
                                onClick={() => {
                                    openModal(event);
                                }}
                            >
                                Edit
                            </button>
                        </li>
                        <li>
                            <button
                                className="w-full rounded-md px-2 py-1 text-left hover:bg-slate-100 focus:bg-slate-100 text-xs text-red-600"
                                onClick={(e) => handleDelete(e)}
                                onBlur={() => setMenuIsOpen(false)}
                            >
                                Delete
                            </button>
                        </li>
                    </ol>
                </div>
            </div>
        </li>
    );
}
