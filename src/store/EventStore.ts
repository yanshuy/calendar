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
        q: q,
        state: {
            events: [] as CalendarEvent[],
            isLoading: true,
        },

        subscribers: [] as (() => void)[],
        subscribe: (callback: () => void) => {
            store.subscribers.push(callback);
            callback();
            return () => {
                store.subscribers = store.subscribers.filter(
                    (sub) => sub !== callback,
                );
            };
        },

        currentInterval: { start, end },
        setCurrentInterval: (date: Date) => {
            let start = getUnixTime(startOfMonth(addMonths(date, -1)));
            let end = getUnixTime(endOfMonth(addMonths(date, 1)));
            store.currentInterval = { start, end };
        },

        fetchEvents: async () => {
            store.state.isLoading = true;
            let events = await store.q.getAll();
            store.state = {
                isLoading: false,
                events,
            };
            store.subscribers.forEach((callback) => callback());
        },
        insertEvent: async (event: CalendarEvent) => {
            await store.q.insert(event);
            await store.fetchEvents();
        },
        updateEvent: async (updated: CalendarEvent) => {
            await store.q.update(updated);
            await store.fetchEvents();
        },
        deleteEvent: async (id: string) => {
            await store.q.delete(id);
            await store.fetchEvents();
        },
    };

    store.fetchEvents();

    return store;
}

export const EventStore = NewEventStore(db);
