"use client";

import React from "react";
import { Pencil } from "lucide-react";
import { HappyBirdMascot } from "./EmotionalAssets";
import { useThemeStore } from "@/lib/stores";

// Cauldron icon for session results
const CauldronIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C9.5 2 7.5 3.5 7 5.5C5.5 5.8 4 7 4 9c0 1.5.8 2.8 2 3.5V14c0 4.4 3.6 8 8 8s8-3.6 8-8v-1.5c1.2-.7 2-2 2-3.5 0-2-1.5-3.2-3-3.5-.5-2-2.5-3.5-5-3.5zm-4 9c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm4 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm4 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
        <path d="M6 6c.5-1 1.5-2 3-2.5M18 6c-.5-1-1.5-2-3-2.5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5"/>
    </svg>
);

export type ItemStatus = 'new' | 'learning' | 'almost_done' | 'mastered' | 'incorrect';

export interface ResultItem {
    id: string;
    term: string;
    definition: string;
    status: ItemStatus;
}

interface SessionResultPageProps {
    level?: number;
    currentXp?: number;
    requiredXp?: number;
    xpEarned?: number;
    correctCount: number;
    totalCount: number;
    items: ResultItem[];
    onContinue: () => void;
    onExit?: () => void;
    onTryAgain?: () => void;
    title?: string;
    hideStudyProgress?: boolean;
    continueButtonText?: string;
    showPressAnyKey?: boolean;
}

