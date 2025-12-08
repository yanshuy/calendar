import { useEffect, useState } from "react";

export function useUrlHash(): [string, (newHash: string) => void] {
    const [hash, setHash] = useState(() => window.location.hash);

    useEffect(() => {
        const handleHashChange = () => {
            setHash(window.location.hash);
        };

        window.addEventListener("hashchange", handleHashChange);
        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []);

    const updateHash = (newHash: string) => {
        window.location.hash = newHash;
    };

    return [hash, updateHash];
}

export function useUrlSearchParam(
    key: string,
    expectedValues: string[],
): [string, (value: string) => void] {
    const [value, setValue] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get(key) || expectedValues[0];
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (!params.has(key) || !expectedValues.includes(params.get(key)!)) {
            params.set(key, expectedValues[0]);
            const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
            window.history.replaceState({}, "", newUrl);
        }
    });

    const updateValue = (newValue: string) => {
        setValue(newValue);
        const params = new URLSearchParams(window.location.search);
        params.set(key, newValue);
        const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
        window.history.pushState({}, "", newUrl);
    };

    useEffect(() => {
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            setValue(params.get(key) || expectedValues[0]);
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [key, expectedValues]);

    return [value, updateValue];
}
