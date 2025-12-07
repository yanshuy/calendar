import { SQLocal } from "sqlocal";

export const db = new SQLocal("database.sqlite3");

export async function createTable() {
    try {
        await db.sql(`
            CREATE TABLE IF NOT EXISTS "calendar_events" (
                "id" TEXT PRIMARY KEY,
                "title" TEXT NOT NULL,
                "startDateTime" INTEGER NOT NULL,
                "endDateTime" INTEGER NOT NULL,
                "description" TEXT,
                "eventStatus" TEXT NOT NULL,
                "category" TEXT DEFAULT 'Personal'
            )
        `);
    } catch (error) {
        console.error("Database initialization failed:", error);
    }
}

await createTable();
