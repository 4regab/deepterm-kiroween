"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useUIStore, useThemeStore } from "@/lib/stores";
import PomodoroNotification from "@/components/PomodoroNotification";
import { ThemeProvider, SpookyEffects, SpookyAmbientSound } from "@/components/SpookyTheme";

// Dynamic import for Sidebar
const Sidebar = dynamic(() => import("@/components/Sidebar"), {
    ssr: false,
    loading: () => <SidebarSkeleton />,
});

function SidebarSkeleton() {
    const theme = useThemeStore((state) => state.theme);
    return (
        <aside className={`fixed left-0 top-0 h-screen w-[64px] border-r hidden md:block ${
            theme === "spooky" 
                ? "bg-[#0d0f14] border-purple-500/20" 
                : "bg-[#f0f0ea] border-[#171d2b]/10"
        }`} />
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const sidebarPinned = useUIStore((state) => state.sidebarPinned);
    const theme = useThemeStore((state) => state.theme);

    // Study mode pages - hide sidebar during active study
    const isStudyMode = pathname?.includes("/materials/") && (
        pathname?.includes("/flashcards") ||
        pathname?.includes("/learn") ||
        pathname?.includes("/practice") ||
        pathname?.includes("/match")
    );

    return (
        <ThemeProvider>
            <div className={`min-h-screen transition-colors duration-300 ${
                theme === "spooky" ? "bg-[#0d0f14]" : "bg-[#f0f0ea]"
            }`}>
                {/* Spooky ambient effects */}
                <SpookyEffects />
                <SpookyAmbientSound />
                
                <PomodoroNotification />
                {!isStudyMode && (
                    <Suspense fallback={<SidebarSkeleton />}>
                        <Sidebar />
                    </Suspense>
                )}
                <main className={`${!isStudyMode ? (sidebarPinned ? "pl-0 md:pl-[220px]" : "pl-0 md:pl-[64px]") : ""} min-h-screen transition-all duration-300 relative z-10`}>
                    <div className={`w-full ${!isStudyMode ? "px-4 sm:px-6 lg:px-8 xl:px-10 pt-16 pb-4 sm:pt-6 sm:pb-6 lg:pt-8 lg:pb-8 md:py-6 lg:py-8" : "p-0"}`}>
                        {children}
                    </div>
                </main>
            </div>
        </ThemeProvider>
    );
}
