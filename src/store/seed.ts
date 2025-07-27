import { db } from './database';
import { Querier } from './queries';
import { DBCalendarEvent } from './schema';

const dummyEvents: DBCalendarEvent[] = [
    {
        title: "Leslie Alexander",
        startDateTime: new Date("2024-08-11T13:00"),
        endDateTime: new Date("2024-08-11T14:30"),
        description: "Meeting with Leslie Alexander",
        category: "Work",
        eventStatus: "past",
    },
    {
        title: "Michael Foster",
        startDateTime: new Date("2024-08-20T09:00"),
        endDateTime: new Date("2024-08-20T11:30"),
        description: "Meeting with Michael Foster",
        category: "Reminder",
        eventStatus: "past",
    },
    {
        title: "Dries Vincent",
        startDateTime: new Date("2024-08-20T17:00"),
        endDateTime: new Date("2024-08-20T18:30"),
        description: "Meeting with Dries Vincent",
        category: "Personal",
        eventStatus: "past",
    },
    {
        title: "Leslie Alexander",
        startDateTime: new Date("2024-08-09T13:00"),
        endDateTime: new Date("2024-08-09T14:30"),
        description: "Meeting with Leslie Alexander",
        category: "Meeting",
        eventStatus: "past",
    },
];

async function seedDatabase() {
    let q = new Querier(db)
    for (let e of dummyEvents) {
        q.insert(e)
    }
}

seedDatabase()