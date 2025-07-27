export const categories = ["Work", "Personal", "Meeting", "Reminder"] as const
export const statuses = ["past", "ongoing", "coming"] as const
export type Categories = typeof categories[number]

export type DBCalendarEvent = {
    id?: number | undefined;
    title: string;
    startDateTime: Date;
    endDateTime: Date;
    description?: string | null;
    eventStatus: "past" | "ongoing" | "coming";
    category?: Categories
}

export type CalendarEvent = {
    id: number;
    title: string;
    startDateTime: Date;
    endDateTime: Date;
    description?: string | null;
    eventStatus: "past" | "ongoing" | "coming";
    category: Categories
}
