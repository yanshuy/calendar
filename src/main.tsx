import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import CalendarView from "./CalendarView.tsx";
import { EventModalProvider } from "./context/useEventModal.tsx";
import { ErrorBoundary } from "./utils/ErrorBoundry.tsx";
import { EventStoreProvider } from "./context/useEventStore.tsx";
import { RouterProvider } from "./router/useRouter.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ErrorBoundary>
            <EventStoreProvider>
                <RouterProvider>
                    <EventModalProvider>
                        <CalendarView />
                    </EventModalProvider>
                </RouterProvider>
            </EventStoreProvider>
        </ErrorBoundary>
    </StrictMode>
);
