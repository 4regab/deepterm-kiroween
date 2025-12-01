"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/lib/stores";
import { motion } from "framer-motion";

export function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore();
    const isSpooky = theme === "spooky";

    return (
        <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
                onClick={toggleTheme}
                className={`
                    relative p-2 rounded-lg border transition-all
                    ${isSpooky 
                        ? "bg-[#1a1525] border-purple-500/30 hover:border-purple-500/50 text-purple-400" 
                        : "bg-transparent border-[#171d2b]/20 hover:border-[#171d2b]/40 text-[#171d2b]/70 hover:text-[#171d2b]"
                    }
                `}
                aria-label={isSpooky ? "Switch to normal theme" : "Switch to spooky theme"}
            >
                <motion.div
                    initial={false}
                    animate={{ rotate: isSpooky ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {isSpooky ? <Sun size={18} /> : <Moon size={18} />}
                </motion.div>
                
                {/* Spooky glow effect */}
                {isSpooky && (
                    <div className="absolute inset-0 rounded-lg bg-purple-500/10 blur-sm -z-10" />
                )}
            </button>
        </div>
    );
}
