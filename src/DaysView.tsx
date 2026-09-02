import {
    add,
    endOfDay,
    format,
    interval,
    isSameDay,
    isWithinInterval,
    startOfToday,
} from "date-fns";
import { useEffect } from "react";
import EventSticker from "./components/EventSticker";
import { observer } from "./utils/intersectionObserver";
import { useRouter } from "./router/useRouter";
import { flushSync } from "react-dom";
import { useUrlHash } from "./router/hooks";
import { EventStore } from "./store/EventStore";
import { useEventStore } from "./hooks/useEventStore";

const TimeSlotsWidth = "75px";
const CellsHeight = "120px";

type DaysViewProps = {
    days: Date[];
    currentHourRef: React.RefObject<HTMLTimeElement | null>;
};

const DaysView = ({ days, currentHourRef }: DaysViewProps) => {
    const today = startOfToday();
    const currentHour = new Date().getHours();

    return (
        <>
            <div className={`overflow-clip rounded-t-2xl border border-slate-200 bg-slate-50 flex flex-col h-full min-h-0 flex-1 ${days.length === 1 ? "w-full min-w-0" : "min-w-[650px] md:min-w-[799px]"}`}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `${TimeSlotsWidth} repeat(${days.length}, 1fr)`,
                    }}
                    className="sticky top-0 z-10 border-b border-gray-200 bg-slate-50 py-2 shrink-0"
                >
                    <div></div>
                    {/* DayCells  */}
                    {days.map((day) => (
                        <div
                            key={format(day, "yyyy-MM-dd")}
                            className="flex items-center justify-center p-2 text-slate-400"
                        >
                            {days.length == 1
                                ? format(day, "EEEE")
                                : format(day, "EEE")}
                            <time
                                dateTime={format(day, "yyyy-MM-dd")}
                                className={`${
                                    isSameDay(day, today)
                                        ? "ml-1 bg-blue-600 text-white"
                                        : "text-slate-700"
                                } flex size-7 items-center justify-center rounded-[50%]`}
                            >
                                {format(day, "dd")}
                            </time>
                        </div>
                    ))}
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateAreas: `
                        "timeSlots buffer"
                        "timeSlots cells"
                        `,
                        gridTemplateColumns: `${TimeSlotsWidth} 1fr`,
                        overflowY: "auto",
                        overscrollBehavior: "contain",
                        scrollBehavior: "smooth",
                        scrollPadding: "2.5rem",
                    }}
                    className="scroller flex-1 min-h-0"
                >
                    <div
                        style={{
                            gridArea: "timeSlots",
                            display: "grid",
                            gridTemplateRows: `repeat(48,60px)`,
                            alignItems: "center",
                        }}
                    >
                        {/* TimeSlots */}
                        {[
                            "12 AM",
                            "1 AM",
                            "2 AM",
                            "3 AM",
                            "4 AM",
                            "5 AM",
                            "6 AM",
                            "7 AM",
                            "8 AM",
                            "9 AM",
                            "10 AM",
                            "11 AM",
                            "12 PM",
                            "1 PM",
                            "2 PM",
                            "3 PM",
                            "4 PM",
                            "5 PM",
                            "6 PM",
                            "7 PM",
                            "8 PM",
                            "9 PM",
                            "10 PM",
                            "11 PM",
                        ].map((time, index) => (
                            <time
                                dateTime={time}
                                key={time}
                                className="row-span-2 flex justify-end self-start p-3 text-sm text-slate-400 font-medium"
                                ref={
                                    currentHour ==
                                    add(days[0], {
                                        hours: index,
                                    }).getHours()
                                        ? currentHourRef
                                        : null
                                }
                            >
                                {time}
                            </time>
                        ))}
                    </div>
                    <div
                        style={{ gridArea: "buffer", height: "23px" }}
                        className="grid grid-flow-col"
                    >
                        {Array(days.length)
                            .fill(0)
                            .map((_, index) => (
                                <div
                                    key={index}
                                    className="relative h-full border-b border-l border-slate-200 bg-slate-100/90"
                                >
                                    <span className="absolute h-full w-full">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="100%"
                                            height="100%"
                                        >
                                            <defs>
                                                <pattern
                                                    id="pattern_LotO"
                                                    patternUnits="userSpaceOnUse"
                                                    width="15"
                                                    height="15"
                                                    patternTransform="rotate(45)"
                                                >
                                                    <line
                                                        x1="0"
                                                        y="0"
                                                        x2="0"
                                                        y2="15"
                                                        stroke="#94a3b833"
                                                        strokeWidth="2"
                                                    />
                                                </pattern>
                                            </defs>
                                            <rect
                                                width="100%"
                                                height="100%"
                                                fill="url(#pattern_LotO)"
                                                opacity="1"
                                            />
                                        </svg>
                                    </span>
                                </div>
                            ))}
                    </div>
                    <div
                        style={{
                            position: "relative",
                            display: "grid",
                            gridArea: "cells",
                            gridTemplateRows: `repeat(24, ${CellsHeight})`,
                            gridAutoFlow: "column",
                        }}
                    >
                        <RenderCells days={days} />
                        <EventsRenderer days={days} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default DaysView;

