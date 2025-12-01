"use client";

import React from "react";
import { useThemeStore } from "@/lib/stores";

export type ItemStatus = 'new' | 'learning' | 'almost_done' | 'mastered';

export interface StudyItem {
    id: string;
    status: ItemStatus;
}

interface StudyingProgressProps {
    items: StudyItem[];
    className?: string;
}

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

export default function StudyingProgress({ items, className = "" }: StudyingProgressProps) {
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

    return (
        <div className={`rounded-2xl p-5 shadow-sm border ${
            isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-gray-100"
        } ${className}`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className={`font-bold text-sm ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
                    {isSpooky ? "Dark Progress" : "Studying Progress"}
                </h2>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isSpooky ? "bg-purple-500/20 text-purple-300" : "bg-gray-100 text-[#171d2b]"
                }`}>{progressPercentage}%</span>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isSpooky ? "bg-purple-500/20 text-purple-400" : "bg-[#171d2b]/10 text-[#171d2b]"
                    }`}>
                        <div className="w-2 h-2 rounded-full border-2 border-current" />
                    </div>
                    <span className={`w-28 text-xs font-bold ${isSpooky ? "text-purple-300/60" : "text-gray-600"}`}>
                        {isSpooky ? "Unlearned" : "New cards"}
                    </span>
                    <ProgressBar value={stats.new} max={stats.total} colorClass={isSpooky ? "bg-purple-500" : "bg-[#171d2b]/80"} isSpooky={isSpooky} />
                    <span className={`w-6 text-right font-bold text-sm ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{stats.new}</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isSpooky ? "bg-violet-500/20 text-violet-400" : "bg-[#8B5CF6]/10 text-[#8B5CF6]"
                    }`}>
                        <div className="w-2 h-2 rounded-full border-2 border-current" />
                    </div>
                    <span className={`w-28 text-xs font-bold ${isSpooky ? "text-purple-300/60" : "text-gray-600"}`}>
                        {isSpooky ? "Channeling" : "Still learning"}
                    </span>
                    <ProgressBar value={stats.learning} max={stats.total} colorClass="bg-[#8B5CF6]" isSpooky={isSpooky} />
                    <span className={`w-6 text-right font-bold text-sm ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{stats.learning}</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isSpooky ? "bg-blue-500/20 text-blue-400" : "bg-[#60A5FA]/10 text-[#60A5FA]"
                    }`}>
                        <div className="w-2 h-2 rounded-full border-2 border-current" />
                    </div>
                    <span className={`w-28 text-xs font-bold ${isSpooky ? "text-purple-300/60" : "text-gray-600"}`}>
                        {isSpooky ? "Nearly bound" : "Almost done"}
                    </span>
                    <ProgressBar value={stats.almost_done} max={stats.total} colorClass="bg-[#60A5FA]" isSpooky={isSpooky} />
                    <span className={`w-6 text-right font-bold text-sm ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{stats.almost_done}</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isSpooky ? "bg-green-500/20 text-green-400" : "bg-[#10B981]/10 text-[#10B981]"
                    }`}>
                        <div className="w-2 h-2 rounded-full border-2 border-current" />
                    </div>
                    <span className={`w-28 text-xs font-bold ${isSpooky ? "text-purple-300/60" : "text-gray-600"}`}>
                        {isSpooky ? "Mastered" : "Mastered"}
                    </span>
                    <ProgressBar value={stats.mastered} max={stats.total} colorClass="bg-[#10B981]" isSpooky={isSpooky} />
                    <span className={`w-6 text-right font-bold text-sm ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{stats.mastered}</span>
                </div>
            </div>
        </div>
    );
}
