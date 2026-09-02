import { db } from "./database";
import { Querier } from "./queries";
import { CalendarEvent, EventStore } from "./EventStore";

// Compute a recent past date (yesterday 10:00 AM - 11:00 AM)
const yesterdayStart = new Date();
yesterdayStart.setDate(yesterdayStart.getDate() - 1);
yesterdayStart.setHours(10, 0, 0, 0);

const yesterdayEnd = new Date(yesterdayStart);
yesterdayEnd.setHours(11, 0, 0, 0);

const dummyEvents: CalendarEvent[] = [
    {
        id: "sample-dummy-event",
        title: "Sample Event (Dummy)",
        startDateTime: yesterdayStart,
        endDateTime: yesterdayEnd,
        description:
            "This is a sample dummy event to help you explore the calendar. You can edit or delete this anytime.",
        category: "Personal",
        eventStatus: "past",
    },
];

async function seedDatabase() {
    const result = await db.sql`SELECT COUNT(*) as count FROM calendar_events`;
    if (result[0].count === 0) {
        const q = new Querier(db);
        try {
            await Promise.all(dummyEvents.map((e) => q.insert(e)));
            EventStore.fetchEvents();
        } catch (error) {
            console.error("Seeding failed:", error);
        }
    }
}

seedDatabase();
