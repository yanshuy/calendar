import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import CalendarView from "./CalendarView.tsx";
import { EventModalProvider } from "./context/useEventModal.tsx";
import { ErrorBoundary } from "./utils/ErrorBoundry.tsx";
import { CalendarProvider } from "./context/useCalendar.tsx";
import { EventStoreProvider } from "./context/useEventStore.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ErrorBoundary>
            <EventStoreProvider>
                <CalendarProvider>
                    <EventModalProvider>
                        <CalendarView />
                    </EventModalProvider>
                </CalendarProvider>
            </EventStoreProvider>
        </ErrorBoundary>
    </StrictMode>
);
