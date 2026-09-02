import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { CalendarEvent } from "../store/EventStore";

export function getZonedEventDates(
    event: CalendarEvent | Partial<CalendarEvent>,
    activeTimezone: string,
): { startDate: Date; endDate: Date } {
    if (!event.startDateTime || !event.endDateTime) {
        return {
            startDate: new Date(),
            endDate: new Date(),
        };
    }

    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);
    const originTz =
        event.timeZone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        "UTC";

    // If viewing in the origin timezone, no conversion needed
    if (originTz === activeTimezone) {
        return {
            startDate: start,
            endDate: end,
        };
    }

    try {
        // Convert origin wall-clock time to UTC instant, then to active timezone wall-clock time
        const utcStart = fromZonedTime(start, originTz);
        const utcEnd = fromZonedTime(end, originTz);

        const zonedStart = toZonedTime(utcStart, activeTimezone);
        const zonedEnd = toZonedTime(utcEnd, activeTimezone);

        return {
            startDate: zonedStart,
            endDate: zonedEnd,
        };
    } catch {
        return {
            startDate: start,
            endDate: end,
        };
    }
}
