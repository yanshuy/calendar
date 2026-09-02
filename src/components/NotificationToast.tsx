import { useEffect } from "react";
import { InAppToast } from "../hooks/useEventNotifications";

export function NotificationToast({
    toast,
    onDismiss,
}: {
    toast: InAppToast | null;
    onDismiss: () => void;
}) {
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => {
            onDismiss();
        }, 8000);
        return () => clearTimeout(timer);
    }, [toast, onDismiss]);

    if (!toast) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full bg-white border border-slate-200 rounded-xl shadow-xl p-4 flex items-start gap-3 transition-all">
            <div className="size-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-slate-800 truncate">
                        {toast.title}
                    </h4>
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        Now
                    </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{toast.time}</p>
                {toast.description && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {toast.description}
                    </p>
                )}
            </div>
            <button
                type="button"
                onClick={onDismiss}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
            >
                ✕
            </button>
        </div>
    );
}
