import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CalendarEvent, dummyEvents } from "../utils/types";
import { initIDB } from "../Idb";
import { useIndexedDB } from "../hooks/useIndexedDB";

interface EventStoreContextType {
    events: CalendarEvent[];
    isLoading: boolean;
    error: Error | null;
    refreshEvents: () => Promise<CalendarEvent[]>;
    addEvents: (event: CalendarEvent | CalendarEvent[]) => Promise<boolean>;
    updateEvent: (event: CalendarEvent) => Promise<boolean>;
    deleteEvent: (id: string) => Promise<boolean>;
    getEvent: (id: string) => CalendarEvent | undefined;
}

const EventStoreContext = createContext<EventStoreContextType | undefined>(undefined);

export const EventStoreProvider = ({ children }: { children: React.ReactNode }) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const { getAll, addItem, updateItem, deleteItem } = useIndexedDB("calendar-events");

    const refreshEvents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const all = await getAll();
            setEvents(all);
            return all;
        } catch (err) {
            const e = err instanceof Error ? err : new Error(String(err));
            setError(e);
            return [];
        } finally {
            addEvents(dummyEvents);
            setIsLoading(false);
        }
    }, [getAll]);

    useEffect(() => {
        const init = async () => {
            try {
                await initIDB();
                await refreshEvents();
            } catch (err) {
                const e = err instanceof Error ? err : new Error(String(err));
                setError(e);
                setIsLoading(false);
            }
        };
        init();
    }, [refreshEvents]);

    const getEvent = useCallback((id: string) => events.find((e) => e.id === id), [events]);

    const addEvents = useCallback(
        async (event: CalendarEvent | CalendarEvent[]) => {
            setError(null);
            try {
                const ok = await addItem(event);
                if (ok) {
                    if (Array.isArray(event)) {
                        setEvents((prev) => [...prev, ...event]);
                    } else {
                        setEvents((prev) => [...prev, event]);
                    }
                }
                return ok;
            } catch (err) {
                const e = err instanceof Error ? err : new Error(String(err));
                setError(e);
                return false;
            }
        },
        [addItem]
    );

    const updateEvent = useCallback(
        async (event: CalendarEvent) => {
            setError(null);
            try {
                const ok = await updateItem(event);
                if (ok) setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)));
                return ok;
            } catch (err) {
                const e = err instanceof Error ? err : new Error(String(err));
                setError(e);
                return false;
            }
        },
        [updateItem]
    );

    const deleteEvent = useCallback(
        async (id: string) => {
            setError(null);
            try {
                const ok = await deleteItem(id);
                if (ok) setEvents((prev) => prev.filter((e) => e.id !== id));
                return ok;
            } catch (err) {
                const e = err instanceof Error ? err : new Error(String(err));
                setError(e);
                return false;
            }
        },
        [deleteItem]
    );

    return (
        <EventStoreContext.Provider
            value={{
                events,
                isLoading,
                error,
                refreshEvents,
                addEvents,
                updateEvent,
                deleteEvent,
                getEvent,
            }}
        >
            {children}
        </EventStoreContext.Provider>
    );
};

export const useEventStore = (): EventStoreContextType => {
    const ctx = useContext(EventStoreContext);
    if (!ctx) throw new Error("useEventStore must be used within EventStoreProvider");
    return ctx;
};
