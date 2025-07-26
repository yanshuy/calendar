import type React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import type { CalendarEvent } from "../utils/types";
import { add, format } from "date-fns";
import { useEventStore } from "../context/useEventStore";

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

    const [category, setCategory] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useLayoutEffect(() => {
        if (isOpen) {
            if (modalTitleInputRef.current) modalTitleInputRef.current.value = event.name || "";
            if (modalDescriptionInputRef.current) modalDescriptionInputRef.current.value = event.description || "";
            if (modalStartInputRef.current && event.startDateTime) {
                const date =
                    new Date(event.startDateTime) > new Date()
                        ? event.startDateTime
                        : format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");

                modalStartInputRef.current.value = date.slice(0, 16);

                modalStartInputRef.current.min = date.slice(0, 16);
            }
            if (modalEndInputRef.current && event.endDateTime) {
                modalEndInputRef.current.value = modalStartInputRef.current
                    ? format(
                        add(new Date(modalStartInputRef.current?.value), {
                            minutes: 15,
                        }),
                        "yyyy-MM-dd'T'HH:mm"
                    )
                    : event.endDateTime.slice(0, 16);

                modalEndInputRef.current.min = modalStartInputRef.current
                    ? add(new Date(modalStartInputRef.current?.min), {
                        minutes: 15,
                    })
                        .toISOString()
                        .slice(0, 16)
                    : event.endDateTime.slice(0, 16);
            }

            if (modalCategoryInputRef.current) modalCategoryInputRef.current.value = event.category || "";
        } else {
            setCategory(event.category || "");
            setErrors({});
        }
    }, [isOpen, event]);

    const store = useEventStore()
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

        if (modalStartInputRef.current?.value && modalEndInputRef.current?.value) {
            if (
                new Date(modalStartInputRef.current.value).getTime() >=
                new Date(modalEndInputRef.current.value).getTime()
            ) {
                newErrors.endDateTime = "End date should be greater than start date";
            }
            if (new Date(modalStartInputRef.current.value) < new Date()) {
                newErrors.startDateTime = "start date should be greater than current time";
            }
            if (
                new Date(modalStartInputRef.current.value).getDay() !==
                new Date(modalEndInputRef.current.value).getDay()
            ) {
                newErrors.endDateTime = "Start and end date should be on the same day";
            }

            if (
                (new Date(modalEndInputRef.current.value).getTime() -
                    new Date(modalStartInputRef.current.value).getTime()) /
                (1000 * 60) <
                15
            ) {
                newErrors.endDateTime = "differnce between start time and end time should be atleast 15mins";
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        // Prepare event data
        const eventData: CalendarEvent = {
            id: event?.id ?? "", // Use existing ID if updating
            name: modalTitleInputRef.current!.value,
            startDateTime: modalStartInputRef.current!.value,
            endDateTime: modalEndInputRef.current!.value,
            description: modalDescriptionInputRef.current?.value,
            category: modalCategoryInputRef.current?.value == "" ? "Personal" : modalCategoryInputRef.current!.value,
            eventStatus: "future"
        };

        try {
            if (eventData.id != "") {
                await store.updateEvent(eventData);
            } else {
                eventData.id = crypto.randomUUID();
                await store.addEvents(eventData);
            }
            closeModal();
        } catch (err) {
            setErrors({ general: "Failed to save event. Please try again." });
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    }

    const isEventPast = (() => {
        if (!event.endDateTime) return false
        return event.endDateTime !== "" ? new Date(event.endDateTime) < new Date() : false;
    })()

    return (
        <dialog
            id="event-modal"
            ref={dialogRef}
            className="w-full max-w-xl rounded-lg m-auto shadow-[0_10px_40px_rgba(0,0,0,0.15)]"
        >
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    {isEventPast ? (
                        <h2 className="text-2xl font-bold text-gray-800">Past Event</h2>
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
                        <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                            Event Name
                        </label>
                        <input
                            required
                            id="name"
                            ref={modalTitleInputRef}
                            type="text"
                            disabled={isEventPast}
                            className={`w-full rounded-md border ${errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
                                } 
                            px-3 py-2  focus:border-slate-500 focus:ring-1 focus:ring-slate-500 
                            disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed
                            transition-colors`}
                            placeholder="Enter event name"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDateTime" className="mb-1 block text-sm font-medium text-gray-700">
                                Start
                            </label>
                            <div className="relative">
                                <input
                                    required
                                    id="startDateTime"
                                    ref={modalStartInputRef}
                                    type="datetime-local"
                                    disabled={isEventPast}
                                    className={`w-full rounded-md border ${errors.startDateTime ? "border-red-500 bg-red-50" : "border-gray-300"
                                        } 
                                    py-2 pl-10 pr-3 focus:border-slate-500 focus:ring-1 focus:ring-slate-500
                                    disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed
                                    transition-colors`}
                                />
                                <ClockIconStart
                                    className={`absolute left-3 top-1/2 -translate-y-1/2 transform ${isEventPast ? "text-gray-400/50" : "text-gray-400"
                                        }`}
                                    size={20}
                                />
                            </div>
                            {errors.startDateTime && (
                                <p className="mt-1 text-sm text-red-600">{errors.startDateTime}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="endDateTime" className="mb-1 block text-sm font-medium text-gray-700">
                                End
                            </label>
                            <div className="relative">
                                <input
                                    required
                                    id="endDateTime"
                                    ref={modalEndInputRef}
                                    type="datetime-local"
                                    disabled={isEventPast}
                                    className={`w-full rounded-md border ${errors.endDateTime ? "border-red-500 bg-red-50" : "border-gray-300"
                                        } 
                                    py-2 pl-10 pr-3  focus:border-slate-500 focus:ring-1 focus:ring-slate-500
                                    disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed
                                    transition-colors`}
                                />
                                <ClockIconEnd
                                    className={`absolute left-3 top-1/2 -translate-y-1/2 transform ${isEventPast ? "text-gray-400/50" : "text-gray-400"
                                        }`}
                                    size={20}
                                />
                            </div>
                            {errors.endDateTime && <p className="mt-1 text-sm text-red-600">{errors.endDateTime}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700">
                            Event category
                        </label>
                        <select
                            ref={modalCategoryInputRef}
                            id="category"
                            value={category}
                            disabled={isEventPast}
                            onChange={(e) => setCategory(e.target.value)}
                            className={`w-full rounded-md border ${errors.category ? "border-red-500 bg-red-50" : "border-gray-300"
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
                            <option value="">Select a category</option>
                            <option value="Work">Work</option>
                            <option value="Personal">Personal</option>
                            <option value="Meeting">Meeting</option>
                            <option value="Reminder">Reminder</option>
                        </select>
                        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                    </div>

                    <div>
                        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            ref={modalDescriptionInputRef}
                            id="description"
                            className={`w-full rounded-md border ${errors.description ? "border-red-500 bg-red-50" : "border-gray-300"
                                } 
                            px-3 py-2 focus:border-slate-500 focus:ring-1 focus:ring-slate-500
                            disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:cursor-not-allowed
                            transition-colors field-sizing-content resize-none min-h-[calc(2.1lh+1rem)]`}
                            rows={3}
                            placeholder="Enter event description"
                            disabled={isEventPast}
                        ></textarea>
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
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
                                        <LoadingSpinner size={16} className="mr-2" />
                                        {event?.id ? "Updating..." : "Saving..."}
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

export const ClockIconStart: React.FC<IconProps> = ({ size = 24, className = "" }) => (
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

export const ClockIconEnd: React.FC<IconProps> = ({ size = 24, className = "" }) => (
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

export const LoadingSpinner: React.FC<IconProps> = ({ size = 24, className = "" }) => (
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
