import { addMonths, endOfMonth, getUnixTime, startOfMonth } from "date-fns";
import { Querier } from "./queries";
import { db } from "./database";
import { CalendarEvent } from "./schema";
import { SQLocal } from "sqlocal";

function NewEventStore(db: SQLocal) {
    let q = new Querier(db)
    let date = new Date()

    let start = getUnixTime(startOfMonth(addMonths(date, -1)));
    let end = getUnixTime(endOfMonth(addMonths(date, 1)));

    let store = {
        events: [] as CalendarEvent[],
        currentInterval: { start, end },
        q: q,

        setCurrentInterval(date: Date) {
            let start = getUnixTime(startOfMonth(addMonths(date, -1)));
            let end = getUnixTime(endOfMonth(addMonths(date, 1)));
            this.currentInterval = { start, end }
        },

        async fetchEvents(date: Date) {
            this.setCurrentInterval(date)
            this.events = await this.q.getAll()
            return this.events
        }
    }

    async function populate() {
        store.events = await store.q.getAll()
    }
    populate()

    return store
}

export const EventStore = NewEventStore(db) 