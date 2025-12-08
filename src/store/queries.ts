import { SQLocal } from "sqlocal";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { CalendarEvent, categories } from "./EventStore";
import { getUnixTime } from "date-fns";
import { timeZone } from "../main";

export class Querier {
    db: SQLocal;

    constructor(db: SQLocal) {
        this.db = db;
    }

    async getAll() {
        let events = await this.db.sql`SELECT * FROM calendar_events`;
        events = events.map((e) => {
            return {
                ...e,
                startDateTime: toZonedTime(
                    new Date(e.startDateTime * 1000),
                    timeZone,
                ),
                endDateTime: toZonedTime(
                    new Date(e.endDateTime * 1000),
                    timeZone,
                ),
            };
        });
        return events as CalendarEvent[];
    }

    async getById(id: string) {
        let event = await this.db
            .sql`SELECT * FROM calendar_events WHERE id = ${id}`;
        if (!event.length) return null;

        return {
            ...event[0],
            startDateTime: toZonedTime(
                new Date(event[0].startDateTime * 1000),
                timeZone,
            ),
            endDateTime: toZonedTime(
                new Date(event[0].endDateTime * 1000),
                timeZone,
            ),
        } as CalendarEvent;
    }

    async insert(event: CalendarEvent) {
        const id = crypto.randomUUID();
        let startDateTime = getUnixTime(
            fromZonedTime(event.startDateTime, timeZone),
        );
        let endDateTime = getUnixTime(
            fromZonedTime(event.endDateTime, timeZone),
        );
        let category = event.category ? event.category : categories[1];

        return this.db.sql`
          INSERT INTO calendar_events (id, title, description, startDateTime, endDateTime, eventStatus, category)
          VALUES (${id}, ${event.title}, ${event.description}, ${startDateTime}, ${endDateTime}, ${event.eventStatus}, ${category})`;
    }

    async update(event: CalendarEvent) {
        let startDateTime = getUnixTime(
            fromZonedTime(event.startDateTime, timeZone),
        );
        let endDateTime = getUnixTime(
            fromZonedTime(event.endDateTime, timeZone),
        );
        return this.db.sql`
            UPDATE calendar_events
            SET title = ${event.title},
            description = ${event.description},
            startDateTime = ${startDateTime},
            endDateTime = ${endDateTime},
            eventStatus = ${event.eventStatus},
            category = ${event.category}
            WHERE id = ${event.id}`;
    }

    async delete(eventId: string) {
        await this.db.sql`
            DELETE FROM calendar_events
            WHERE id = ${eventId}`;
    }
}
