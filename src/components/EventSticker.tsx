import {
    endOfDay,
    format,
    interval,
    isWithinInterval,
    startOfDay,
} from "date-fns";
import { CalendarEvent } from "../store/EventStore";

type EventStickersProps = {
    days: Date[];
    event: CalendarEvent;
};

const EventSticker = ({ days, event }: EventStickersProps) => {
    const startColNo =
        days.findIndex((day) =>
            isWithinInterval(
                event.endDateTime,
                interval(startOfDay(day), endOfDay(day)),
            ),
        ) + 1;

    const top =
        ((new Date(event.startDateTime).getTime() -
            startOfDay(new Date(event.startDateTime)).getTime()) *
            2) /
        1000 /
        60;

    const height =
        ((new Date(event.endDateTime).getTime() -
            new Date(event.startDateTime).getTime()) *
            2) /
        (1000 * 60);

    const scheduledTime = `${format(event.startDateTime, "h:mm")} to ${format(event.endDateTime, "h:mm")}`;

    return (
        <>
            <div
                id={event.id + ""}
                style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    gridColumnStart: startColNo,
                    gridColumnEnd: startColNo + 1,
                }}
                key={event.startDateTime.toString()}
                data-time={event.startDateTime.toString()}
                className="absolute w-full bg-transparent p-[0.15rem] sticker"
            >
                <div
                    data-category={event.category}
                    className={`
                        pointer-events-none flex h-full w-full flex-col gap-0 rounded-lg px-2
                        transition-colors duration-200
                        bg-(--category-bg) text-(--category-text)
                        hover:bg-(--category-bg-hover) hover:text-(--category-text-hover)
                        focus-within:bg-(--category-bg-hover) focus-within:text-(--category-text-hover)
                        ${height > 45 ? "p-2" : ""}
                    `}
                >
                    <p
                        className={`text-(--category-text-name) text-sm ${height > 60 ? "" : "truncate"}`}
                    >
                        {event.title}
                    </p>
                    {height >= 60 && (
                        <time
                            className="truncate text-sm"
                            dateTime={scheduledTime}
                        >
                            {scheduledTime}
                        </time>
                    )}
                </div>
            </div>
        </>
    );
};

export default EventSticker;
