"use client";

import { useThemeStore } from "@/lib/stores";
import { useEffect, useRef, useCallback } from "react";

export function SpookyAmbientSound() {
    const { theme, soundEnabled } = useThemeStore();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isSpooky = theme === "spooky";
    const shouldPlay = isSpooky && soundEnabled;

    // Initialize audio instance once
    useEffect(() => {
        if (!audioRef.current) {
            const audio = new Audio("/sounds/AmbientNoise10min.MP3");
            audio.loop = true;
            audio.volume = 0.3;
            audio.preload = "auto";
            audioRef.current = audio;
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
                audioRef.current = null;
            }
        };
    }, []);

    // Handle play/pause based on state
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (shouldPlay) {
            // Ensure audio is ready before playing
            const playAudio = () => {
                audio.play().catch((err) => {
                    console.warn("Audio play failed:", err.message);
                });
            };

            if (audio.readyState >= 3) {
                playAudio();
            } else {
                audio.addEventListener("canplaythrough", playAudio, { once: true });
                audio.load();
            }
        } else {
            audio.pause();
        }
    }, [shouldPlay]);

    // Handle user interaction to unlock audio (for autoplay policy)
    const unlockAudio = useCallback(() => {
        const audio = audioRef.current;
        if (audio && shouldPlay && audio.paused) {
            audio.play().catch(() => {});
        }
    }, [shouldPlay]);

    useEffect(() => {
        document.addEventListener("click", unlockAudio, { once: true });
        document.addEventListener("keydown", unlockAudio, { once: true });
        
        return () => {
            document.removeEventListener("click", unlockAudio);
            document.removeEventListener("keydown", unlockAudio);
        };
    }, [unlockAudio]);

    return null;
}
