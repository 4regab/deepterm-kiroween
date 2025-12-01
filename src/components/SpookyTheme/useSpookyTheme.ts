"use client";

import { useThemeStore } from "@/lib/stores";

/**
 * Hook that provides theme-aware styling utilities
 * Use this to easily add spooky theme support to any component
 */
export function useSpookyTheme() {
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";

    return {
        isSpooky,
        theme,
        
        // Background colors
        bgPrimary: isSpooky ? "bg-[#0d0f14]" : "bg-[#f0f0ea]",
        bgCard: isSpooky ? "bg-[#151821]" : "bg-white",
        bgCardHover: isSpooky ? "hover:bg-[#1a1d26]" : "hover:bg-gray-50",
        bgAccent: isSpooky ? "bg-purple-900/30" : "bg-[#f5e6c8]",
        bgMuted: isSpooky ? "bg-[#1a1525]" : "bg-[#f5f5f0]",
        bgInput: isSpooky ? "bg-[#151821]" : "bg-white",
        bgButton: isSpooky ? "bg-purple-600" : "bg-[#171d2b]",
        bgButtonHover: isSpooky ? "hover:bg-purple-500" : "hover:bg-[#2a3347]",
        bgProgress: isSpooky ? "bg-purple-900/30" : "bg-[#171d2b]/5",
        bgProgressFill: isSpooky 
            ? "bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-500" 
            : "bg-gradient-to-r from-[#c4a574] to-[#c4875a]",
        
        // Text colors
        textPrimary: isSpooky ? "text-purple-100" : "text-[#171d2b]",
        textSecondary: isSpooky ? "text-purple-300/70" : "text-[#171d2b]/60",
        textMuted: isSpooky ? "text-purple-300/40" : "text-[#171d2b]/40",
        textAccent: isSpooky ? "text-purple-400" : "text-[#c4875a]",
        
        // Border colors
        borderColor: isSpooky ? "border-purple-500/20" : "border-[#171d2b]/10",
        borderHover: isSpooky ? "hover:border-purple-500/40" : "hover:border-[#171d2b]/20",
        
        // Special effects
        glowClass: isSpooky ? "spooky-glow" : "",
        cardShadow: isSpooky ? "shadow-[0_0_15px_rgba(139,92,246,0.1)]" : "shadow-sm",
        
        // Skeleton colors
        skeletonBg: isSpooky ? "bg-purple-500/20" : "bg-[#171d2b]/10",
        skeletonBgLight: isSpooky ? "bg-purple-500/10" : "bg-[#171d2b]/5",
    };
}

// Spooky text alternatives
export const SPOOKY_TEXT = {
    // Page titles
    achievements: "Soul Trophies",
    materials: "Forbidden Archives",
    pomodoro: "Dark Ritual Timer",
    dashboard: "The Crypt",
    
    // Labels
    unlocked: "Bound",
    locked: "Sealed",
    progress: "Corruption",
    focusTime: "Summoning Phase",
    shortBreak: "Brief Respite",
    longBreak: "Deep Slumber",
    tasks: "Dark Deeds",
    
    // Actions
    start: "Begin Ritual",
    pause: "Suspend",
    reset: "Dispel",
    add: "Conjure",
    delete: "Banish",
    edit: "Alter",
    
    // Status
    completed: "Vanquished",
    noTasks: "No dark deeds yet. Conjure one above!",
    noAchievements: "The spirits are silent...",
};
