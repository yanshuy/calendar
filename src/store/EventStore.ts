import { addMonths, endOfMonth, getUnixTime, startOfMonth } from "date-fns";
import { Querier } from "./queries";
import { db } from "./database";
import { SQLocal } from "sqlocal";

export const categories = ["Work", "Personal", "Meeting", "Reminder"] as const;
export const statuses = ["past", "ongoing", "coming"] as const;
export type Categories = (typeof categories)[number];
export type Statuses = (typeof statuses)[number];

export type CalendarEvent = {
    id: string;
    title: string;
    startDateTime: Date;
    endDateTime: Date;
    description?: string | null;
    eventStatus: Statuses;
    category: Categories;
};

function NewEventStore(db: SQLocal) {
    let q = new Querier(db);
    let date = new Date();

    let start = getUnixTime(startOfMonth(addMonths(date, -1)));
    let end = getUnixTime(endOfMonth(addMonths(date, 1)));

    let store = {
        events: [] as CalendarEvent[],
        currentInterval: { start, end },
        q: q,

        setCurrentInterval(date: Date) {
            let start = getUnixTime(startOfMonth(addMonths(date, -1)));
            let end = getUnixTime(endOfMonth(addMonths(date, 1)));
            this.currentInterval = { start, end };
        },

        async fetchEvents(date: Date) {
            this.setCurrentInterval(date);
            this.events = await this.q.getAll();
            return this.events;
        },
    };

    async function populate() {
        store.events = await store.q.getAll();
    }
    populate();
    return store;
}

export const EventStore = NewEventStore(db);
