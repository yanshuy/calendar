import { useEffect, useRef, useState } from "react";

export function useDialog(
    initial: boolean
): [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
    React.RefObject<HTMLDialogElement | null>
] {
    const [isOpen, setIsOpen] = useState(initial);
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            dialog.showModal();
        } else {
            dialog.close();
        }

        dialog.onclose = () => setIsOpen(false);
    }, [isOpen]);

    return [isOpen, setIsOpen, dialogRef];
}
