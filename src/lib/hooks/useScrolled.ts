"use client";

import { useSyncExternalStore } from "react";

// External store for scroll state - more performant than useEffect
function subscribe(callback: () => void) {
    window.addEventListener("scroll", callback, { passive: true });
    return () => window.removeEventListener("scroll", callback);
}

function getServerSnapshot() {
    return false; // SSR: assume not scrolled
}

/**
 * Custom hook using useSyncExternalStore for scroll state
* More performant than useEffect - React handles batching and scheduling
 */
export function useScrolled(threshold = 20) {
    return useSyncExternalStore(
        subscribe,
        () => window.scrollY > threshold,
        getServerSnapshot
    );
}
