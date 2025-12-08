import {
    add,
    differenceInHours,
    differenceInMinutes,
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
            <div className="overflow-clip rounded-t-2xl border border-slate-200 bg-slate-50 min-w-[799px]">
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `${TimeSlotsWidth} repeat(${days.length}, 1fr)`,
                    }}
                    className="sticky top-0 z-10 border-b border-gray-200 bg-slate-50 py-2"
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
                        height: "calc(100vh - 8.725rem)",
                    }}
                    className="scroller"
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
    const totalHours = days.length * 24;
    const pastHours = Math.min(
        Math.max(0, differenceInHours(new Date(), days[0])),
        totalHours - 1,
    );
    const futureHours = totalHours - Math.min(totalHours, pastHours + 1);

    const cellHoverColor = "hover:bg-blue-100/50";

    return (
        <>
            {Array(pastHours)
                .fill(0)
                .map((_, index) => {
                    return (
                        <div
                            key={add(days[0], {
                                hours: index,
                            }).toISOString()}
                            className="grid h-full grid-rows-2 border-b border-l border-slate-200"
                        >
                            <div className="relative grid grid-rows-2 bg-slate-100/90 border-b border-dashed border-slate-200">
                                <StripedBackground />
                                <span
                                    data-time={format(
                                        add(days[0], {
                                            hours: index,
                                            minutes: 0,
                                        }),
                                        "yyyy-MM-dd'T'HH:mm:ss",
                                    )}
                                ></span>
                                <span
                                    data-time={format(
                                        add(days[0], {
                                            hours: index,
                                            minutes: 15,
                                        }),
                                        "yyyy-MM-dd'T'HH:mm:ss",
                                    )}
                                ></span>
                            </div>
                            <div className="relative grid grid-rows-2 bg-slate-100/90">
                                <StripedBackground />
                                <span
                                    data-time={format(
                                        add(days[0], {
                                            hours: index,
                                            minutes: 30,
                                        }),
                                        "yyyy-MM-dd'T'HH:mm:ss",
                                    )}
                                ></span>
                                <span
                                    data-time={format(
                                        add(days[0], {
                                            hours: index,
                                            minutes: 45,
                                        }),
                                        "yyyy-MM-dd'T'HH:mm:ss",
                                    )}
                                ></span>
                            </div>
                        </div>
                    );
                })}

            <div
                key={add(days[0], {
                    hours: pastHours,
                }).toISOString()}
                className="grid h-full grid-rows-2 border-b border-l border-slate-200"
            >
                {differenceInMinutes(
                    new Date(),
                    add(days[0], { hours: pastHours }),
                ) >= 30 ? (
                    <div className="relative grid grid-rows-2 bg-slate-100/90 border-b border-dashed border-slate-200">
                        <StripedBackground />
                        <span
                            data-time={format(
                                add(days[0], {
                                    hours: pastHours,
                                    minutes: 0,
                                }),
                                "yyyy-MM-dd'T'HH:mm:ss",
                            )}
                        ></span>
                        <span
                            data-time={format(
                                add(days[0], {
                                    hours: pastHours,
                                    minutes: 15,
                                }),
                                "yyyy-MM-dd'T'HH:mm:ss",
                            )}
                        ></span>
                    </div>
                ) : (
                    <div className="grid grid-rows-2 border-b border-dashed border-slate-200">
                        <span
                            className={cellHoverColor}
                            data-time={format(
                                add(days[0], {
                                    hours: pastHours,
                                    minutes: 0,
                                }),
                                "yyyy-MM-dd'T'HH:mm:ss",
                            )}
                        ></span>
                        <span
                            className={cellHoverColor}
                            data-time={format(
                                add(days[0], {
                                    hours: pastHours,
                                    minutes: 15,
                                }),
                                "yyyy-MM-dd'T'HH:mm:ss",
                            )}
                        ></span>
                    </div>
                )}
                {differenceInMinutes(
                    new Date(),
                    add(days[0], { hours: pastHours }),
                ) >= 60 ? (
                    <div className="relative grid grid-rows-2 bg-slate-100/90">
                        <StripedBackground />
                        <span
                            data-time={format(
                                add(days[0], {
                                    hours: pastHours,
                                    minutes: 0,
                                }),
                                "yyyy-MM-dd'T'HH:mm:ss",
                            )}
                        ></span>
                        <span
                            data-time={format(
                                add(days[0], {
                                    hours: pastHours,
                                    minutes: 15,
                                }),
                                "yyyy-MM-dd'T'HH:mm:ss",
                            )}
                        ></span>
                    </div>
                ) : (
                    <div className="grid grid-rows-2">
                        <span
                            className={cellHoverColor}
                            data-time={format(
                                add(days[0], {
                                    hours: pastHours,
                                    minutes: 30,
                                }),
                                "yyyy-MM-dd'T'HH:mm:ss",
                            )}
                        ></span>
                        <span
                            className={cellHoverColor}
                            data-time={format(
                                add(days[0], {
                                    hours: pastHours,
                                    minutes: 45,
                                }),
                                "yyyy-MM-dd'T'HH:mm:ss",
                            )}
                        ></span>
                    </div>
                )}
            </div>

            {Array(futureHours)
                .fill(0)
                .map((_, index) => {
                    return (
                        <div
                            key={add(days[0], {
                                hours: index + pastHours + 1,
                            }).toISOString()}
                            className="grid h-full grid-rows-2 border-b border-l border-slate-200"
                        >
                            <div className="grid grid-rows-2 border-b border-dashed border-slate-200">
                                <span
                                    className={cellHoverColor}
                                    data-time={format(
                                        add(days[0], {
                                            hours: index + pastHours + 1,
                                            minutes: 0,
                                        }),
                                        "yyyy-MM-dd'T'HH:mm:ss",
                                    )}
                                ></span>
                                <span
                                    className={cellHoverColor}
                                    data-time={format(
                                        add(days[0], {
                                            hours: index + pastHours + 1,
                                            minutes: 15,
                                        }),
                                        "yyyy-MM-dd'T'HH:mm:ss",
                                    )}
                                ></span>
                            </div>
                            <div className="grid grid-rows-2">
                                <span
                                    className={cellHoverColor}
                                    data-time={format(
                                        add(days[0], {
                                            hours: index + pastHours + 1,
                                            minutes: 30,
                                        }),
                                        "yyyy-MM-dd'T'HH:mm:ss",
                                    )}
                                ></span>
                                <span
                                    className={cellHoverColor}
                                    data-time={format(
                                        add(days[0], {
                                            hours: index + pastHours + 1,
                                            minutes: 45,
                                        }),
                                        "yyyy-MM-dd'T'HH:mm:ss",
                                    )}
                                ></span>
                            </div>
                        </div>
                    );
                })}
        </>
    );
}
