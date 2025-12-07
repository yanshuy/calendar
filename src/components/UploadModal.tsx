import { useRef, useState } from "react";

const UploadModal = ({
    dialogRef,
    setIsOpen,
}: {
    dialogRef: React.RefObject<HTMLDialogElement | null>;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const modalFileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState("");
    // const [fileName, setFileName] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const file = modalFileInputRef.current?.files?.[0] || null;

        if (!file) {
            setError("Please select a file");
            return;
        }

        if (file.size > 1024 * 1024) {
            setError("File size should be less than 1MB");
            return;
        }

        setIsOpen(false);

        const fileData = new FormData();
        fileData.append("file", file);

        const headers = {
            // Authorization: `Bearer ${TOKEN}`,
            "ngrok-skip-browser-warning": "true",
        };

        fetch("https://live-merely-drum.ngrok-free.app/api/upload-ics/", {
            method: "POST",
            body: fileData,
            headers: headers,
        });
    }

    // function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    //     const file = e.target.files?.[0];
    //     if (file) {
    //         setFileName(file.name);
    //         setError("");
    //     } else {
    //         setFileName("");
    //     }
    // }

    function handleLabelKeyDown(e: React.KeyboardEvent<HTMLLabelElement>) {
        if (e.key === "Enter") {
            modalFileInputRef.current?.click();
        }
    }

    return (
        <dialog ref={dialogRef} className="w-96 rounded-lg shadow-lg m-auto">
            <div className="p-4">
                <h2 className="mb-4 text-xl font-bold">Upload ICS File</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex w-full items-center justify-center">
                        <label
                            tabIndex={0}
                            onKeyDown={handleLabelKeyDown}
                            className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-red-300 bg-red-100 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                {/* <svg
                                    className="mb-4 h-8 w-8 text-gray-500"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 20 16"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                    />
                                </svg> */}
                                <h3 className="text-red-400 font-medium mb-4">
                                    Oops!!
                                </h3>
                                <p className="mb-2 text-sm text-gray-500">
                                    This feature is not implemented yet
                                    {/* <span className="font-semibold">
                                        Click to upload
                                    </span>{" "}
                                    or drag and drop */}
                                </p>
                                <p className="text-xs text-gray-500">
                                    ICS file (MAX. 1MB)
                                </p>
                            </div>
                            `{" "}
                            {/* <input
                                ref={modalFileInputRef}
                                id="dropzone-file"
                                type="file"
                                className="hidden"
                                accept=".ics"
                                onChange={handleFileChange}
                            />` */}
                        </label>
                    </div>
                    {/* {fileName && (
                        <p className="text-sm text-gray-600">
                            Selected file: {fileName}
                        </p>
                    )} */}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            Upload
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    );
};

export default UploadModal;
