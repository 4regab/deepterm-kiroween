"use client";

import { useState } from "react";
import { Trophy, Zap, BrainCircuit, Star, Flame, Timer, Clock, BookOpen, FileText, Upload, Skull, Ghost } from "lucide-react";
import { useAchievementsStore, useThemeStore } from "@/lib/stores";
import { calculateOverallProgress, getUnlockedCount } from "@/utils/achievements";
import type { Achievement, AchievementIcon } from "@/lib/schemas/achievements";

const ICON_MAP: Record<string, typeof Trophy> = {
    Trophy, Zap, BrainCircuit, Star, Flame, Timer, Clock, BookOpen, FileText, Upload
};

type FilterType = "all" | "unlocked" | "locked";

const FILTERS: { label: string; value: FilterType; spookyLabel: string }[] = [
    { label: "All", value: "all", spookyLabel: "All" },
    { label: "Unlocked", value: "unlocked", spookyLabel: "Bound" },
    { label: "Locked", value: "locked", spookyLabel: "Sealed" },
];

const BG_MAP: Record<string, string> = {
    "bg-blue-100": "bg-[#e8e4d8]",
    "bg-purple-100": "bg-[#e0dcd0]",
    "bg-green-100": "bg-[#d8d4c8]",
    "bg-cyan-100": "bg-[#e8e4d8]",
    "bg-yellow-100": "bg-[#f5e6c8]",
    "bg-orange-100": "bg-[#f5e6c8]",
    "bg-red-100": "bg-[#e8e4d8]",
};

const SPOOKY_BG_MAP: Record<string, string> = {
    "bg-blue-100": "bg-purple-500/20",
    "bg-purple-100": "bg-purple-600/20",
    "bg-green-100": "bg-purple-400/20",
    "bg-cyan-100": "bg-purple-500/20",
    "bg-yellow-100": "bg-purple-500/30",
    "bg-orange-100": "bg-purple-500/30",
    "bg-red-100": "bg-purple-500/20",
};

const COLOR_MAP: Record<string, { color: string }> = {
    "text-blue-600": { color: "text-[#171d2b]/70" },
    "text-purple-600": { color: "text-[#171d2b]/70" },
    "text-green-600": { color: "text-[#171d2b]/70" },
    "text-cyan-600": { color: "text-[#171d2b]/70" },
    "text-yellow-600": { color: "text-[#c4875a]" },
    "text-orange-600": { color: "text-[#c4875a]" },
    "text-red-600": { color: "text-[#171d2b]/70" },
};

const SPOOKY_COLOR_MAP: Record<string, { color: string }> = {
    "text-blue-600": { color: "text-purple-400" },
    "text-purple-600": { color: "text-purple-400" },
    "text-green-600": { color: "text-purple-400" },
    "text-cyan-600": { color: "text-purple-400" },
    "text-yellow-600": { color: "text-purple-300" },
    "text-orange-600": { color: "text-purple-300" },
    "text-red-600": { color: "text-purple-400" },
};

let achievementsFetchTriggered = false;
function triggerAchievementsFetch() {
    if (!achievementsFetchTriggered) {
        achievementsFetchTriggered = true;
        queueMicrotask(() => {
            useAchievementsStore.getState().fetchAchievements();
        });
    }
}

