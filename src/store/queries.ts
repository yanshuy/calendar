import { SQLocal } from "sqlocal";
import { format } from "date-fns";
import { CalendarEvent, categories } from "./EventStore";

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
                startDateTime: new Date(e.startDateTime),
                endDateTime: new Date(e.endDateTime),
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
            startDateTime: new Date(event[0].startDateTime),
            endDateTime: new Date(event[0].endDateTime),
        } as CalendarEvent;
    }

    async insert(event: CalendarEvent) {
        const id = crypto.randomUUID();
        const startDateTime = format(
            new Date(event.startDateTime),
            "yyyy-MM-dd'T'HH:mm:ss",
        );
        const endDateTime = format(
            new Date(event.endDateTime),
            "yyyy-MM-dd'T'HH:mm:ss",
        );
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const category = event.category ? event.category : categories[1];

        return this.db.sql`
          INSERT INTO calendar_events (id, title, description, startDateTime, endDateTime, timeZone, eventStatus, category)
          VALUES (${id}, ${event.title}, ${event.description}, ${startDateTime}, ${endDateTime}, ${timeZone}, ${event.eventStatus}, ${category})`;
    }

    async update(event: CalendarEvent) {
        const startDateTime = format(
            new Date(event.startDateTime),
            "yyyy-MM-dd'T'HH:mm:ss",
        );
        const endDateTime = format(
            new Date(event.endDateTime),
            "yyyy-MM-dd'T'HH:mm:ss",
        );
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return this.db.sql`
            UPDATE calendar_events
            SET title = ${event.title},
            description = ${event.description},
            startDateTime = ${startDateTime},
            endDateTime = ${endDateTime},
            timeZone = ${timeZone},
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
