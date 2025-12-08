import { useSyncExternalStore } from "react";
import { EventStore } from "../store/EventStore";

export function useEventStore() {
    const state = useSyncExternalStore(
        EventStore.subscribe,
        () => EventStore.state,
    );

    return state;
}