export default function AchievementsPage() {
    const [filter, setFilter] = useState<FilterType>("all");
    const { achievements, loading } = useAchievementsStore();
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";

    triggerAchievementsFetch();

    if (loading) return <AchievementsSkeleton isSpooky={isSpooky} />;

    const unlockedCount = getUnlockedCount(achievements);
    const overallProgress = calculateOverallProgress(achievements);

    const filteredAchievements = achievements.filter((a: Achievement) => {
        if (filter === "unlocked") return a.unlocked;
        if (filter === "locked") return !a.unlocked;
        return true;
    });

    if (achievements.length === 0) return <EmptyAchievements isSpooky={isSpooky} />;

    return (
        <div>
            <header className="mb-6">
                <h1 className={`font-serif text-[28px] mb-1 ${isSpooky ? "text-purple-100 spooky-glow" : "text-[#171d2b]"}`}>
                    {isSpooky ? "Soul Trophies" : "Achievements"}
                </h1>
                <p className={`font-sans text-[15px] ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>
                    {isSpooky ? "Bind the spirits of knowledge to your will" : "Track your progress and unlock rewards"}
                </p>
            </header>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex gap-2">
                    {FILTERS.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`px-4 py-2 rounded-lg font-sans text-[14px] transition-all ${
                                filter === f.value
                                    ? (isSpooky ? "bg-purple-600 text-white" : "bg-[#171d2b] text-white")
                                    : (isSpooky 
                                        ? "bg-[#151821] border border-purple-500/20 text-purple-300/70 hover:bg-purple-500/10" 
                                        : "bg-white border border-[#171d2b]/10 text-[#171d2b]/70 hover:bg-[#171d2b]/5")
                            }`}
                        >
                            {isSpooky ? f.spookyLabel : f.label}
                        </button>
                    ))}
                </div>
                <span className={`text-sm font-sans font-medium ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>
                    {unlockedCount}/{achievements.length} {isSpooky ? "Bound" : "Unlocked"}
                </span>
            </div>

            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className={`text-[12px] font-sans ${isSpooky ? "text-purple-300/50" : "text-[#171d2b]/50"}`}>
                        {isSpooky ? "Corruption Level" : "Overall Progress"}
                    </span>
                    <span className={`text-[12px] font-sans font-medium ${isSpooky ? "text-purple-300/70" : "text-[#171d2b]/70"}`}>
                        {overallProgress}%
                    </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isSpooky ? "bg-purple-900/30" : "bg-[#171d2b]/5"}`}>
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${
                            isSpooky 
                                ? "bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-500" 
                                : "bg-gradient-to-r from-[#c4a574] to-[#c4875a]"
                        }`}
                        style={{ width: `${overallProgress}%` }}
                    />
                </div>
            </div>

            {filteredAchievements.length === 0 ? (
                <div className={`flex flex-col items-center justify-center py-12 text-center rounded-2xl border ${
                    isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-[#171d2b]/5"
                }`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                        isSpooky ? "bg-purple-500/10" : "bg-[#171d2b]/5"
                    }`}>
                        {isSpooky ? (
                            <Ghost size={28} className="text-purple-400/50" />
                        ) : (
                            <Trophy size={28} className="text-[#171d2b]/30" />
                        )}
                    </div>
                    <h3 className={`font-sans font-medium text-[16px] mb-2 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
                        {isSpooky ? `No ${filter === "unlocked" ? "bound" : filter === "locked" ? "sealed" : ""} spirits` : `No ${filter} achievements`}
                    </h3>
                    <p className={`font-sans text-[13px] max-w-xs ${isSpooky ? "text-purple-300/50" : "text-[#171d2b]/50"}`}>
                        {filter === "unlocked" 
                            ? (isSpooky ? "Continue the dark studies to bind more spirits." : "Keep studying to unlock achievements.")
                            : (isSpooky ? "All spirits have been bound to your will." : "You have unlocked all achievements.")}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredAchievements.map((achievement: Achievement) => {
                        const IconComponent = ICON_MAP[achievement.icon as AchievementIcon] || Trophy;
                        const progressPercent = Math.round((achievement.progress / achievement.requirement_value) * 100);
                        const mutedBg = isSpooky 
                            ? (SPOOKY_BG_MAP[achievement.bg] || "bg-purple-500/20")
                            : (BG_MAP[achievement.bg] || achievement.bg);
                        const mutedColor = isSpooky
                            ? (SPOOKY_COLOR_MAP[achievement.color]?.color || "text-purple-400")
                            : (COLOR_MAP[achievement.color]?.color || achievement.color);

                        return (
                            <div
                                key={achievement.id}
                                className={`relative p-4 rounded-xl border transition-all ${
                                    achievement.unlocked
                                        ? (isSpooky 
                                            ? "bg-[#151821] border-purple-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]" 
                                            : "bg-white border-[#171d2b]/10 shadow-sm")
                                        : (isSpooky
                                            ? "bg-[#0d0f14] border-purple-500/10 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                                            : "bg-[#f9f9f7] border-[#171d2b]/5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100")
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full ${mutedBg} flex items-center justify-center mb-3 ${
                                    isSpooky && achievement.unlocked ? "achievement-unlocked" : ""
                                }`}>
                                    <IconComponent size={20} className={mutedColor} />
                                </div>
                                <h3 className={`font-sans font-medium text-[15px] mb-1 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
                                    {achievement.title}
                                </h3>
                                <p className={`font-sans text-[12px] mb-3 leading-tight ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>
                                    {achievement.description}
                                </p>
                                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSpooky ? "bg-purple-900/30" : "bg-[#171d2b]/5"}`}>
                                    <div
                                        className={`h-full rounded-full transition-all ${
                                            achievement.unlocked 
                                                ? (isSpooky ? "bg-purple-500" : "bg-[#c4875a]")
                                                : (isSpooky ? "bg-purple-700/50" : "bg-[#171d2b]/40")
                                        }`}
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <p className={`font-sans text-[10px] mt-1 ${isSpooky ? "text-purple-300/40" : "text-[#171d2b]/40"}`}>
                                    {achievement.progress}/{achievement.requirement_value}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function AchievementsSkeleton({ isSpooky }: { isSpooky: boolean }) {
    const skeletonBg = isSpooky ? "bg-purple-500/20" : "bg-[#171d2b]/10";
    const skeletonBgLight = isSpooky ? "bg-purple-500/10" : "bg-[#171d2b]/5";
    
    return (
        <div>
            <header className="mb-6 animate-pulse">
                <div className={`h-8 ${skeletonBg} rounded w-48 mb-2`} />
                <div className={`h-5 ${skeletonBgLight} rounded w-64`} />
            </header>
            <div className="flex gap-2 mb-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className={`h-10 w-20 ${skeletonBg} rounded-lg`} />
                ))}
            </div>
            <div className={`h-2 ${skeletonBgLight} rounded w-full mb-6`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className={`h-32 ${skeletonBgLight} rounded-xl`} />
                ))}
            </div>
        </div>
    );
}

function EmptyAchievements({ isSpooky }: { isSpooky: boolean }) {
    return (
        <div>
            <header className="mb-6">
                <h1 className={`font-serif text-[28px] mb-1 ${isSpooky ? "text-purple-100 spooky-glow" : "text-[#171d2b]"}`}>
                    {isSpooky ? "Soul Trophies" : "Achievements"}
                </h1>
                <p className={`font-sans text-[15px] ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>
                    {isSpooky ? "Bind the spirits of knowledge to your will" : "Track your progress and unlock rewards"}
                </p>
            </header>
            <div className={`flex flex-col items-center justify-center py-12 text-center rounded-2xl border ${
                isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-[#171d2b]/5"
            }`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    isSpooky ? "bg-purple-500/10" : "bg-[#171d2b]/5"
                }`}>
                    {isSpooky ? (
                        <Skull size={28} className="text-purple-400/50" />
                    ) : (
                        <Trophy size={28} className="text-[#171d2b]/30" />
                    )}
                </div>
                <h3 className={`font-sans font-medium text-[16px] mb-2 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
                    {isSpooky ? "No spirits bound yet" : "No achievements yet"}
                </h3>
                <p className={`font-sans text-[13px] max-w-xs ${isSpooky ? "text-purple-300/50" : "text-[#171d2b]/50"}`}>
                    {isSpooky 
                        ? "Begin the dark studies to bind spirits and track your corruption."
                        : "Start studying to unlock achievements and track your progress."}
                </p>
            </div>
        </div>
    );
}
