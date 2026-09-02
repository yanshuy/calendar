import { format } from "date-fns";
import { CalendarEvent } from "../store/EventStore";
import { useTimezone } from "../context/TimezoneContext";
import { getZonedEventDates } from "../utils/timezone";

type EventStickersProps = {
    days: Date[];
    event: CalendarEvent;
};

const EventSticker = ({ days, event }: EventStickersProps) => {
    const { timezone } = useTimezone();
    const { startDate, endDate } = getZonedEventDates(event, timezone);

    const startColNo =
        days.findIndex(
            (day) =>
                startDate.getFullYear() === day.getFullYear() &&
                startDate.getMonth() === day.getMonth() &&
                startDate.getDate() === day.getDate(),
        ) + 1;

    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const top = startMinutes * 2;

    const durationMinutes = Math.max(
        15,
        (endDate.getTime() - startDate.getTime()) / (1000 * 60),
    );
    const height = durationMinutes * 2;

    const scheduledTime = `${format(startDate, "h:mm a")} to ${format(endDate, "h:mm a")}`;

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
