import { format } from "date-fns";
import { Suspense, useMemo, useState } from "react";
import { useEventModal } from "../context/useEventModal";
import { useRouter } from "../router/useRouter";
import { CalendarEvent, EventStore } from "../store/EventStore";
import { useEventStore } from "../hooks/useEventStore";
import UploadModal from "./UploadModal";
import { useDialog } from "../hooks/useDialog";
import TimezoneSelector from "./TimezoneSelector";
import { useTimezone } from "../context/TimezoneContext";
import { getZonedEventDates } from "../utils/timezone";

type CalendarSidebarProps = {
    sideViewIsOpen: boolean;
    onClose?: () => void;
};

type TabType = "current" | "past";

export default function CalendarSidebar({
    sideViewIsOpen,
    onClose,
}: CalendarSidebarProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<TabType>("current");

    const searchAndTabs = (
        <div className="flex flex-col h-full min-h-0">
            {/* Top Fixed Area: Search and Tabs */}
            <div className="shrink-0">
                <div className="px-1 flex items-center gap-2">
                    <div className="flex-1 flex overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-1 focus-within:ring focus-within:ring-slate-900 focus-within:ring-offset-2">
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
                    {/* Import button visible on mobile drawer only */}
                    <div className="md:hidden">
                        <SidebarUploadButton />
                    </div>
                </div>

                <div className="px-1 pt-4">
                    {/* View tab styled identically to Day/Week */}
                    <div className="flex w-full rounded-lg border border-slate-200 bg-slate-50 p-[1px] mb-2">
                        <button
                            type="button"
                            className={`${activeTab === "current"
                                    ? "bg-white border-slate-200 shadow-xs"
                                    : "border-transparent text-slate-500 hover:text-slate-900"
                                } basis-full rounded-[7px] border p-1 text-xs font-semibold text-slate-700 transition-colors cursor-pointer text-center`}
                            onClick={() => setActiveTab("current")}
                        >
                            Current
                        </button>
                        <button
                            type="button"
                            className={`${activeTab === "past"
                                    ? "bg-white border-slate-200 shadow-xs"
                                    : "border-transparent text-slate-500 hover:text-slate-900"
                                } basis-full rounded-[7px] translate-x-[1px] border p-1 text-xs font-semibold text-slate-700 transition-colors cursor-pointer text-center`}
                            onClick={() => setActiveTab("past")}
                        >
                            Past
                        </button>
                    </div>
                </div>
            </div>

            {/* Scrollable Events List */}
            <div className="px-1 flex-1 overflow-y-auto min-h-0 my-1">
                <Suspense fallback={<div className="text-sm text-slate-400 py-4">Loading...</div>}>
                    <SideBarEvents
                        searchTerm={searchTerm}
                        activeTab={activeTab}
                        onSelectEvent={onClose}
                    />
                </Suspense>
            </div>

            {/* Fixed Bottom Timezone Section */}
            <div className="px-1 pt-3 pb-1 mt-auto border-t border-slate-200/60 flex items-center justify-between gap-2 shrink-0 bg-white relative z-20">
                <span className="text-xs text-slate-500 font-medium">Timezone</span>
                <TimezoneSelector />
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Drawer Backdrop */}
            {sideViewIsOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Mobile Slide-over Drawer */}
            <div
                className={`fixed inset-y-0 right-0 z-50 w-96 max-w-[85vw] h-full max-h-screen bg-white shadow-2xl p-4 flex flex-col md:hidden transition-transform duration-300 ${sideViewIsOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
                    }`}
            >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 shrink-0">
                    <h3 className="font-semibold text-slate-800 text-sm">Events</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-sm cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
                <div className="flex-1 flex flex-col min-h-0 relative">{searchAndTabs}</div>
            </div>

            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:flex flex-col h-full pt-12 pb-4 md:mt-0 transition-all ${sideViewIsOpen ? "min-w-80 max-w-80" : "min-w-0 max-w-0 pointer-events-none overflow-hidden"
                    }`}
            >
                <div
                    style={{
                        paddingInlineEnd: "1rem",
                    }}
                    className="flex flex-col h-full min-h-0 relative"
                >
                    {searchAndTabs}
                </div>
            </aside>
        </>
    );
}

function SidebarUploadButton() {
    const [uploadModalIsOpen, setUploadModalIsOpen, uploadModalRef] =
        useDialog(false);

    return (
        <>
            <button
                className={`flex size-8 items-center justify-center rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0 ${uploadModalIsOpen ? "stroke-slate-800 text-slate-800" : "stroke-slate-500 text-slate-500"
                    }`}
                title="Import/Export Calendar (.ics)"
                onClick={() => setUploadModalIsOpen(true)}
            >
                <span className="sr-only">import</span>
                <span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="size-4.5"
                    >
                        <path
                            d="M9.31995 11.6799L11.8799 14.2399L14.4399 11.6799"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M11.88 4V14.17"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M20 12.1799C20 16.5999 17 20.1799 12 20.1799C7 20.1799 4 16.5999 4 12.1799"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </span>
            </button>
            <UploadModal
                dialogRef={uploadModalRef}
                setIsOpen={setUploadModalIsOpen}
            />
        </>
    );
}

function SideBarEvents({
    searchTerm,
    activeTab,
    onSelectEvent,
}: {
    searchTerm: string;
    activeTab: TabType;
    onSelectEvent?: () => void;
}) {
    const { events, isLoading } = useEventStore();
    const { timezone } = useTimezone();

    const filteredEvents = useMemo(() => {
        const now = Date.now();

        // Separate active/current (ongoing & upcoming) and past events
        const tabEvents = events.filter((event) => {
            const { endDate } = getZonedEventDates(event, timezone);
            const endMs = endDate.getTime();
            if (activeTab === "current") {
                return endMs >= now;
            } else {
                return endMs < now;
            }
        });

        // Sort:
        // Current: Ongoing events first (start <= now <= end), then upcoming events (start > now) ascending
        // Past: Most recently ended first (descending)
        tabEvents.sort((a, b) => {
            const { startDate: startA, endDate: endA } = getZonedEventDates(
                a,
                timezone,
            );
            const { startDate: startB, endDate: endB } = getZonedEventDates(
                b,
                timezone,
            );

            const startMsA = startA.getTime();
            const startMsB = startB.getTime();
            const endMsA = endA.getTime();
            const endMsB = endB.getTime();

            if (activeTab === "current") {
                const isOngoingA = startMsA <= now && endMsA >= now;
                const isOngoingB = startMsB <= now && endMsB >= now;

                if (isOngoingA && !isOngoingB) return -1;
                if (!isOngoingA && isOngoingB) return 1;

                return startMsA - startMsB;
            } else {
                return endMsB - endMsA;
            }
        });

        // Apply search filter
        if (!searchTerm.trim()) return tabEvents;

        const term = searchTerm.toLowerCase();
        return tabEvents.filter((event) => {
            const { startDate, endDate } = getZonedEventDates(event, timezone);
            const text = `${format(startDate, "EEE, MMM dd yyyy")} ${format(startDate, "h:mm a")} ${format(endDate, "h:mm a")} ${event.title} ${event.description || ""} ${event.category || ""}`;
            return text.toLowerCase().includes(term);
        });
    }, [events, activeTab, searchTerm, timezone]);

    return (
        <ol
            className="mt-2 flex h-[calc(100vh-175px)] min-w-[calc(320px-2rem)] flex-col gap-1 overflow-y-auto overflow-x-hidden text-sm leading-6 text-gray-500 pr-1"
        >
            {isLoading ? (
                <p className="py-4 text-center text-xs text-slate-400">Loading events...</p>
            ) : filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                    <EventCard
                        key={event.id}
                        event={event}
                        onSelect={() => onSelectEvent?.()}
                    />
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

function EventCard({
    event,
    onSelect,
}: {
    event: CalendarEvent;
    onSelect?: () => void;
}) {
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const { openModal } = useEventModal();
    const { setCurrentDate } = useRouter();
    const { timezone } = useTimezone();

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

    const { startDate, endDate } = getZonedEventDates(event, timezone);
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
                className={`block p-3 relative group focus-within:bg-(--category-bg-hover) focus-within:text-(--category-text-hover) hover:bg-(--category-bg-hover) hover:text-(--category-text-hover) bg-(--category-bg-light) text-(--category-text) transition-all duration-200 h-full w-full rounded-xl focus:outline-none focus:focus-visible:ring focus:ring-slate-900 focus:ring-offset-2 ${isOngoing
                        ? "ring-2 ring-inset ring-[#165DFC] shadow-xs"
                        : isPast
                            ? "opacity-85"
                            : ""
                    }`}
                onClick={(e) => {
                    e.preventDefault();
                    setCurrentDate(startDate);
                    window.location.hash = "";
                    window.location.hash = event.id;
                    onSelect?.();
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
                <time dateTime={format(startDate, "yyyy-MM-dd")}>
                    {format(startDate, "EEE, MMM dd y")}
                </time>
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
                        className={`${menuIsOpen ? "absolute" : "hidden"
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
