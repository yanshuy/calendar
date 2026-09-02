import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface TimezoneContextType {
    timezone: string;
    setTimezone: (tz: string) => void;
    systemTimezone: string;
    isSystemTimezone: boolean;
    resetToSystemTimezone: () => void;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

const TIMEZONE_STORAGE_KEY = "calendar_selected_timezone";

export const DEFAULT_TIMEZONES = [
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
    { value: "America/New_York", label: "New York (Eastern Time - EDT/EST)" },
    { value: "America/Chicago", label: "Chicago (Central Time - CDT/CST)" },
    { value: "America/Denver", label: "Denver (Mountain Time - MDT/MST)" },
    { value: "America/Los_Angeles", label: "Los Angeles (Pacific Time - PDT/PST)" },
    { value: "America/Anchorage", label: "Anchorage (Alaska Time)" },
    { value: "Pacific/Honolulu", label: "Honolulu (Hawaii Time)" },
    { value: "Europe/London", label: "London (GMT / BST)" },
    { value: "Europe/Paris", label: "Paris / Berlin / Rome (CET / CEST)" },
    { value: "Europe/Athens", label: "Athens / Helsinki (EET / EEST)" },
    { value: "Europe/Moscow", label: "Moscow (MSK - UTC+3)" },
    { value: "Asia/Dubai", label: "Dubai (GST - UTC+4)" },
    { value: "Asia/Kolkata", label: "India / Colombo (IST - UTC+5:30)" },
    { value: "Asia/Bangkok", label: "Bangkok / Jakarta (ICT - UTC+7)" },
    { value: "Asia/Singapore", label: "Singapore / Hong Kong / Beijing (SGT/CST - UTC+8)" },
    { value: "Asia/Tokyo", label: "Tokyo / Seoul (JST/KST - UTC+9)" },
    { value: "Australia/Sydney", label: "Sydney / Melbourne (AEST / AEDT)" },
    { value: "Pacific/Auckland", label: "Auckland (NZST / NZDT)" },
    { value: "America/Sao_Paulo", label: "São Paulo (BRT - UTC-3)" },
];

export function TimezoneProvider({ children }: { children: ReactNode }) {
    const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    const [timezone, setTimezoneState] = useState<string>(() => {
        return localStorage.getItem(TIMEZONE_STORAGE_KEY) || systemTimezone;
    });

    const setTimezone = (tz: string) => {
        setTimezoneState(tz);
        localStorage.setItem(TIMEZONE_STORAGE_KEY, tz);
    };

    const resetToSystemTimezone = () => {
        setTimezone(systemTimezone);
    };

    const isSystemTimezone = timezone === systemTimezone;

    useEffect(() => {
        const stored = localStorage.getItem(TIMEZONE_STORAGE_KEY);
        if (!stored) {
            setTimezoneState(systemTimezone);
        }
    }, [systemTimezone]);

    return (
        <TimezoneContext.Provider
            value={{
                timezone,
                setTimezone,
                systemTimezone,
                isSystemTimezone,
                resetToSystemTimezone,
            }}
        >
            {children}
        </TimezoneContext.Provider>
    );
}

export function useTimezone() {
    const context = useContext(TimezoneContext);
    if (!context) {
        throw new Error("useTimezone must be used within a TimezoneProvider");
    }
    return context;
}
