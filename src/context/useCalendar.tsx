import { createContext, useContext, useState, ReactNode } from "react";
import { startOfToday, eachDayOfInterval, startOfISOWeek, endOfISOWeek, add } from "date-fns";

// Assuming this function is imported or defined elsewhere
// If it's defined in your project, you'll need to import it correctly
import { getMonthsOfWeek } from "../utils/date-utils";

interface CalendarContextType {
    currentDay: Date;
    setCurrentDay: (date: Date) => void;
    currentWeekDays: Date[];
    currentMonth: string;
    previousWeek: () => void;
    nextWeek: () => void;
    previousDay: () => void;
    nextDay: () => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
    const today = startOfToday();
    const [currentDay, setCurrentDay] = useState(today);

    const currentWeekDays = eachDayOfInterval({
        start: startOfISOWeek(currentDay),
        end: endOfISOWeek(currentDay),
    });

    const currentMonth = getMonthsOfWeek(currentWeekDays[0], currentWeekDays[currentWeekDays.length - 1]); // currentMonth is a string

    function previousWeek() {
        setCurrentDay(add(startOfISOWeek(currentDay), { weeks: -1 }));
    }

    function nextWeek() {
        setCurrentDay(add(startOfISOWeek(currentDay), { weeks: 1 }));
    }

    function previousDay() {
        setCurrentDay(add(currentDay, { days: -1 }));
    }

    function nextDay() {
        setCurrentDay(add(currentDay, { days: 1 }));
    }

    const value = {
        currentDay,
        setCurrentDay,
        currentWeekDays,
        currentMonth,
        previousWeek,
        nextWeek,
        previousDay,
        nextDay,
    };

    return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
};

export const useCalendar = (): CalendarContextType => {
    const context = useContext(CalendarContext);
    if (context === undefined) {
        throw new Error("useCalendar must be used within a CalendarProvider");
    }
    return context;
};
