"use client";

import Link from "next/link";
import { Clock, Trophy, Zap, BrainCircuit, Star, Flame, Timer, BookOpen, FileText, Upload, Skull, Ghost } from "lucide-react";
import { createClient } from "@/config/supabase/client";
import { useState, useCallback, useSyncExternalStore } from "react";
import { useAchievementsStore, useThemeStore } from "@/lib/stores";
import type { Achievement, AchievementIcon } from "@/lib/schemas/achievements";

interface RecentActivityItem {
    id: string;
    title: string;
    type: 'flashcards' | 'reviewer' | 'achievement';
    date: string;
    timestamp: number;
    color: string;
    icon?: string;
}

const ICON_MAP: Record<string, typeof Trophy> = {
    Trophy, Zap, BrainCircuit, Star, Flame, Timer, Clock, BookOpen, FileText, Upload
};

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

function formatSpookyTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "Moments ago";
    if (diffMins < 60) return `${diffMins} moons ago`;
    if (diffHours < 24) return `${diffHours} shadows ago`;
    if (diffDays < 7) return `${diffDays} nights ago`;
    return date.toLocaleDateString();
}

function EmptyState({ isSpooky }: { isSpooky: boolean }) {
    return (
        <div className={`rounded-xl p-5 border flex flex-col items-center justify-center text-center ${
            isSpooky 
                ? "bg-[#1a1525] border-purple-500/20"
                : "bg-white border-[#171d2b]/5"
        }`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                isSpooky ? "bg-purple-500/10" : "bg-[#171d2b]/5"
            }`}>
                {isSpooky ? (
                    <Ghost size={20} className="text-purple-400/50" />
                ) : (
                    <Clock size={20} className="text-[#171d2b]/30" />
                )}
            </div>
            <h3 className={`font-sans font-medium text-[15px] mb-1 ${
                isSpooky ? "text-purple-200" : "text-[#171d2b]"
            }`}>
                {isSpooky ? "The spirits are silent..." : "No recent activity"}
            </h3>
            <p className={`font-sans text-[12px] max-w-xs ${
                isSpooky ? "text-purple-300/50" : "text-[#171d2b]/50"
            }`}>
                {isSpooky 
                    ? "Summon your first tome to begin the ritual."
                    : "Your recent files and achievements will appear here."
                }
            </p>
        </div>
    );
}

function LoadingSkeleton({ isSpooky }: { isSpooky: boolean }) {
    return (
        <div className="flex flex-col gap-2">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`rounded-xl p-3 border animate-pulse flex items-center gap-3 ${
                    isSpooky 
                        ? "bg-[#1a1525] border-purple-500/10"
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
    );
}

function AchievementRow({ item, isSpooky }: { item: RecentActivityItem; isSpooky: boolean }) {
    const IconComponent = ICON_MAP[item.icon as AchievementIcon] || Trophy;
    
    return (
        <div className={`group rounded-lg p-3 border transition-all flex items-center gap-3 ${
            isSpooky
                ? "bg-[#1a1525] border-purple-500/20 hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                : "bg-white border-[#171d2b]/5 hover:border-[#171d2b]/15 hover:shadow-sm"
        }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isSpooky 
                    ? "bg-purple-500/20 achievement-unlocked" 
                    : "bg-[#f5e6c8]"
            }`}>
                <IconComponent size={16} className={isSpooky ? "text-purple-400" : "text-[#c4875a]"} />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className={`font-sans font-medium text-[12px] truncate ${
                    isSpooky ? "text-purple-100" : "text-[#171d2b]"
                }`}>
                    {item.title}
                </h3>
                <div className={`flex items-center gap-1.5 text-[10px] font-sans ${
                    isSpooky ? "text-purple-300/50" : "text-[#171d2b]/50"
                }`}>
                    <span className={isSpooky ? "text-purple-400 font-medium" : "text-[#c4875a] font-medium"}>
                        {isSpooky ? "Soul Bound" : "Achievement"}
                    </span>
                    <span>·</span>
                    <span>{item.date}</span>
                </div>
            </div>
        </div>
    );
}

// Module-level flag for one-time fetch
let achievementsFetchTriggered = false;
function triggerAchievementsFetch() {
    if (!achievementsFetchTriggered) {
        achievementsFetchTriggered = true;
        queueMicrotask(() => {
            useAchievementsStore.getState().fetchAchievements();
        });
    }
}

export function SpookyRecentActivity() {
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";
    const [recentItems, setRecentItems] = useState<RecentActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { achievements } = useAchievementsStore();

    triggerAchievementsFetch();

    useSyncExternalStore(
        useCallback(() => {
            let mounted = true;
            const fetchRecent = async () => {
                const supabase = createClient();

                const { data: flashcardSets } = await supabase
                    .from("flashcard_sets")
                    .select("id, title, updated_at, last_studied")
                    .order("updated_at", { ascending: false })
                    .limit(4);

                const { data: reviewers } = await supabase
                    .from("reviewers")
                    .select("id, title, updated_at")
                    .order("updated_at", { ascending: false })
                    .limit(4);

                if (!mounted) return;

                const items: RecentActivityItem[] = [];
                const formatFn = isSpooky ? formatSpookyTimeAgo : formatTimeAgo;

                if (flashcardSets) {
                    flashcardSets.forEach(set => {
                        const timestamp = new Date(set.last_studied || set.updated_at).getTime();
                        items.push({
                            id: set.id,
                            title: set.title,
                            type: "flashcards",
                            date: formatFn(new Date(set.last_studied || set.updated_at)),
                            timestamp,
                            color: "",
                        });
                    });
                }

                if (reviewers) {
                    reviewers.forEach(rev => {
                        const timestamp = new Date(rev.updated_at).getTime();
                        items.push({
                            id: rev.id,
                            title: rev.title,
                            type: "reviewer",
                            date: formatFn(new Date(rev.updated_at)),
                            timestamp,
                            color: "",
                        });
                    });
                }

                const unlockedAchievements = achievements.filter((a: Achievement) => a.unlocked && a.unlocked_at);
                unlockedAchievements.slice(-2).forEach((achievement: Achievement) => {
                    const unlockedDate = new Date(achievement.unlocked_at as string);
                    items.push({
                        id: achievement.id,
                        title: achievement.title,
                        type: "achievement",
                        date: formatFn(unlockedDate),
                        timestamp: unlockedDate.getTime(),
                        color: "",
                        icon: achievement.icon,
                    });
                });

                items.sort((a, b) => b.timestamp - a.timestamp);
                setRecentItems(items.slice(0, 5));
                setLoading(false);
            };

            fetchRecent();
            return () => { mounted = false; };
        }, [achievements, isSpooky]),
        () => null,
        () => null
    );

    return (
        <div className={`rounded-xl border shadow-sm overflow-hidden h-full flex flex-col ${
            isSpooky 
                ? "bg-[#151821] border-purple-500/20"
                : "bg-white border-[#171d2b]/5"
        }`}>
            {/* Header */}
            <div className={`px-3 py-2 border-b ${
                isSpooky 
                    ? "bg-purple-900/30 border-purple-500/20"
                    : "bg-[#f5e6c8] border-[#171d2b]/5"
            }`}>
                <div className="flex items-center gap-2">
                    {isSpooky ? (
                        <Skull size={16} className="text-purple-400" />
                    ) : (
                        <Trophy size={16} className="text-[#171d2b]/70" />
                    )}
                    <h2 className={`font-serif-4 text-sm ${
                        isSpooky ? "text-purple-200" : "text-[#171d2b]"
                    }`}>
                        {isSpooky ? "Recent Summonings" : "Recent Activity"}
                    </h2>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 overflow-y-auto">
                {loading ? (
                    <LoadingSkeleton isSpooky={isSpooky} />
                ) : recentItems.length === 0 ? (
                    <EmptyState isSpooky={isSpooky} />
                ) : (
                    <div className="flex flex-col gap-2">
                        {recentItems.map((item) => (
                            item.type === 'achievement' ? (
                                <AchievementRow key={item.id} item={item} isSpooky={isSpooky} />
                            ) : (
                                <Link
                                    key={item.id}
                                    href={`/materials/${item.id}`}
                                    className={`group rounded-lg p-3 border transition-all flex items-center gap-3 ${
                                        isSpooky
                                            ? "bg-[#1a1525] border-purple-500/10 hover:border-purple-500/30 hover:shadow-[0_0_10px_rgba(139,92,246,0.05)]"
                                            : "bg-[#f5f5f0] border-[#171d2b]/5 hover:border-[#171d2b]/15 hover:shadow-sm"
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                        isSpooky ? "bg-purple-500/10" : "bg-white"
                                    }`}>
                                        {item.type === 'flashcards' ? (
                                            <FileText size={14} className={isSpooky ? "text-purple-400/60" : "text-[#171d2b]/60"} />
                                        ) : (
                                            <BookOpen size={14} className={isSpooky ? "text-purple-400/60" : "text-[#171d2b]/60"} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-sans font-medium text-[12px] truncate transition-colors ${
                                            isSpooky 
                                                ? "text-purple-100 group-hover:text-purple-200" 
                                                : "text-[#171d2b] group-hover:text-[#171d2b]/70"
                                        }`}>
                                            {item.title}
                                        </h3>
                                        <div className={`flex items-center gap-1.5 text-[10px] font-sans ${
                                            isSpooky ? "text-purple-300/50" : "text-[#171d2b]/50"
                                        }`}>
                                            <span>
                                                {isSpooky 
                                                    ? (item.type === 'flashcards' ? 'Spell Cards' : 'Grimoire')
                                                    : (item.type === 'flashcards' ? 'Flashcards' : 'Reviewer')
                                                }
                                            </span>
                                            <span>·</span>
                                            <span>{item.date}</span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
