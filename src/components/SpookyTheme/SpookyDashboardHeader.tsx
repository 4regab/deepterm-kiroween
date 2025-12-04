"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Skull, Flame, Trophy, Ghost, Clock } from "lucide-react";
import { useProfileStore, useXPStore, useActivityStore, useThemeStore } from "@/lib/stores";
import { getRankTitle, calculateProgressPercent } from "@/utils/xp";
import { ThemeToggle } from "./ThemeToggle";

interface SpookyDashboardHeaderProps {
    greeting: string;
}

const SPOOKY_RANKS: Record<string, string> = {
    "Novice": "Apprentice Necromancer",
    "Beginner": "Grave Keeper",
    "Intermediate": "Shadow Walker",
    "Advanced": "Soul Collector",
    "Expert": "Dark Archivist",
    "Master": "Phantom Scholar",
    "Grandmaster": "Lord of the Damned",
};

function getSpookyGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 5) return "The witching hour beckons";
    if (hour < 12) return "Rise from your slumber";
    if (hour < 17) return "The shadows grow long";
    if (hour < 21) return "Darkness approaches";
    return "The night is yours";
}

function SpookyHeaderSkeleton() {
    return (
        <header className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                    <div className="h-10 w-64 bg-purple-500/10 rounded-lg animate-pulse mb-2" />
                    <div className="h-5 w-48 bg-purple-500/5 rounded animate-pulse" />
                </div>
            </div>
            <div className="bg-[#151821] rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="h-7 w-20 bg-purple-500/20 rounded-md animate-pulse" />
                        <div className="h-5 w-24 bg-purple-500/10 rounded animate-pulse" />
                    </div>
                </div>
                <div className="h-3 bg-purple-500/10 rounded-full mb-4" />
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-[#1a1525] rounded-lg p-3 animate-pulse">
                            <div className="h-3 bg-purple-500/20 rounded w-16 mb-2" />
                            <div className="h-5 bg-purple-500/20 rounded w-12" />
                        </div>
                    ))}
                </div>
            </div>
        </header>
    );
}

