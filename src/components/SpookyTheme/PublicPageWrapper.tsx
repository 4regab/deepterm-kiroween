"use client";

import { ThemeProvider, SpookyEffects } from "@/components/SpookyTheme";
import { useThemeStore } from "@/lib/stores";

interface PublicPageWrapperProps {
    children: React.ReactNode;
}

export function PublicPageWrapper({ children }: PublicPageWrapperProps) {
    const theme = useThemeStore((state) => state.theme);
    
    return (
        <ThemeProvider>
            <div className={`min-h-screen transition-colors duration-300 ${
                theme === "spooky" ? "bg-[#0d0f14]" : "bg-[#f0f0ea]"
            }`}>
                <SpookyEffects />
                {children}
            </div>
        </ThemeProvider>
    );
}
