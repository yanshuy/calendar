import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useDialog } from "../hooks/useDialog";
import EventModal from "../components/EventModal";
import { CalendarEvent } from "../utils/types";
import { add, format } from "date-fns";
import { useIndexedDB } from "../hooks/useIndexedDB";

interface EventModalContextType {
    isOpen: boolean;
    openModal: (event?: Partial<CalendarEvent>) => void;
    closeModal: () => void;
}

const EventModalContext = createContext<EventModalContextType | undefined>(undefined);

export const EventModalProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen, dialogRef] = useDialog(false);
    const [currentEvent, setCurrentEvent] = useState<Partial<CalendarEvent>>({});

    const openModal = useCallback(
        (event?: Partial<CalendarEvent>) => {
            setCurrentEvent(event ?? {});
            setIsOpen(true);
        },
        [setCurrentEvent, setIsOpen]
    );

    function closeModal() {
        setIsOpen(false);
        setCurrentEvent({});
    }

    const { getByKey } = useIndexedDB("calendar-events");

    useEffect(() => {
        const clickHandler = async (e: Event) => {
            if ((e.target as HTMLElement).hasAttribute("data-time")) {
                const elem = e.target as HTMLElement;

                if (elem.id) {
                    openModal();
                    const event = await getByKey(elem.id);
                    if (event) setCurrentEvent(event);
                    return;
                }

                const { time } = elem.dataset;

                if (!time) return;

                const date = new Date(time);

                openModal({
                    startDateTime: format(date, "yyyy-MM-dd'T'HH:mm:ss"),
                    endDateTime: format(add(date, { minutes: 15 }), "yyyy-MM-dd'T'HH:mm:ss"),
                });
            }
        };

        document.addEventListener("click", clickHandler);

        return () => {
            document.removeEventListener("click", clickHandler);
        };
    }, [getByKey, openModal]);

    return (
        <EventModalContext.Provider
            value={{
                isOpen,
                openModal,
                closeModal,
            }}
        >
            {children}
            <EventModal event={currentEvent} isOpen={isOpen} closeModal={closeModal} dialogRef={dialogRef} />
        </EventModalContext.Provider>
    );
};

export const useEventModal = (): EventModalContextType => {
    const context = useContext(EventModalContext);
    if (!context) {
        throw new Error("useEventModal must be used within a CalendarProvider");
    }
    return context;
};
