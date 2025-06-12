import { format } from "date-fns";

export function getMonthsOfWeek(currentWeekStart: Date, currentWeekEnd: Date) {
    const Month =
        format(currentWeekStart, "MMMM-yyyy") ===
        format(currentWeekEnd, "MMMM-yyyy")
            ? format(currentWeekStart, "MMMM-yyyy")
            : `${format(currentWeekStart, "MMMM-yyyy")} - ${format(
                  currentWeekEnd,
                  "MMMM-yyyy"
              )}`;
    return Month;
}
