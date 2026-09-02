import { useEffect, useState, useCallback, useRef } from "react";
import { format } from "date-fns";
import { useEventStore } from "./useEventStore";

// Play a pleasant notification chime using Web Audio API
function playChime() {
    try {
        const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
                .webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        if (ctx.state === "suspended") {
            ctx.resume().catch(() => {});
        }

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.4);
    } catch {
        // Blocked by policy or not supported
    }
}

const NOTIFIED_STORAGE_KEY = "calendar_notified_event_keys";

function getNotifiedKeys(): Set<string> {
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

function saveNotifiedKey(key: string) {
    try {
        const set = getNotifiedKeys();
        set.add(key);
        sessionStorage.setItem(
            NOTIFIED_STORAGE_KEY,
            JSON.stringify(Array.from(set)),
        );
    } catch {
        // Ignore storage error
    }
}

export type InAppToast = {
    id: string;
    title: string;
    time: string;
    description?: string | null;
};

export function useEventNotifications() {
    const isSupported = typeof window !== "undefined" && "Notification" in window;
    const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
        () => (isSupported ? Notification.permission : "unsupported"),
    );
    const [activeToast, setActiveToast] = useState<InAppToast | null>(null);

    const { events } = useEventStore();
    const timeoutsRef = useRef<Map<string, number>>(new Map());

    const requestPermission = useCallback(async () => {
        if (!isSupported) return "unsupported";
        try {
            const res = await Notification.requestPermission();
            setPermission(res);
            console.log("[Notifications] Permission status:", res);
            return res;
        } catch (err) {
            console.error("[Notifications] Permission error:", err);
            return "denied";
        }
    }, [isSupported]);

    // Send notification for an event
    const triggerNotification = useCallback(
        (event: {
            id: string;
            title: string;
            startDateTime: Date;
            endDateTime: Date;
            description?: string | null;
            category?: string;
        }) => {
            const startTime = new Date(event.startDateTime).getTime();
            const notificationKey = `${event.id}_${startTime}`;

            saveNotifiedKey(notificationKey);
            playChime();

            const timeStr = `${format(new Date(event.startDateTime), "p")} - ${format(new Date(event.endDateTime), "p")}`;
            const body = event.description
                ? `${timeStr}\n${event.description}`
                : `${timeStr} • ${event.category || "Scheduled event"}`;

            // Show in-app visual toast
            setActiveToast({
                id: event.id,
                title: event.title,
                time: timeStr,
                description: event.description,
            });

            const currentPerm = typeof window !== "undefined" && "Notification" in window
                ? Notification.permission
                : "denied";

            if (currentPerm !== "granted") {
                console.log("[Notifications] In-app alert shown (Desktop permission not granted yet):", event.title);
                return;
            }

            const options: NotificationOptions = {
                body,
                icon: "/pwa-192x192.png",
                badge: "/favicon.svg",
                tag: `event-${event.id}`,
                requireInteraction: true,
            };

            console.log("[Notifications] Dispatching system notification:", event.title, options);

            // 1. Try direct Window Notification first (synchronous & never hangs)
            try {
                new Notification(event.title, options);
            } catch (err) {
                console.warn("[Notifications] Direct Notification failed, trying Service Worker:", err);
            }

            // 2. Also try Service Worker if active (for mobile / PWA background)
            if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready
                    .then((reg) => {
                        if (reg && reg.showNotification) {
                            reg.showNotification(event.title, options).catch(() => {});
                        }
                    })
                    .catch(() => {});
            }
        },
        [],
    );

    // Schedule notifications for upcoming events
    useEffect(() => {
        const currentPerm = isSupported ? Notification.permission : "unsupported";
        if (currentPerm !== permission) {
            setPermission(currentPerm);
        }

        const timeouts = timeoutsRef.current;

        // Clear previous timeouts
        timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
        timeouts.clear();

        const checkAndScheduleEvents = () => {
            const notifiedKeys = getNotifiedKeys();
            const now = Date.now();

            events.forEach((event) => {
                const startTime = new Date(event.startDateTime).getTime();
                const notificationKey = `${event.id}_${startTime}`;

                if (notifiedKeys.has(notificationKey)) return;

                const delay = startTime - now;

                // If event starts within the next 24 hours, or if it just started within the last 60 seconds
                if (delay >= -60000 && delay <= 24 * 60 * 60 * 1000) {
                    if (delay <= 1500) {
                        // Trigger now!
                        triggerNotification(event);
                    } else if (!timeouts.has(notificationKey)) {
                        // Schedule timer
                        const timerId = window.setTimeout(() => {
                            triggerNotification(event);
                            timeouts.delete(notificationKey);
                        }, delay);
                        timeouts.set(notificationKey, timerId);
                    }
                }
            });
        };

        // Run immediately
        checkAndScheduleEvents();

        // Also run periodic 5-second interval check to safeguard against tab throttling or newly added events
        const intervalId = window.setInterval(checkAndScheduleEvents, 5000);

        return () => {
            timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
            timeouts.clear();
            clearInterval(intervalId);
        };
    }, [events, permission, isSupported, triggerNotification]);

    return {
        permission,
        isSupported,
        requestPermission,
        activeToast,
        dismissToast: () => setActiveToast(null),
    };
}