const StatusBadge = ({ status, isSpooky }: { status: ItemStatus; isSpooky: boolean }) => {
    // In spooky mode, use purple shades instead of red/green
    const styles = isSpooky ? {
        new: "bg-purple-500/20 text-purple-300",
        learning: "bg-violet-500/20 text-violet-300",
        almost_done: "bg-indigo-500/20 text-indigo-300",
        mastered: "bg-fuchsia-500/20 text-fuchsia-300",
        incorrect: "bg-purple-900/40 text-purple-400"
    } : {
        new: "bg-pink-100 text-pink-600",
        learning: "bg-purple-100 text-purple-600",
        almost_done: "bg-blue-100 text-blue-600",
        mastered: "bg-green-100 text-green-600",
        incorrect: "bg-red-100 text-red-600"
    };

    const labels = isSpooky ? {
        new: "Unlearned",
        learning: "Channeling",
        almost_done: "Nearly bound",
        mastered: "Soul bound",
        incorrect: "Failed"
    } : {
        new: "New cards",
        learning: "Still learning",
        almost_done: "Almost done",
        mastered: "Mastered",
        incorrect: "Incorrect"
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 w-fit ${styles[status]}`}>
            <div className={`w-2 h-2 rounded-full border-2 border-current`} />
            {labels[status]}
        </span>
    );
};

const ProgressBar = ({ value, max, colorClass, isSpooky }: { value: number, max: number, colorClass: string, isSpooky: boolean }) => {
    return (
        <div className={`flex-1 h-2 rounded-full overflow-hidden ${isSpooky ? "bg-purple-900/30" : "bg-gray-100"}`}>
            <div
                className={`h-full rounded-full ${colorClass}`}
                style={{ width: `${(value / max) * 100}%` }}
            />
        </div>
    );
};

export default function SessionResultPage({
    level = 1,
    currentXp = 0,
    requiredXp = 100,
    xpEarned = 0,
    correctCount,
    totalCount,
    items,
    onContinue,
    onExit,
    onTryAgain,
    title = "You're doing great, keep going!",
    hideStudyProgress = false,
    continueButtonText = "Next",
    showPressAnyKey = true
}: SessionResultPageProps) {
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";

    // Calculate stats
    const stats = {
        new: items.filter(i => i.status === 'new').length,
        learning: items.filter(i => i.status === 'learning').length,
        almost_done: items.filter(i => i.status === 'almost_done').length,
        mastered: items.filter(i => i.status === 'mastered').length,
        total: items.length
    };

    const progressPercentage = Math.round(((stats.mastered + stats.almost_done * 0.5) / stats.total) * 100) || 0;
    const displayTitle = isSpooky ? "The dark spirits are pleased..." : title;

    return (
        <div className={`min-h-screen py-12 px-4 flex flex-col items-center ${isSpooky ? "bg-[#0a0b0f]" : "bg-[#f0f0ea]"}`}>

            {/* Mascot & Title */}
            <div className="text-center mb-8">
                <div className="w-32 h-32 mx-auto mb-4 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        {isSpooky ? <CauldronIcon className="w-24 h-24 text-purple-400" /> : <HappyBirdMascot />}
                    </div>
                </div>
                <h1 className={`text-2xl font-bold ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{displayTitle}</h1>
            </div>

            {/* Main Stats Card */}
            <div className={`w-full max-w-4xl rounded-3xl p-6 shadow-sm border mb-8 ${
                isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-gray-100"
            }`}>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    {/* Level Progress */}
                    <div className="flex-1 w-full">
                        <div className="flex justify-between mb-2">
                            <span className={`font-bold text-sm ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
                                {isSpooky ? "Dark Level" : "Level"} {level}
                            </span>
                        </div>
                        <div className={`h-3 rounded-full overflow-hidden relative ${isSpooky ? "bg-purple-900/30" : "bg-gray-100"}`}>
                            <div
                                className="absolute top-0 left-0 h-full bg-[#8B5CF6] rounded-full"
                                style={{ width: `${Math.min((currentXp / requiredXp) * 100, 100)}%` }}
                            />
                        </div>
                        <div className={`mt-1 text-xs font-medium ${isSpooky ? "text-purple-400/60" : "text-gray-400"}`}>{currentXp}/{requiredXp}XP</div>
                    </div>

                    {/* Session Stats */}
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className={`flex-1 md:flex-none rounded-xl p-3 text-center min-w-[100px] ${
                            isSpooky ? "bg-purple-500/10" : "bg-gray-50"
                        }`}>
                            <div className={`text-xl font-bold ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{correctCount}/{totalCount}</div>
                            <div className={`text-xs font-bold ${isSpooky ? "text-purple-400/60" : "text-gray-500"}`}>{isSpooky ? "Bound" : "Correct"}</div>
                        </div>
                        <div className={`flex-1 md:flex-none rounded-xl p-3 text-center min-w-[100px] flex flex-col items-center justify-center ${
                            isSpooky ? "bg-purple-600/20" : "bg-blue-50"
                        }`}>
                            <div className={`text-xl font-bold flex items-center gap-1 ${isSpooky ? "text-purple-300" : "text-blue-600"}`}>
                                {xpEarned} <Pencil size={14} className="fill-current" />
                            </div>
                            <div className={`text-xs font-bold ${isSpooky ? "text-purple-400/60" : "text-blue-400"}`}>{isSpooky ? "Dark Essence" : "XP Earned"}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Bar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`rounded-full shadow-xl border p-2 pl-6 flex items-center gap-4 ${
                    isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-gray-100"
                }`}>
                    {showPressAnyKey && !onTryAgain && !onExit && <span className={`font-bold text-sm hidden sm:block ${isSpooky ? "text-purple-300" : "text-[#171d2b]"}`}>Press any key to continue</span>}
                    {onExit && (
                        <button
                            onClick={onExit}
                            className={`px-6 py-3 rounded-full font-bold transition-colors ${
                                isSpooky ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30" : "bg-gray-100 text-[#171d2b] hover:bg-gray-200"
                            }`}
                        >
                            {isSpooky ? "Abandon" : "Exit"}
                        </button>
                    )}
                    {onTryAgain && (
                        <button
                            onClick={onContinue}
                            className={`px-6 py-3 rounded-full font-bold transition-colors ${
                                isSpooky ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30" : "bg-gray-100 text-[#171d2b] hover:bg-gray-200"
                            }`}
                        >
                            {continueButtonText}
                        </button>
                    )}
                    <button
                        onClick={onTryAgain ? onTryAgain : onContinue}
                        className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-colors ${
                            isSpooky ? "bg-purple-600 text-white hover:bg-purple-500" : "bg-[#2D9F83] text-white hover:bg-[#258a70]"
                        }`}
                    >
                        {onTryAgain ? (isSpooky ? "Retry Ritual" : "Try Again") : onExit ? "Next" : continueButtonText} {!onTryAgain && !onExit && continueButtonText === "Next" && <Pencil size={16} className="fill-current" />}
                    </button>
                </div>
            </div>

            {/* Studying Progress */}
            {!hideStudyProgress && (
                <div className={`w-full max-w-4xl rounded-3xl p-8 shadow-sm border mb-8 ${
                    isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-gray-100"
                }`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className={`font-bold ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{isSpooky ? "Dark Progress" : "Studying Progress"}</h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            isSpooky ? "bg-purple-500/20 text-purple-300" : "bg-gray-100 text-[#171d2b]"
                        }`}>{progressPercentage}%</span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSpooky ? "bg-purple-500/20 text-purple-400" : "bg-pink-100 text-pink-600"}`}>
                                <div className="w-3 h-3 rounded-full border-2 border-current" />
                            </div>
                            <span className={`w-32 text-sm font-bold ${isSpooky ? "text-purple-300/60" : "text-gray-600"}`}>{isSpooky ? "Unlearned" : "New cards"}</span>
                            <ProgressBar value={stats.new} max={stats.total} colorClass={isSpooky ? "bg-purple-500" : "bg-pink-400"} isSpooky={isSpooky} />
                            <span className={`w-8 text-right font-bold ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{stats.new}</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSpooky ? "bg-violet-500/20 text-violet-400" : "bg-purple-100 text-purple-600"}`}>
                                <div className="w-3 h-3 rounded-full border-2 border-current" />
                            </div>
                            <span className={`w-32 text-sm font-bold ${isSpooky ? "text-purple-300/60" : "text-gray-600"}`}>{isSpooky ? "Channeling" : "Still learning"}</span>
                            <ProgressBar value={stats.learning} max={stats.total} colorClass="bg-purple-400" isSpooky={isSpooky} />
                            <span className={`w-8 text-right font-bold ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{stats.learning}</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSpooky ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
                                <div className="w-3 h-3 rounded-full border-2 border-current" />
                            </div>
                            <span className={`w-32 text-sm font-bold ${isSpooky ? "text-purple-300/60" : "text-gray-600"}`}>{isSpooky ? "Nearly bound" : "Almost done"}</span>
                            <ProgressBar value={stats.almost_done} max={stats.total} colorClass="bg-blue-400" isSpooky={isSpooky} />
                            <span className={`w-8 text-right font-bold ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{stats.almost_done}</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSpooky ? "bg-fuchsia-500/20 text-fuchsia-400" : "bg-green-100 text-green-600"}`}>
                                <div className="w-3 h-3 rounded-full border-2 border-current" />
                            </div>
                            <span className={`w-32 text-sm font-bold ${isSpooky ? "text-purple-300/60" : "text-gray-600"}`}>{isSpooky ? "Soul bound" : "Mastered"}</span>
                            <ProgressBar value={stats.mastered} max={stats.total} colorClass={isSpooky ? "bg-fuchsia-500" : "bg-green-400"} isSpooky={isSpooky} />
                            <span className={`w-8 text-right font-bold ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{stats.mastered}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Items List */}
            <div className="w-full max-w-4xl space-y-4 pb-24">
                {items.map((item) => (
                    <div key={item.id} className={`rounded-2xl p-6 shadow-sm border ${
                        isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-gray-100"
                    }`}>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className={`font-bold uppercase tracking-wide ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{item.term}</h3>
                            <StatusBadge status={item.status} isSpooky={isSpooky} />
                        </div>
                        <p className={`text-sm leading-relaxed ${isSpooky ? "text-purple-300/60" : "text-gray-500"}`}>{item.definition}</p>
                    </div>
                ))}
            </div>

        </div>
    );
}
