export type CalendarEvent = {
    id: string;
    name: string;
    startDateTime: string;
    endDateTime: string;
    description?: string;
    eventStatus: "past" | "ongoing" | "future";
    category: "Work" | "Personal" | "Reminders" | "Meeting";
};

export const dummyEvents: CalendarEvent[] = [
    {
        id: "1",
        name: "Leslie Alexander",
        startDateTime: "2024-08-11T13:00",
        endDateTime: "2024-08-11T14:30",
        description: "Meeting with Leslie Alexander",
        category: "Work",
        eventStatus: "past",
    },
    {
        id: "2",
        name: "Michael Foster",
        startDateTime: "2024-08-20T09:00",
        endDateTime: "2024-08-20T11:30",
        description: "Meeting with Michael Foster",
        category: "Reminders",
        eventStatus: "past",
    },
    {
        id: "3",
        name: "Dries Vincent",
        startDateTime: "2024-08-20T17:00",
        endDateTime: "2024-08-20T18:30",
        description: "Meeting with Dries Vincent",
        category: "Personal",
        eventStatus: "past",
    },
    {
        id: "4",
        name: "Leslie Alexander",
        startDateTime: "2024-08-09T13:00",
        endDateTime: "2024-08-09T14:30",
        description: "Meeting with Leslie Alexander",
        category: "Meeting",
        eventStatus: "past",
    },
];
