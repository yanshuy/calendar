import { useMemo, useRef, useState } from "react";
import { DEFAULT_TIMEZONES, useTimezone } from "../context/TimezoneContext";
import { useClickOutside } from "../hooks/useClickOutside";

export default function TimezoneSelector() {
    const { timezone, setTimezone, isSystemTimezone, resetToSystemTimezone } =
        useTimezone();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useClickOutside(containerRef, isOpen, () => setIsOpen(false));

    // Get a friendly, human-readable timezone summary (e.g. "New York (EDT)", "India (IST)", "London (BST)")
    const tzSummary = useMemo(() => {
        try {
            const found = DEFAULT_TIMEZONES.find((t) => t.value === timezone);
            let baseName = "";
            if (found) {
                // Shorten labels like "Paris / Berlin / Rome (CET / CEST)" -> "Paris / Berlin" or first city
                const mainLabel = found.label.split(" (")[0] || found.label;
                baseName = mainLabel.split(" / ")[0] || mainLabel;
            } else if (timezone.includes("/")) {
                baseName =
                    timezone.split("/").pop()?.replace(/_/g, " ") || timezone;
            } else {
                baseName = timezone;
            }

            // Get current active abbreviation (e.g. "EDT", "IST", "GMT", "MSK")
            const now = new Date();
            const timeStr = now.toLocaleTimeString("en-US", {
                timeZone: timezone,
                timeZoneName: "short",
            });
            const parts = timeStr.split(" ");
            const abbr = parts[parts.length - 1] || "";

            if (
                abbr &&
                abbr !== baseName &&
                !baseName.toLowerCase().includes(abbr.toLowerCase())
            ) {
                return `${baseName} (${abbr})`;
            }
            return baseName;
        } catch {
            return timezone;
        }
    }, [timezone]);

    // Filter available timezones by search term
    const filteredTimezones = useMemo(() => {
        if (!search.trim()) return DEFAULT_TIMEZONES;
        const q = search.toLowerCase();
        return DEFAULT_TIMEZONES.filter(
            (tz) =>
                tz.label.toLowerCase().includes(q) ||
                tz.value.toLowerCase().includes(q),
        );
    }, [search]);

    return (
        <div ref={containerRef} className="relative z-30">
            <button
                type="button"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    isSystemTimezone
                        ? "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                        : "border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 ring-1 ring-blue-400/30"
                }`}
                title={`Active Timezone: ${timezone}`}
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <span className="text-[13px] leading-none">🌐</span>
                <span className="truncate max-w-[125px] sm:max-w-[150px]">
                    {tzSummary}
                </span>
                <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`size-3 text-slate-500 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                >
                    <path
                        fillRule="evenodd"
                        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 bottom-full mb-2.5 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-3 shadow-lg ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
                        <span className="text-xs font-semibold text-slate-800">
                            Select Timezone
                        </span>
                        {!isSystemTimezone && (
                            <button
                                type="button"
                                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                                onClick={() => {
                                    resetToSystemTimezone();
                                    setIsOpen(false);
                                }}
                            >
                                Reset to Local
                            </button>
                        )}
                    </div>

                    <input
                        type="text"
                        placeholder="Search timezone / city..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-500 focus:bg-white mb-2 transition-colors"
                        autoFocus
                    />

                    <div className="max-h-52 overflow-y-auto flex flex-col gap-0.5 pr-0.5">
                        {filteredTimezones.map((tz) => {
                            const isSelected = tz.value === timezone;
                            return (
                                <button
                                    key={tz.value}
                                    type="button"
                                    className={`flex flex-col text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                        isSelected
                                            ? "bg-slate-800 text-white font-semibold"
                                            : "text-slate-700 hover:bg-slate-100"
                                    }`}
                                    onClick={() => {
                                        setTimezone(tz.value);
                                        setIsOpen(false);
                                    }}
                                >
                                    <span>{tz.label}</span>
                                    <span
                                        className={`text-[10px] ${
                                            isSelected
                                                ? "text-slate-300"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        {tz.value}
                                    </span>
                                </button>
                            );
                        })}
                        {filteredTimezones.length === 0 && (
                            <p className="text-center text-xs text-slate-400 py-3">
                                No timezone found
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
