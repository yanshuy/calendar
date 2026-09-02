import { useEffect, useState, useCallback, useRef } from "react";
import { format } from "date-fns";
import { useEventStore } from "./useEventStore";

// Play a subtle notification chime using Web Audio API
function playChime() {
    try {
        const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
                .webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
    } catch {
        // Audio playback error or blocked by browser policy
    }
}

const NOTIFIED_STORAGE_KEY = "calendar_notified_event_ids";

function getNotifiedIds(): Set<string> {
    try {
        const raw = sessionStorage.getItem(NOTIFIED_STORAGE_KEY);
        if (raw) {
            return new Set(JSON.parse(raw));
        }
    } catch {
        // Ignore parse error
    }
    return new Set();
}

function saveNotifiedId(id: string) {
    try {
        const set = getNotifiedIds();
        set.add(id);
        sessionStorage.setItem(
            NOTIFIED_STORAGE_KEY,
            JSON.stringify(Array.from(set)),
        );
    } catch {
        // Ignore storage error
    }
}

export function useEventNotifications() {
    const isSupported = typeof window !== "undefined" && "Notification" in window;
    const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
        () => (isSupported ? Notification.permission : "unsupported"),
    );

    const { events } = useEventStore();
    const timeoutsRef = useRef<Map<string, number>>(new Map());

    const requestPermission = useCallback(async () => {
        if (!isSupported) return "unsupported";
        try {
            const res = await Notification.requestPermission();
            setPermission(res);
            return res;
        } catch {
            return "denied";
        }
    }, [isSupported]);

    // Send notification for an event
    const triggerNotification = useCallback(
        async (event: { id: string; title: string; startDateTime: Date; description?: string | null; category?: string }) => {
            if (!isSupported || Notification.permission !== "granted") return;

            saveNotifiedId(event.id);
            playChime();

            const timeStr = format(new Date(event.startDateTime), "p");
            const body = event.description
                ? `${timeStr} • ${event.description}`
                : `${timeStr} • ${event.category || "Scheduled event"}`;

            const options: NotificationOptions = {
                body,
                icon: "/pwa-192x192.png",
                badge: "/favicon.svg",
                tag: `event-${event.id}`,
                data: { eventId: event.id },
            };

            try {
                if ("serviceWorker" in navigator) {
                    const registration = await navigator.serviceWorker.ready;
                    if (registration && registration.showNotification) {
                        await registration.showNotification(event.title, options);
                        return;
                    }
                }
                new Notification(event.title, options);
            } catch {
                try {
                    new Notification(event.title, options);
                } catch {
                    // Notification blocked or failed
                }
            }
        },
        [isSupported],
    );

    // Schedule notifications for upcoming events
    useEffect(() => {
        if (permission !== "granted") return;

        const timeouts = timeoutsRef.current;

        // Clear previous timeouts
        timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
        timeouts.clear();

        const notified = getNotifiedIds();
        const now = Date.now();

        events.forEach((event) => {
            if (notified.has(event.id)) return;

            const startTime = new Date(event.startDateTime).getTime();
            const delay = startTime - now;

            // Trigger if within the next 24 hours, or if within past 30 seconds (just started)
            if (delay >= -30000 && delay <= 24 * 60 * 60 * 1000) {
                if (delay <= 0) {
                    // Trigger immediately
                    triggerNotification(event);
                } else {
                    // Schedule timer
                    const timerId = window.setTimeout(() => {
                        triggerNotification(event);
                        timeouts.delete(event.id);
                    }, delay);
                    timeouts.set(event.id, timerId);
                }
            }
        });

        return () => {
            timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
            timeouts.clear();
        };
    }, [events, permission, triggerNotification]);

    return {
        permission,
        isSupported,
        requestPermission,
    };
}
