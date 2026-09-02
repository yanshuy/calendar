import { SQLocal } from "sqlocal";

export const db = new SQLocal("database.sqlite3");

export async function createTable() {
    try {
        await db.sql(`
            CREATE TABLE IF NOT EXISTS "calendar_events" (
                "id" TEXT PRIMARY KEY,
                "title" TEXT NOT NULL,
                "startDateTime" TEXT NOT NULL,
                "endDateTime" TEXT NOT NULL,
                "timeZone" TEXT,
                "description" TEXT,
                "eventStatus" TEXT NOT NULL,
                "category" TEXT DEFAULT 'Personal'
            )
        `);

        // Migration: Ensure timeZone column exists on existing databases
        const tableInfo = (await db.sql`PRAGMA table_info("calendar_events")`) as Array<{ name: string }>;
        const hasTimeZone = tableInfo.some((col) => col.name === "timeZone");
        if (!hasTimeZone) {
            await db.sql`ALTER TABLE "calendar_events" ADD COLUMN "timeZone" TEXT`;
        }
    } catch (error) {
        console.error("Database initialization failed:", error);
    }
}

await createTable();
