"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "normal" | "spooky";

interface ThemeState {
    theme: ThemeMode;
    soundEnabled: boolean;
    setTheme: (theme: ThemeMode) => void;
    toggleTheme: () => void;
    setSoundEnabled: (enabled: boolean) => void;
    toggleSound: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: "normal",
            soundEnabled: false,
            setTheme: (theme) => set({ theme }),
            toggleTheme: () => set({ theme: get().theme === "normal" ? "spooky" : "normal" }),
            setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
            toggleSound: () => set({ soundEnabled: !get().soundEnabled }),
        }),
        {
            name: "deepterm-theme",
        }
    )
);
