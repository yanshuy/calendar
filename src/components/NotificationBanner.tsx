import { useState } from "react";
import { useEventNotifications } from "../hooks/useEventNotifications";

export function NotificationBanner() {
    const { permission, isSupported, requestPermission } =
        useEventNotifications();
    const [dismissed, setDismissed] = useState(false);

    if (!isSupported || permission !== "default" || dismissed) {
        return null;
    }

    const handleEnable = async () => {
        const result = await requestPermission();
        if (result !== "granted") {
            setDismissed(true);
        }
    };

    return (
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs sm:text-sm transition-colors">
            <div className="flex items-center gap-2 text-slate-700">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-500 shrink-0"
                >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <p className="font-medium text-slate-700">
                    Enable notifications to receive alerts when your scheduled events begin.
                </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
                <button
                    type="button"
                    onClick={handleEnable}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-medium px-3 py-1 rounded-md text-xs transition-colors cursor-pointer"
                >
                    Enable
                </button>
                <button
                    type="button"
                    onClick={() => setDismissed(true)}
                    className="text-slate-400 hover:text-slate-600 px-2 py-1 text-xs transition-colors cursor-pointer"
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
}
