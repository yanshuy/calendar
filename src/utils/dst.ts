import { format } from "date-fns";

export interface DstCheckResult {
    isSkippedGap: boolean;
    originalTime?: string;
    adjustedTime?: string;
    isAmbiguousOverlap: boolean;
    earlierLabel?: string;
    laterLabel?: string;
}

/**
 * Determines whether the user's current environment/timezone observes Daylight Saving Time.
 * In non-DST zones (e.g. Asia/Kolkata, Asia/Tokyo, America/Phoenix), winter and summer offsets are identical.
 */
export function timezoneObservesDst(year = new Date().getFullYear()): boolean {
    const janOffset = new Date(year, 0, 1).getTimezoneOffset();
    const julOffset = new Date(year, 6, 1).getTimezoneOffset();
    return janOffset !== julOffset;
}

/**
 * Checks whether a given local datetime string (e.g. "2026-03-08T02:30")
 * falls into a skipped DST gap (Spring Forward) or a repeated overlap hour (Fall Back).
 *
 * ONLY triggers for timezones that actually observe DST and only on the exact transition dates.
 */
export function checkDstTransition(dateTimeStr: string): DstCheckResult {
    if (!dateTimeStr) {
        return { isSkippedGap: false, isAmbiguousOverlap: false };
    }

    // Parse components directly from input string
    const match = dateTimeStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!match) {
        return { isSkippedGap: false, isAmbiguousOverlap: false };
    }

    const [, yStr, mStr, dStr, hStr, minStr] = match;
    const year = Number(yStr);
    const month = Number(mStr);
    const day = Number(dStr);
    const targetHour = Number(hStr);
    const targetMin = Number(minStr);

    // If the user's timezone does NOT observe DST at all, never trigger
    if (!timezoneObservesDst(year)) {
        return { isSkippedGap: false, isAmbiguousOverlap: false };
    }

    // 1. Check for Skipped Hour Gap ("Spring Forward")
    // On Spring Forward, the clock jumps forward (e.g. 2:00 -> 3:00), so 2:30 does not exist.
    // The JavaScript engine normalizes this non-existent time forward.
    const constructed = new Date(year, month - 1, day, targetHour, targetMin, 0);
    if (
        constructed.getHours() !== targetHour ||
        constructed.getMinutes() !== targetMin
    ) {
        const adjustedIso = format(constructed, "yyyy-MM-dd'T'HH:mm");
        const origFormatted = `${targetHour.toString().padStart(2, "0")}:${targetMin.toString().padStart(2, "0")}`;

        return {
            isSkippedGap: true,
            originalTime: origFormatted,
            adjustedTime: adjustedIso,
            isAmbiguousOverlap: false,
        };
    }

    // 2. Check for Repeated Hour Overlap ("Fall Back")
    // Check if the specific day has a DST transition
    const startOfDayOffset = new Date(year, month - 1, day, 0, 0, 0).getTimezoneOffset();
    const endOfDayOffset = new Date(year, month - 1, day, 23, 59, 59).getTimezoneOffset();

    // Fall Back: offset increases during the day (e.g. -240 mins -> -300 mins)
    if (startOfDayOffset < endOfDayOffset) {
        const oneHourBefore = new Date(constructed.getTime() - 60 * 60 * 1000);
        const oneHourAfter = new Date(constructed.getTime() + 60 * 60 * 1000);

        const offsetBefore = oneHourBefore.getTimezoneOffset();
        const offsetAfter = oneHourAfter.getTimezoneOffset();

        if (offsetBefore < offsetAfter) {
            const tzShortBefore = getTzAbbr(oneHourBefore);
            const tzShortAfter = getTzAbbr(oneHourAfter);

            if (tzShortBefore !== tzShortAfter) {
                return {
                    isSkippedGap: false,
                    isAmbiguousOverlap: true,
                    earlierLabel: `Earlier occurrence (${tzShortBefore})`,
                    laterLabel: `Later occurrence (${tzShortAfter})`,
                };
            }
        }
    }

    return { isSkippedGap: false, isAmbiguousOverlap: false };
}

function getTzAbbr(date: Date): string {
    try {
        const str = date.toLocaleTimeString("en-US", { timeZoneName: "short" });
        const parts = str.split(" ");
        return parts[parts.length - 1] || "DST";
    } catch {
        return "DST";
    }
}
