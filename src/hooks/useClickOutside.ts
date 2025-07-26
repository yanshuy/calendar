import { useEffect } from "react";

export function useClickOutside(
    elementRef: React.RefObject<HTMLElement | HTMLDialogElement | null>,
    isOpen: boolean,
    onClose: () => void
) {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
        if (!elementRef.current) return;

        const target = event.target as Node;
        const isDialogClick = target.nodeName == "DIALOG";

        if (!elementRef.current.contains(target) || isDialogClick) {
            onClose();
        }
    }

    useEffect(() => {
        const events: Array<"mousedown" | "touchstart"> = [
            "mousedown",
            "touchstart",
        ];

        if (isOpen) {
            events.forEach((event) => {
                document.addEventListener(event, handleClickOutside);
            });
        }

        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, handleClickOutside);
            });
        };
    }, [isOpen]);

    return elementRef;
}
