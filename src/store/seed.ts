import { db } from "./database";
import { Querier } from "./queries";
import { CalendarEvent } from "./EventStore";

const dummyEvents: CalendarEvent[] = [
    {
        id: "1",
        title: "Leslie Alexander",
        startDateTime: new Date("2024-08-11T13:00"),
        endDateTime: new Date("2024-08-11T14:30"),
        description: "Meeting with Leslie Alexander",
        category: "Work",
        eventStatus: "past",
    },
    {
        id: "2",
        title: "Michael Foster",
        startDateTime: new Date("2024-08-20T09:00"),
        endDateTime: new Date("2024-08-20T11:30"),
        description: "Meeting with Michael Foster",
        category: "Reminder",
        eventStatus: "past",
    },
    {
        id: "3",
        title: "Dries Vincent",
        startDateTime: new Date("2024-08-20T17:00"),
        endDateTime: new Date("2024-08-20T18:30"),
        description: "Meeting with Dries Vincent",
        category: "Personal",
        eventStatus: "past",
    },
    {
        id: "4",
        title: "Leslie Alexander",
        startDateTime: new Date("2024-08-09T13:00"),
        endDateTime: new Date("2024-08-09T14:30"),
        description: "Meeting with Leslie Alexander",
        category: "Meeting",
        eventStatus: "past",
    },
];

async function seedDatabase() {
    const result = await db.sql`SELECT COUNT(*) as count FROM calendar_events`;
    if (result[0].count === 0) {
        let q = new Querier(db);
        try {
            await Promise.all(dummyEvents.map((e) => q.insert(e)));
        } catch (error) {
            console.error("Seeding failed:", error);
        }
    }
}

seedDatabase();
