import { format, parseISO } from "date-fns";
import { useMemo, useState } from "react";
import { CalendarEvent } from "./utils/types";
import { useEventModal } from "./context/useEventModal";
import { useEventStore } from "./context/useEventStore";
import { useRouter } from "./router/useRouter";

type CalendarSidebarProps = {
    sideViewIsOpen: boolean;
};

export default function CalendarSidebar({ sideViewIsOpen }: CalendarSidebarProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const { events } = useEventStore();
    const filteredEvents = useMemo(
        () =>
            events.filter((event) => {
                const text = `${format(new Date(event.startDateTime), "EEE, MMM dd")} ${format(
                    format(new Date(event.startDateTime), "yyyy-MM-dd'T'HH:mm:ss"),
                    "h:mm a"
                )} - ${format(format(new Date(event.startDateTime), "yyyy-MM-dd'T'HH:mm:ss"), "h:mm a")} ${event.name}`;
                return text.toLowerCase().includes(searchTerm.toLowerCase());
            }),
        [events, searchTerm]
    );

    return (
        <aside
            className={`pt-12 overflow-hidden md:mt-0 transition-all ${sideViewIsOpen ? "min-w-80 max-w-80" : "min-w-0 max-w-0"
                }`}
        >
            <div
                style={{
                    paddingInlineEnd: "1rem",
                }}
                className="[&_>*:not(ol)]:min-w-max"
            >
                <div className="px-1">
                    <div className="flex overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-1 focus-within:ring focus-within:ring-slate-900 focus-within:ring-offset-2">
                        <input
                            type="text"
                            id="search"
                            className="w-full rounded-md bg-slate-50 px-2 outline-none  placeholder:text-slate-400 "
                            placeholder="Search"
                            onChange={(e) => setSearchTerm(e.target.value)}
                            tabIndex={sideViewIsOpen ? 0 : -1}
                        />
                        <label htmlFor="search">
                            <span className="overflow-hidden block size-px">Search</span>

                            <span className="-translate-y-px">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="#000000"
                                    version="1.1"
                                    id="Capa_1"
                                    viewBox="0 0 488.4 488.4"
                                    className="size-8 bg-slate-50 fill-slate-400 py-[.35rem]"
                                >
                                    <g>
                                        <g>
                                            <path d="M0,203.25c0,112.1,91.2,203.2,203.2,203.2c51.6,0,98.8-19.4,134.7-51.2l129.5,129.5c2.4,2.4,5.5,3.6,8.7,3.6    s6.3-1.2,8.7-3.6c4.8-4.8,4.8-12.5,0-17.3l-129.6-129.5c31.8-35.9,51.2-83,51.2-134.7c0-112.1-91.2-203.2-203.2-203.2    S0,91.15,0,203.25z M381.9,203.25c0,98.5-80.2,178.7-178.7,178.7s-178.7-80.2-178.7-178.7s80.2-178.7,178.7-178.7    S381.9,104.65,381.9,203.25z" />
                                        </g>
                                    </g>
                                </svg>
                            </span>
                        </label>
                    </div>
                </div>

                <h2 className="px-1 pt-4 text-base font-semibold text-slate-700">Events</h2>
                <ol
                    className={`l mt-2 flex h-[calc(100vh-135px)] min-w-[calc(320px-2rem)] flex-col gap-1 overflow-x-auto px-1 text-sm leading-6 text-gray-500`}
                >
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((event) => <EventCard key={event.id} event={event} />)
                    ) : (
                        <p>No Events found.</p>
                    )}
                </ol>
            </div>
        </aside>
    );
}

function EventCard({ event }: { event: CalendarEvent }) {
    const [MenuIsOpen, setMenuIsOpen] = useState(false);
    const { openModal } = useEventModal();
    const { setCurrentDate } = useRouter();

    const store = useEventStore()
    async function handleDelete(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Delete event:", event.id);

        const confirmed = window.confirm("Are you sure you want to delete this event?");
        if (!confirmed) return false;
        store.deleteEvent(event.id);
    }

    return (
        <li
            className="mt-1 h-max rounded"
            onMouseLeave={() => {
                setMenuIsOpen(false);
            }}
        >
            {/* .category {
        background-color: var(--category-bg);
        color: var(--category-text);
        transition-property: background-color, color;
        transition-duration: 0.2s;
    }
    .category.light {
        background-color: var(--category-bg-light);
    }
    .category .name {
        color: var(--category-text-name);
    }
    .category:hover,
    .category:focus-within {
        background-color: var(--category-bg-hover);
        color: var(--category-text-hover);
    }
    .category:hover .menu > .dots,
    .category:focus-within .menu > .dots {
        background-color: var(--category-dots-hover);
    } */}
            <div
                data-category={event.category}
                className="block p-3 relative group focus-within:bg-(--category-bg-hover) focus-within:text-(--category-text-hover) hover:bg-(--category-bg-hover) hover:text-(--category-text-hover) bg-(--category-bg-light) text-(--category-text) transition-colors duration-200 h-full w-full rounded-xl focus:outline-none focus:focus-visible:ring focus:ring-slate-900 focus:ring-offset-2"
                onClick={(e) => {
                    e.preventDefault();
                    setCurrentDate(parseISO(event.startDateTime));
                    window.location.hash = "";
                    window.location.hash = event.id;
                }}
                onContextMenu={(e) => {
                    e.preventDefault()
                    setMenuIsOpen(true)
                }}
            >
                <a href={"#" + event.id} className="before:inset-0 before:absolute"></a>
                <time dateTime={format(event.startDateTime, "yyyy-mm-dd")}>
                    {format(event.startDateTime, "EEE, MMM dd y")}
                </time>
                <p className="text-(--category-text-name)">{event.name}</p>
                <span className="mt-0.5">
                    <time dateTime={event.startDateTime}>{format(event.startDateTime, "h:mm a")}</time> -{" "}
                    <time dateTime={event.endDateTime}>{format(event.endDateTime, "h:mm a")}</time>
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
                        className={`${MenuIsOpen ? "absolute" : "hidden"
                            } right-0 top-4 grid w-32 rounded-lg bg-white px-1 py-[0.3rem] text-slate-700 shadow-md`}
                    >
                        <li>
                            <button
                                className="w-full rounded-md px-1 text-left hover:bg-slate-100 focus:bg-slate-100 disabled:opacity-50"
                                disabled={new Date(event.startDateTime) < new Date()}
                                onClick={() => {
                                    openModal(event);
                                }}
                            >
                                Edit
                            </button>
                        </li>
                        <li>
                            <button
                                className="w-full rounded-md px-1 text-left hover:bg-slate-100 focus:bg-slate-100"
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
