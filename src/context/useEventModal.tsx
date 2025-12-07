import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { useDialog } from "../hooks/useDialog";
import EventModal from "../components/EventModal";
import { add } from "date-fns";
import { CalendarEvent } from "../store/EventStore";

interface EventModalContextType {
    isOpen: boolean;
    openModal: (event?: Partial<CalendarEvent>) => void;
    closeModal: () => void;
}

const EventModalContext = createContext<EventModalContextType | undefined>(
    undefined,
);

export const EventModalProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [isOpen, setIsOpen, dialogRef] = useDialog(false);
    const [currentEvent, setCurrentEvent] = useState<Partial<CalendarEvent>>(
        {},
    );

    const openModal = useCallback(
        (event?: Partial<CalendarEvent>) => {
            setCurrentEvent(event ?? {});
            setIsOpen(true);
        },
        [setCurrentEvent, setIsOpen],
    );

    function closeModal() {
        setIsOpen(false);
        setCurrentEvent({});
    }

    useEffect(() => {
        const clickHandler = async (e: Event) => {
            if ((e.target as HTMLElement).hasAttribute("data-time")) {
                const elem = e.target as HTMLElement;

                if (elem.id) {
                    openModal();
                    // const event = await getByKey(elem.id);
                    // if (event) setCurrentEvent(event);
                    return;
                }

                const { time } = elem.dataset;
                if (!time) return;
                const date = new Date(time);

                openModal({
                    startDateTime: date,
                    endDateTime: add(date, { minutes: 15 }),
                });
            }
        };

        document.addEventListener("click", clickHandler);

        return () => {
            document.removeEventListener("click", clickHandler);
        };
    }, [openModal]);

    return (
        <EventModalContext.Provider
            value={{
                isOpen,
                openModal,
                closeModal,
            }}
        >
            {children}
            <EventModal
                event={currentEvent}
                isOpen={isOpen}
                closeModal={closeModal}
                dialogRef={dialogRef}
            />
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
