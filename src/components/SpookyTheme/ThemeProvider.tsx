"use client";

import { useThemeStore } from "@/lib/stores";
import { useEffect } from "react";

interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const theme = useThemeStore((state) => state.theme);

    useEffect(() => {
        // Apply theme to document
        document.documentElement.setAttribute("data-theme", theme);
        
        // Update body background for immediate visual feedback
        if (theme === "spooky") {
            document.body.style.backgroundColor = "#0d0f14";
        } else {
            document.body.style.backgroundColor = "#f0f0ea";
        }
    }, [theme]);

    return <>{children}</>;
}
