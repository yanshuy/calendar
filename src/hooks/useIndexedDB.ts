// import { useCallback } from "react";
// import { openDB } from "idb";
// import { CalendarEvent } from "../utils/types";
// import { CalendarDB, DB_NAME, DB_VERSION } from "../Idb";

// export function useIndexedDB(storeName: "calendar-events") {
//     const getDB = useCallback(async () => {
//         return openDB<CalendarDB>(DB_NAME, DB_VERSION);
//     }, []);

//     const addItem = useCallback(
//         async (items: CalendarEvent | CalendarEvent[]) => {
//             const db = await getDB();
//             const tx = db.transaction(storeName, "readwrite");
//             const store = tx.objectStore(storeName);
//             if (Array.isArray(items)) {
//                 for (const item of items) {
//                     await store.add(item);
//                 }
//             } else {
//                 await store.add(items);
//             }
//             await tx.done;
//             return true;
//         },
//         [getDB, storeName]
//     );

//     const getAll = useCallback(async () => {
//         const db = await getDB();
//         const tx = db.transaction(storeName, "readonly");
//         const store = tx.objectStore(storeName);
//         return store.getAll();
//     }, [getDB, storeName]);

//     const getByKey = useCallback(
//         async (key: IDBKeyRange | string) => {
//             const db = await getDB();
//             const tx = db.transaction(storeName, "readonly");
//             const store = tx.objectStore(storeName);
//             return store.get(key);
//         },
//         [getDB, storeName]
//     );

//     const updateItem = useCallback(
//         async (item: CalendarEvent) => {
//             const db = await getDB();
//             const tx = db.transaction(storeName, "readwrite");
//             const store = tx.objectStore(storeName);
//             await store.put(item);
//             await tx.done;
//             return true;
//         },
//         [getDB, storeName]
//     );

//     const deleteItem = useCallback(
//         async (key: IDBKeyRange | string) => {
//             const db = await getDB();
//             const tx = db.transaction(storeName, "readwrite");
//             const store = tx.objectStore(storeName);
//             await store.delete(key);
//             await tx.done;
//             return true;
//         },
//         [getDB, storeName]
//     );

//     // const getByIndex = useCallback(
//     //     async (indexName: string, value: IDBKeyRange | null | undefined) => {
//     //         const db = await getDB();
//     //         const tx = db.transaction(storeName, "readonly");
//     //         const store = tx.objectStore(storeName);
//     //         const index = store.index(indexName);
//     //         return index.getAll(value);
//     //     },
//     //     [getDB, storeName]
//     // );

//     return {
//         addItem,
//         getAll,
//         getByKey,
//         updateItem,
//         deleteItem,
//     };
// }
