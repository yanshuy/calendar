import {
    add,
    eachDayOfInterval,
    endOfISOWeek,
    endOfMonth,
    format,
    getDay,
    isEqual,
    isSameDay,
    isSameMonth,
    isToday,
    parse,
    startOfISOWeek,
} from "date-fns";
import { useState } from "react";
import { useRouter } from "./router/useRouter";
import { EventStore } from "./store/EventStore";

const colStartClasses = [
    "",
    "col-start-2",
    "col-start-3",
    "col-start-4",
    "col-start-5",
    "col-start-6",
    "col-start-7",
];

function classNames(...classes: (string | boolean)[]) {
    return classes.filter(Boolean).join(" ");
}

export default function Calendar() {
    const { currentDate, setCurrentDate } = useRouter();
    const [currentMonth, setCurrentMonth] = useState(
        format(currentDate, "MMM-yyyy"),
    );
    const currentMonthFirstDay = parse(currentMonth, "MMM-yyyy", new Date());

    const days = eachDayOfInterval({
        start: startOfISOWeek(currentMonthFirstDay),
        end: endOfISOWeek(endOfMonth(currentMonthFirstDay)),
    });

    function previousMonth() {
        const firstDayNextMonth = add(currentMonthFirstDay, { months: -1 });
        setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
    }

    function nextMonth() {
        const firstDayNextMonth = add(currentMonthFirstDay, { months: 1 });
        setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
    }

    return (
        <div className="absolute top-16 z-50 rounded-lg border border-slate-200 bg-white p-5 pb-2 shadow-2xl">
            <div className="mx-auto max-w-md md:max-w-4xl">
                <div className="md:grid">
                    <div className="min-w-[330px]">
                        <div className="flex items-center justify-between pb-2">
                            <h2 className="text-xl font-semibold text-slate-900">
                                {format(currentMonthFirstDay, "MMMM yyyy")}
                            </h2>
                            <div className="flex">
                                <button
                                    type="button"
                                    onClick={previousMonth}
                                    className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-500 hover:text-gray-900"
                                >
                                    <span className="sr-only">
                                        Previous month
                                    </span>
                                    <div className="h-5 w-5" aria-hidden="true">
                                        <svg
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            role="img"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M13.4806 15.9941C13.8398 15.6529 13.8398 15.0998 13.4806 14.7586L8.47062 10L13.4806 5.24142C13.8398 4.90024 13.8398 4.34707 13.4806 4.00589C13.1214 3.66471 12.539 3.66471 12.1798 4.00589L6.51941 9.38223C6.1602 9.72342 6.1602 10.2766 6.51941 10.6178L12.1798 15.9941C12.539 16.3353 13.1214 16.3353 13.4806 15.9941Z"
                                                fill="currentColor"
                                            ></path>
                                        </svg>
                                    </div>
                                </button>
                                <button
                                    onClick={nextMonth}
                                    type="button"
                                    className="-my-1.5 -mr-1.5 flex flex-none items-center justify-center p-1.5 text-gray-500 hover:text-gray-900"
                                >
                                    <span className="sr-only">Next month</span>
                                    <div className="h-5 w-5" aria-hidden="true">
                                        <svg
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            role="img"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M6.51941 15.9941C6.1602 15.6529 6.1602 15.0998 6.51941 14.7586L11.5294 10L6.51941 5.24142C6.1602 4.90024 6.1602 4.34707 6.51941 4.00589C6.87862 3.66471 7.46101 3.66471 7.82022 4.00589L13.4806 9.38223C13.8398 9.72342 13.8398 10.2766 13.4806 10.6178L7.82022 15.9941C7.46101 16.3353 6.87862 16.3353 6.51941 15.9941Z"
                                                fill="currentColor"
                                            ></path>
                                        </svg>
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div className="mt-5 grid grid-cols-7 text-center text-base font-semibold leading-6 text-slate-500">
                            <div>M</div>
                            <div>T</div>
                            <div>W</div>
                            <div>T</div>
                            <div>F</div>
                            <div>S</div>
                            <div>S</div>
                        </div>
                        <div className="mt-2 grid grid-cols-7 text-sm">
                            {days.map((day, dayIdx) => (
                                <div
                                    key={day.toString()}
                                    className={classNames(
                                        dayIdx === 0 &&
                                            colStartClasses[getDay(day) - 1],
                                        "py-1.5",
                                    )}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCurrentDate(day);
                                        }}
                                        className={classNames(
                                            isEqual(day, currentDate) &&
                                                "text-white",
                                            !isEqual(day, currentDate) &&
                                                isToday(day) &&
                                                "text-blue-500",
                                            !isEqual(day, currentDate) &&
                                                !isToday(day) &&
                                                isSameMonth(
                                                    day,
                                                    currentMonthFirstDay,
                                                ) &&
                                                "text-slate-900",
                                            !isEqual(day, currentDate) &&
                                                !isToday(day) &&
                                                !isSameMonth(
                                                    day,
                                                    currentMonthFirstDay,
                                                ) &&
                                                "text-slate-400",
                                            isEqual(day, currentDate) &&
                                                isToday(day) &&
                                                "bg-blue-500",
                                            isEqual(day, currentDate) &&
                                                !isToday(day) &&
                                                "bg-gray-900",
                                            !isEqual(day, currentDate) &&
                                                "hover:bg-gray-200",
                                            (isEqual(day, currentDate) ||
                                                isToday(day)) &&
                                                "font-semibold",
                                            "mx-auto flex h-8 w-8 items-center justify-center rounded-full font-medium",
                                        )}
                                    >
                                        <time
                                            dateTime={format(day, "yyyy-MM-dd")}
                                        >
                                            {format(day, "d")}
                                        </time>
                                    </button>

                                    <EventDot day={day} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EventDot({ day }: { day: Date }) {
    const events = EventStore.events;
    const hasEvents = events.some((event) =>
        isSameDay(event.startDateTime, day),
    );
    return (
        <div className="mx-auto mt-1 h-1 w-1">
            {hasEvents && (
                <div className="h-1 w-1 rounded-full bg-sky-500"></div>
            )}
        </div>
    );
}
