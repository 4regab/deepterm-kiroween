"use client";

import { useThemeStore } from "@/lib/stores";
import { useLayoutEffect } from "react";

interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const theme = useThemeStore((state) => state.theme);

    // useLayoutEffect runs synchronously before browser paint
    // This prevents theme flash/flicker on initial render and theme changes
    useLayoutEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        document.body.style.backgroundColor = theme === "spooky" ? "#0d0f14" : "#f0f0ea";
    }, [theme]);

    return <>{children}</>;
}
