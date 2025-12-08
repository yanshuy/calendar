import { createContext, useContext, ReactNode, useState } from "react";
import {
    eachDayOfInterval,
    startOfISOWeek,
    endOfISOWeek,
    add,
    format,
} from "date-fns";
import { getDateFromUrl, updateUrl, validatePath } from "./url";

interface RouterContextType {
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    currentWeekDays: () => Date[];
    currentWeekMonth: () => string;
    previousWeek: () => void;
    nextWeek: () => void;
    previousDay: () => void;
    nextDay: () => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider = ({ children }: { children: ReactNode }) => {
    validatePath();

    const [currentDate, setCurrentDate] = useState(getDateFromUrl());

    const setUrl = (date: Date) => {
        updateUrl(date);
        setCurrentDate(date);
    };

    const currentWeekDays = () => [
        ...eachDayOfInterval({
            start: startOfISOWeek(currentDate),
            end: endOfISOWeek(currentDate),
        }),
    ];

    const currentWeekMonth = () => {
        // currentMonth is a string
        const days = currentWeekDays();
        const currentWeekStart = days[0],
            currentWeekEnd = days[days.length - 1];
        const Month =
            currentWeekStart.getMonth() === currentWeekEnd.getMonth()
                ? format(currentWeekStart, "MMMM-yyyy")
                : `${format(currentWeekStart, "MMMM-yyyy")} - ${format(
                      currentWeekEnd,
                      "MMMM-yyyy",
                  )}`;
        return Month;
    };

    window.onpopstate = () => {
        setUrl(currentDate);
    };

    function previousWeek() {
        setUrl(add(startOfISOWeek(currentDate), { weeks: -1 }));
    }

    function nextWeek() {
        setUrl(add(startOfISOWeek(currentDate), { weeks: 1 }));
    }

    function previousDay() {
        setUrl(add(currentDate, { days: -1 }));
    }

    function nextDay() {
        setUrl(add(currentDate, { days: 1 }));
    }

    const value = {
        currentDate,
        setCurrentDate,
        currentWeekDays,
        currentWeekMonth,
        previousWeek,
        nextWeek,
        previousDay,
        nextDay,
    };

    return (
        <RouterContext.Provider value={value}>
            {children}
        </RouterContext.Provider>
    );
};

export const useRouter = (): RouterContextType => {
    const context = useContext(RouterContext);
    if (context === undefined) {
        throw new Error("useRouter must be used within a CalendarProvider");
    }
    return context;
};
