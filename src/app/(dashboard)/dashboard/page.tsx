"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useThemeStore } from "@/lib/stores";
import { SpookyDashboardHeader } from "@/components/SpookyTheme";

// Dynamic imports for heavy components with loading fallbacks
const DynamicStudyCalendar = dynamic(
    () => import("@/components/SpookyTheme/SpookyStudyCalendar").then(mod => ({ default: mod.SpookyStudyCalendar })),
    {
        loading: () => <StudyCalendarSkeleton />,
        ssr: false
    }
);

const DynamicRecentActivity = dynamic(
    () => import("@/components/SpookyTheme/SpookyRecentActivity").then(mod => ({ default: mod.SpookyRecentActivity })),
    {
        loading: () => <RecentActivitySkeleton />,
        ssr: false
    }
);

function StudyCalendarSkeleton() {
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";
    
    return (
        <div className={`rounded-2xl p-6 border shadow-sm ${
            isSpooky 
                ? "bg-[#151821] border-purple-500/20" 
                : "bg-white border-[#171d2b]/5"
        }`}>
            <div className="animate-pulse">
                <div className={`h-6 rounded w-32 mb-4 ${
                    isSpooky ? "bg-purple-500/20" : "bg-[#171d2b]/10"
                }`} />
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 42 }).map((_, i) => (
                        <div key={i} className={`h-8 rounded ${
                            isSpooky ? "bg-purple-500/10" : "bg-[#171d2b]/5"
                        }`} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function RecentActivitySkeleton() {
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";
    
    return (
        <div className="h-full">
            <div className="animate-pulse">
                <div className={`h-6 rounded w-32 mb-4 ${
                    isSpooky ? "bg-purple-500/20" : "bg-[#171d2b]/10"
                }`} />
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`rounded-xl p-3 border flex items-center gap-3 ${
                            isSpooky 
                                ? "bg-[#151821] border-purple-500/20" 
                                : "bg-white border-[#171d2b]/5"
                        }`}>
                            <div className={`w-10 h-10 rounded-lg shrink-0 ${
                                isSpooky ? "bg-purple-500/20" : "bg-[#171d2b]/10"
                            }`} />
                            <div className="flex-1">
                                <div className={`h-4 rounded w-3/4 mb-1.5 ${
                                    isSpooky ? "bg-purple-500/20" : "bg-[#171d2b]/10"
                                }`} />
                                <div className={`h-3 rounded w-1/2 ${
                                    isSpooky ? "bg-purple-500/10" : "bg-[#171d2b]/5"
                                }`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function HeaderSkeleton() {
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";
    
    return (
        <header className="mb-6 animate-pulse">
            <div className={`h-10 rounded w-64 mb-2 ${
                isSpooky ? "bg-purple-500/20" : "bg-[#171d2b]/10"
            }`} />
            <div className={`h-5 rounded w-80 ${
                isSpooky ? "bg-purple-500/10" : "bg-[#171d2b]/5"
            }`} />
        </header>
    );
}

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 5) return "Hello";
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
}

export default function DashboardPage() {
    const greeting = getGreeting();

    return (
        <div>
            <Suspense fallback={<HeaderSkeleton />}>
                <SpookyDashboardHeader greeting={greeting} />
            </Suspense>

            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                <div className="lg:col-span-2">
                    <Suspense fallback={<RecentActivitySkeleton />}>
                        <DynamicRecentActivity />
                    </Suspense>
                </div>

                <div className="lg:col-span-8">
                    <Suspense fallback={<StudyCalendarSkeleton />}>
                        <DynamicStudyCalendar />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}