export const EventsRenderer = ({ days }: { days: Date[] }) => {
    const [hash] = useUrlHash();
    const { setCurrentDate } = useRouter();

    useEffect(() => {
        async function handleHashChange() {
            const eventId = hash.substring(1);
            if (!eventId) return;

            const event = await EventStore.q.getById(eventId);
            if (!event) return;

            const eventDate = event.startDateTime;
            flushSync(() => setCurrentDate(eventDate));

            const element = document.getElementById(eventId);
            element?.scrollIntoView({ behavior: "smooth" });
            if (element) observer.observe(element);
        }

        handleHashChange();
    }, [hash, setCurrentDate]);

    const currentDays = interval(days[0], endOfDay(days[days.length - 1]));
    const { events } = useEventStore();
    const currentDaysEvents = events.filter((event) =>
        isWithinInterval(event.startDateTime, currentDays),
    );

    return (
        <>
            {currentDaysEvents.map((event) => (
                <EventSticker key={event.id} days={days} event={event} />
            ))}
        </>
    );
};

const StripedBackground = () => {
    return (
        <span className="absolute h-full w-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                <defs>
                    <pattern
                        id="pattern_LotO"
                        patternUnits="userSpaceOnUse"
                        width="15"
                        height="15"
                        patternTransform="rotate(45)"
                    >
                        <line
                            x1="0"
                            y="0"
                            x2="0"
                            y2="15"
                            stroke="#94A3B8"
                            strokeWidth="2"
                        />
                    </pattern>
                </defs>
                <rect
                    width="100%"
                    height="100%"
                    fill="url(#pattern_LotO)"
                    opacity="1"
                />
            </svg>
        </span>
    );
};

function RenderCells({ days }: { days: Date[] }) {
    const now = new Date();
    const cellHoverColor = "hover:bg-blue-100/50 cursor-pointer";

    return (
        <>
            {days.flatMap((day) => {
                const year = day.getFullYear();
                const month = day.getMonth();
                const date = day.getDate();

                return Array.from({ length: 24 }, (_, hour) => {
                    const slotMid = new Date(year, month, date, hour, 30, 0);
                    const slotEnd = new Date(year, month, date, hour + 1, 0, 0);

                    const isFirstHalfPast = slotMid <= now;
                    const isSecondHalfPast = slotEnd <= now;

                    const time00 = format(
                        new Date(year, month, date, hour, 0, 0),
                        "yyyy-MM-dd'T'HH:mm:ss",
                    );
                    const time15 = format(
                        new Date(year, month, date, hour, 15, 0),
                        "yyyy-MM-dd'T'HH:mm:ss",
                    );
                    const time30 = format(
                        new Date(year, month, date, hour, 30, 0),
                        "yyyy-MM-dd'T'HH:mm:ss",
                    );
                    const time45 = format(
                        new Date(year, month, date, hour, 45, 0),
                        "yyyy-MM-dd'T'HH:mm:ss",
                    );

                    return (
                        <div
                            key={`${year}-${month}-${date}-${hour}`}
                            className="grid h-full grid-rows-2 border-b border-l border-slate-200"
                        >
                            {/* First half-hour (0-30 min) */}
                            {isFirstHalfPast ? (
                                <div className="relative grid grid-rows-2 bg-slate-100/90 border-b border-dashed border-slate-200">
                                    <StripedBackground />
                                    <span data-time={time00}></span>
                                    <span data-time={time15}></span>
                                </div>
                            ) : (
                                <div className="grid grid-rows-2 border-b border-dashed border-slate-200">
                                    <span
                                        className={cellHoverColor}
                                        data-time={time00}
                                    ></span>
                                    <span
                                        className={cellHoverColor}
                                        data-time={time15}
                                    ></span>
                                </div>
                            )}

                            {/* Second half-hour (30-60 min) */}
                            {isSecondHalfPast ? (
                                <div className="relative grid grid-rows-2 bg-slate-100/90">
                                    <StripedBackground />
                                    <span data-time={time30}></span>
                                    <span data-time={time45}></span>
                                </div>
                            ) : (
                                <div className="grid grid-rows-2">
                                    <span
                                        className={cellHoverColor}
                                        data-time={time30}
                                    ></span>
                                    <span
                                        className={cellHoverColor}
                                        data-time={time45}
                                    ></span>
                                </div>
                            )}
                        </div>
                    );
                });
            })}
        </>
    );
}
