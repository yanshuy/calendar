// import { DBSchema, openDB } from "idb";
// import { CalendarEvent } from "./utils/types";

// export interface CalendarDB extends DBSchema {
//     "calendar-events": {
//         key: string;
//         value: CalendarEvent;
//     };
// }

// export const DB_VERSION = 1;
// export const DB_NAME = "CalendarDB";

// export async function initIDB() {
//     const db = await openDB<CalendarDB>("CalendarDB", DB_VERSION, {
//         upgrade(db, oldVersion: number) {
//             switch (oldVersion) {
//                 case 0: {
//                     db.createObjectStore("calendar-events", {
//                         keyPath: "id",
//                         autoIncrement: true,
//                     });
//                 }
//             }
//         },
//     });

//     db.onversionchange = () => {
//         db.close();
//         alert("Database is outdated, please reload the page.");
//     };

//     return db;
// }