export function SpookyDashboardHeader({ greeting }: SpookyDashboardHeaderProps) {
    const theme = useThemeStore((state) => state.theme);
    const { profile, loading: profileLoading, fetchProfile } = useProfileStore();
    const { stats: xpStats, loading: xpLoading, fetchXPStats } = useXPStore();
    const { stats: activityStats, loading: activityLoading, fetchActivity } = useActivityStore();

    // Fetch fresh data on mount
    useEffect(() => {
        fetchProfile();
        fetchXPStats();
        fetchActivity();
    }, [fetchProfile, fetchXPStats, fetchActivity]);

    if (profileLoading || xpLoading) {
        return <SpookyHeaderSkeleton />;
    }

    const firstName = profile?.full_name?.split(' ')[0] || "Wanderer";
    const level = xpStats?.currentLevel || 1;
    const xpInLevel = xpStats?.xpInLevel || 0;
    const xpForNext = xpStats?.xpForNext || 100;
    const normalRank = getRankTitle(level);
    const rankTitle = theme === "spooky" ? (SPOOKY_RANKS[normalRank] || normalRank) : normalRank;
    const progressPercent = calculateProgressPercent(xpInLevel, xpForNext);

    const todayMinutes = activityStats?.total_study_minutes ?? 0;
    const currentStreak = activityStats?.current_streak ?? 0;
    const bestStreak = activityStats?.longest_streak ?? 0;

    const spookyGreeting = theme === "spooky" ? getSpookyGreeting() : greeting;

    return (
        <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 relative z-10"
        >
            {/* Greeting with theme toggle */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h1 className={`font-serif text-[32px] sm:text-[40px] mb-1 ${
                        theme === "spooky" 
                            ? "text-[#e8e4dc] spooky-glow" 
                            : "text-[#171d2b]"
                    }`}>
                        {`${spookyGreeting}, ${firstName}...`}
                    </h1>
                    <p className={`font-sans text-[16px] ${
                        theme === "spooky" ? "text-purple-300/60" : "text-[#171d2b]/60"
                    }`}>
                        {theme === "spooky" 
                            ? "The ancient tomes await your return..." 
                            : "Ready to continue your learning journey?"
                        }
                    </p>
                </div>
                <ThemeToggle />
            </div>
            
            {/* Level Progress Bar - Spooky variant */}
            <div className={`rounded-xl p-4 border shadow-sm ${
                theme === "spooky"
                    ? "bg-[#151821] border-purple-500/20"
                    : "bg-white border-[#171d2b]/5"
            }`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-md font-sans font-semibold text-sm flex items-center gap-2 ${
                            theme === "spooky"
                                ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white"
                                : "bg-[#171d2b] text-white"
                        }`}>
                            {theme === "spooky" && <Skull size={14} />}
                            LEVEL {level}
                        </div>
                        <span className={`font-sans text-sm font-medium ${
                            theme === "spooky" ? "text-purple-300/70" : "text-[#171d2b]/60"
                        }`}>
                            {rankTitle}
                        </span>
                    </div>
                    
                    <span className={`font-sans text-sm ${
                        theme === "spooky" ? "text-purple-300/60" : "text-[#171d2b]/60"
                    }`}>
                        {xpInLevel}/{xpForNext} {theme === "spooky" ? "Soul Points" : "XP"}
                    </span>
                </div>
                
                {/* Progress bar */}
                <div className={`h-3 rounded-full overflow-hidden mb-4 ${
                    theme === "spooky" ? "bg-purple-900/30" : "bg-[#171d2b]/5"
                }`}>
                    <motion.div
                        className={`h-full rounded-full ${
                            theme === "spooky"
                                ? "bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-500"
                                : "bg-gradient-to-r from-[#c4a574] to-[#c4875a]"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <StatCard
                        icon={theme === "spooky" ? Ghost : Clock}
                        label={theme === "spooky" ? "Haunting Hours" : "Today's Study"}
                        value={activityLoading ? "..." : `${todayMinutes} min`}
                        theme={theme}
                        variant="primary"
                    />
                    <StatCard
                        icon={Flame}
                        label={theme === "spooky" ? "Curse Streak" : "Current Streak"}
                        value={activityLoading ? "..." : `${currentStreak} days`}
                        theme={theme}
                        variant="secondary"
                    />
                    <StatCard
                        icon={Trophy}
                        label={theme === "spooky" ? "Longest Possession" : "Best Streak"}
                        value={activityLoading ? "..." : `${bestStreak} days`}
                        theme={theme}
                        variant="tertiary"
                    />
                </div>
            </div>
        </motion.header>
    );
}

interface StatCardProps {
    icon?: typeof Flame;
    label: string;
    value: string;
    theme: string;
    variant: "primary" | "secondary" | "tertiary";
}

function StatCard({ icon: Icon, label, value, theme, variant }: StatCardProps) {
    const isSpooky = theme === "spooky";
    
    const bgColors = {
        primary: isSpooky ? "bg-[#1a1525]" : "bg-[#f5f0e0]",
        secondary: isSpooky ? "bg-[#1a1020]" : "bg-[#e8e4d8]",
        tertiary: isSpooky ? "bg-[#150f1a]" : "bg-[#e0dcd0]",
    };

    const iconBg = isSpooky ? "bg-purple-500/20" : "bg-white";
    const iconColor = isSpooky ? "text-purple-400" : "text-[#171d2b]/70";
    const labelColor = isSpooky ? "text-purple-300/50" : "text-[#171d2b]/60";
    const valueColor = isSpooky ? "text-[#e8e4dc]" : "text-[#171d2b]";

    return (
        <div className={`${bgColors[variant]} rounded-lg p-3 flex items-center gap-3 ${
            isSpooky ? "border border-purple-500/10" : ""
        }`}>
            <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center ${
                isSpooky ? "candle-flicker" : ""
            }`}>
                {Icon && <Icon size={16} className={iconColor} />}
            </div>
            <div>
                <p className={`font-sans text-[11px] ${labelColor}`}>{label}</p>
                <p className={`font-sans font-semibold text-[16px] ${valueColor}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}
