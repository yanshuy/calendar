import type React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import { add, format } from "date-fns";
import {
    CalendarEvent,
    Categories,
    categories,
    EventStore,
} from "../store/EventStore";

import { checkDstTransition, DstCheckResult } from "../utils/dst";

function formatDate(date: Date): string {
    return format(date, "yyyy-MM-dd'T'HH:mm");
}

export default function EventModal({
    event,
    isOpen,
    closeModal,
    dialogRef,
}: {
    event: Partial<CalendarEvent>;
    isOpen: boolean;
    closeModal: () => void;
    dialogRef: React.RefObject<HTMLDialogElement | null>;
}) {
    useClickOutside(dialogRef, isOpen, () => closeModal());
    const modalTitleInputRef = useRef<HTMLInputElement>(null);
    const modalDescriptionInputRef = useRef<HTMLTextAreaElement>(null);
    const modalStartInputRef = useRef<HTMLInputElement>(null);
    const modalEndInputRef = useRef<HTMLInputElement>(null);
    const modalCategoryInputRef = useRef<HTMLSelectElement>(null);
    const [category, setCategory] = useState(categories[1] as Categories);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [dstNotice, setDstNotice] = useState<string | null>(null);
    const [dstInfo, setDstInfo] = useState<DstCheckResult | null>(null);
    const [dstChoice, setDstChoice] = useState<"earlier" | "later">("earlier");

    const validateDst = (startDateStr: string) => {
        const dst = checkDstTransition(startDateStr);
        if (dst.isSkippedGap && dst.adjustedTime) {
            if (modalStartInputRef.current) {
                modalStartInputRef.current.value = dst.adjustedTime;
            }
            setDstNotice(
                `⚠️ Daylight Saving Time (Spring Forward): ${dst.originalTime} does not exist on this date. Time automatically adjusted to ${format(new Date(dst.adjustedTime), "h:mm a")}.`,
            );
            setDstInfo(null);
        } else if (dst.isAmbiguousOverlap) {
            setDstInfo(dst);
            setDstNotice(null);
        } else {
            setDstNotice(null);
            setDstInfo(null);
        }
    };

    useLayoutEffect(() => {
        if (isOpen) {
            if (modalTitleInputRef.current)
                modalTitleInputRef.current.value = event.title || "";
            if (modalDescriptionInputRef.current)
                modalDescriptionInputRef.current.value =
                    event.description || "";

            const startDate = event.startDateTime
                ? event.startDateTime instanceof Date
                    ? event.startDateTime
                    : new Date(event.startDateTime)
                : new Date();

            const endDate = event.endDateTime
                ? event.endDateTime instanceof Date
                    ? event.endDateTime
                    : new Date(event.endDateTime)
                : add(startDate, { minutes: 15 });

            const startStr = formatDate(startDate);
            const endStr = formatDate(endDate);

            if (modalStartInputRef.current) {
                modalStartInputRef.current.value = startStr;
            }
            if (modalEndInputRef.current) {
                modalEndInputRef.current.value = endStr;
                modalEndInputRef.current.min = startStr;
            }

            validateDst(startStr);

            if (modalCategoryInputRef.current)
                modalCategoryInputRef.current.value = event.category || "";
        } else {
            setCategory(event.category || categories[1]);
            setErrors({});
            setDstNotice(null);
            setDstInfo(null);
        }
    }, [isOpen, event]);

    // const store = useEventStore()
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isEventPast) return;

        setIsSubmitting(true);
        setErrors({});
        const newErrors: { [key: string]: string } = {};

        // Validation checks
        if (!modalTitleInputRef.current?.value) {
            newErrors.name = "Name is required";
        }

        if (!modalStartInputRef.current?.value) {
            newErrors.startDateTime = "Start date is required";
        }

        if (!modalEndInputRef.current?.value) {
            newErrors.endDateTime = "End date is required";
        }

        if (
            modalStartInputRef.current?.value &&
            modalEndInputRef.current?.value
        ) {
            const startTime = new Date(modalStartInputRef.current.value).getTime();
            const endTime = new Date(modalEndInputRef.current.value).getTime();

            if (startTime >= endTime) {
                newErrors.endDateTime =
                    "End date should be greater than start date";
            }

            if ((endTime - startTime) / (1000 * 60) < 15) {
                newErrors.endDateTime =
                    "Difference between start time and end time should be at least 15 mins";
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        // Prepare event data
        const eventData: CalendarEvent = {
            //@ts-expect-error already handled
            id: event.id ? event.id : undefined,
            title: modalTitleInputRef.current!.value,
            startDateTime: new Date(modalStartInputRef.current!.value),
            endDateTime: new Date(modalEndInputRef.current!.value),
            description: modalDescriptionInputRef.current!.value,
            category:
                modalCategoryInputRef.current?.value == ""
                    ? categories[1]
                    : (modalCategoryInputRef.current?.value as Categories),
            eventStatus: "coming",
        };

        console.log("Event data:", eventData);
        try {
            if (
                typeof window !== "undefined" &&
                "Notification" in window &&
                Notification.permission === "default" &&
                !localStorage.getItem("notification_permission_requested")
            ) {
                try {
                    localStorage.setItem(
                        "notification_permission_requested",
                        "true",
                    );
                    await Notification.requestPermission();
                } catch {
                    // Ignore
                }
            }

            if (eventData.id) {
                await EventStore.updateEvent(eventData);
            } else {
                await EventStore.insertEvent(eventData);
            }
            closeModal();
        } catch (err) {
            setErrors({ general: "Failed to save event. Please try again." });
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    }

    let isEventPast = false;
    if (event.endDateTime) {
        isEventPast = event.endDateTime < new Date();
    }

    return (
        <dialog
            id="event-modal"
            ref={dialogRef}
            className="w-[calc(100%-2rem)] max-w-xl max-h-[90vh] overflow-y-auto rounded-lg m-auto shadow-[0_10px_40px_rgba(0,0,0,0.15)]"
        >
            <div className="p-4 sm:p-6">
                <div className="mb-6 flex items-center justify-between">
                    {isEventPast ? (
                        <h2 className="text-2xl font-bold text-gray-800">
                            Past Event
                        </h2>
                    ) : (
                        <h2 className="text-2xl font-bold text-gray-800">
                            {event?.id ? "Update Event" : "Schedule Event"}
                        </h2>
                    )}

                    <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                            closeModal();
                        }}
                    >
                        <XIcon size={24} />
                    </button>
                </div>

                {errors.general && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                        {errors.general}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 [&_input,select,textarea]:outline-transparent [&_input,select,textarea]:ring-offset-2"
                >
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Event Name
                        </label>
                        <input
                            required
                            id="name"
                            ref={modalTitleInputRef}
                            type="text"
                            disabled={isEventPast}
                            className={`w-full rounded-md border ${
                                errors.name
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300"
                            }
                            px-3 py-2  focus:border-slate-500 focus:ring-1 focus:ring-slate-500
                            disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed
                            transition-colors`}
                            placeholder="Enter event name"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="startDateTime"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Start
                            </label>
                            <input
                                required
                                id="startDateTime"
                                ref={modalStartInputRef}
                                type="datetime-local"
                                disabled={isEventPast}
                                onChange={(e) => {
                                    validateDst(e.target.value);
                                    if (modalEndInputRef.current) {
                                        modalEndInputRef.current.min =
                                            e.target.value;
                                    }
                                }}
                                className={`w-full rounded-md border ${
                                    errors.startDateTime
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-300"
                                }
                                px-3 py-2 focus:border-slate-500 focus:ring-1 focus:ring-slate-500
                                disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed
                                transition-colors`}
                            />
                            {errors.startDateTime && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.startDateTime}
                                </p>
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="endDateTime"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                End
                            </label>
                            <input
                                required
                                id="endDateTime"
                                ref={modalEndInputRef}
                                type="datetime-local"
                                disabled={isEventPast}
                                className={`w-full rounded-md border ${
                                    errors.endDateTime
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-300"
                                }
                                px-3 py-2 focus:border-slate-500 focus:ring-1 focus:ring-slate-500
                                disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed
                                transition-colors`}
                            />
                            {errors.endDateTime && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.endDateTime}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* DST Skipped Gap Notice ("Spring Forward") */}
                    {dstNotice && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                            <span className="text-sm shrink-0">🕒</span>
                            <div>
                                <p className="font-semibold text-amber-950">
                                    Daylight Saving Time Adjustment
                                </p>
                                <p className="mt-0.5 text-amber-800">
                                    {dstNotice}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* DST Ambiguous Overlap Choice ("Fall Back") */}
                    {dstInfo?.isAmbiguousOverlap && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex flex-col gap-2">
                            <div className="flex items-center gap-1.5 font-semibold text-blue-950">
                                <span>🕒</span>
                                <span>Daylight Saving Time: Repeated Hour</span>
                            </div>
                            <p className="text-blue-800">
                                This hour occurs twice during the Fall Back
                                transition. Choose your intended timing:
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className={`px-3 py-1.5 rounded-md border text-xs font-semibold cursor-pointer transition-all ${
                                        dstChoice === "earlier"
                                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                            : "bg-white text-blue-800 border-blue-200 hover:bg-blue-100"
                                    }`}
                                    onClick={() => setDstChoice("earlier")}
                                >
                                    {dstInfo.earlierLabel ||
                                        "Earlier occurrence"}
                                </button>
                                <button
                                    type="button"
                                    className={`px-3 py-1.5 rounded-md border text-xs font-semibold cursor-pointer transition-all ${
                                        dstChoice === "later"
                                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                            : "bg-white text-blue-800 border-blue-200 hover:bg-blue-100"
                                    }`}
                                    onClick={() => setDstChoice("later")}
                                >
                                    {dstInfo.laterLabel || "Later occurrence"}
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="category"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Event category
                        </label>
                        <select
                            ref={modalCategoryInputRef}
                            id="category"
                            value={category}
                            disabled={isEventPast}
                            onChange={(e) =>
                                setCategory(e.target.value as Categories)
                            }
                            className={`w-full rounded-md border ${
                                errors.category
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300"
                            }
                            px-3 py-2  focus:border-slate-500 focus:ring-1 focus:ring-slate-500
                            disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed
                            transition-colors appearance-none bg-no-repeat bg-[right_0.5rem_center]`}
                            style={{
                                backgroundImage:
                                    "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                                backgroundSize: "1.5em 1.5em",
                            }}
                        >
                            <option value="">
                                Select a category
                            </option>
                            {categories.map((cate) => (
                                <option key={cate} value={cate}>
                                    {cate}
                                </option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.category}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="description"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Description
                        </label>
                        <textarea
                            ref={modalDescriptionInputRef}
                            id="description"
                            className={`w-full rounded-md border ${
                                errors.description
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300"
                            }
                            px-3 py-2 focus:border-slate-500 focus:ring-1 focus:ring-slate-500
                            disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed
                            transition-colors field-sizing-content resize-none min-h-[calc(2.1lh+1rem)]`}
                            rows={3}
                            placeholder="Enter event description"
                            disabled={isEventPast}
                        ></textarea>
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {!isEventPast && (
                        <div className="flex justify-end space-x-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    closeModal();
                                }}
                                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200
                                focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900
                                focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
                                disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors
                                shadow-sm hover:shadow-md"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center">
                                        <LoadingSpinner
                                            size={16}
                                            className="mr-2"
                                        />
                                        {event?.id
                                            ? "Updating..."
                                            : "Saving..."}
                                    </span>
                                ) : event?.id ? (
                                    "Update Event"
                                ) : (
                                    "Save Event"
                                )}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </dialog>
    );
}

// Icon components
export const XIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`feather feather-x ${className}`}
    >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export const ClockIconStart: React.FC<IconProps> = ({
    size = 24,
    className = "",
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`feather feather-clock ${className}`}
    >
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

export const ClockIconEnd: React.FC<IconProps> = ({
    size = 24,
    className = "",
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`feather feather-clock ${className}`}
    >
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 8 14"></polyline>
    </svg>
);

export const LoadingSpinner: React.FC<IconProps> = ({
    size = 24,
    className = "",
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`animate-spin ${className}`}
    >
        <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="0.75"></path>
    </svg>
);

// Define IconProps type
type IconProps = {
    size?: number;
    className?: string;
};
