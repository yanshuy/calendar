import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import CalendarView from "./CalendarView.tsx";
import { EventModalProvider } from "./context/useEventModal.tsx";
import { ErrorBoundary } from "./utils/ErrorBoundry.tsx";
import { RouterProvider } from "./router/useRouter.tsx";
import { registerSW } from "virtual:pwa-register";
import "./store/database.ts";
import "./store/seed.ts";

import { TimezoneProvider } from "./context/TimezoneContext.tsx";

export const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

if (import.meta.env.PROD) {
    registerSW({ immediate: true });
} else if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
            registration.unregister();
        }
    });
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ErrorBoundary>
            <TimezoneProvider>
                <RouterProvider>
                    <EventModalProvider>
                        <CalendarView />
                    </EventModalProvider>
                </RouterProvider>
            </TimezoneProvider>
        </ErrorBoundary>
    </StrictMode>,
);
