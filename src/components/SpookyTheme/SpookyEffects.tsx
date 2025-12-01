"use client";

import { useThemeStore } from "@/lib/stores";
import { useState, useSyncExternalStore, useCallback } from "react";

interface Ember {
    id: number;
    left: number;
    delay: number;
    duration: number;
    size: number;
}

interface Ghost {
    id: number;
    left: number;
    top: number;
    delay: number;
    opacity: number;
}

// Generate embers once on client
function generateEmbers(): Ember[] {
    return Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 8 + Math.random() * 6,
        size: 2 + Math.random() * 4,
    }));
}

// Generate ghosts once on client
function generateGhosts(): Ghost[] {
    return Array.from({ length: 5 }, (_, i) => ({
        id: i,
        left: 10 + Math.random() * 80,
        top: 10 + Math.random() * 80,
        delay: Math.random() * 5,
        opacity: 0.03 + Math.random() * 0.05,
    }));
}

export function SpookyEffects() {
    const theme = useThemeStore((state) => state.theme);
    
    // Use useSyncExternalStore to safely detect client-side mounting
    const mounted = useSyncExternalStore(
        useCallback(() => () => {}, []),
        () => true,
        () => false
    );
    
    // Initialize embers and ghosts only on client using lazy initialization
    const [embers] = useState<Ember[]>(() => (typeof window !== 'undefined' ? generateEmbers() : []));
    const [ghosts] = useState<Ghost[]>(() => (typeof window !== 'undefined' ? generateGhosts() : []));

    if (!mounted || theme !== "spooky") return null;

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Fog layers */}
            <div className="absolute inset-0">
                <div 
                    className="fog-layer absolute w-[200%] h-32 bottom-0 opacity-20"
                    style={{
                        background: "linear-gradient(to top, rgba(139, 92, 246, 0.1), transparent)",
                        animationDelay: "0s",
                    }}
                />
                <div 
                    className="fog-layer absolute w-[200%] h-48 bottom-0 opacity-15"
                    style={{
                        background: "linear-gradient(to top, rgba(168, 85, 247, 0.08), transparent)",
                        animationDelay: "-15s",
                    }}
                />
            </div>

            {/* Floating embers */}
            {embers.map((ember) => (
                <div
                    key={ember.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${ember.left}%`,
                        bottom: "-10px",
                        width: `${ember.size}px`,
                        height: `${ember.size}px`,
                        background: `radial-gradient(circle, #f97316 0%, #dc2626 50%, transparent 100%)`,
                        boxShadow: `0 0 ${ember.size * 2}px #f97316`,
                        animation: `emberFloat ${ember.duration}s ease-in-out infinite`,
                        animationDelay: `${ember.delay}s`,
                    }}
                />
            ))}

            {/* Ghost wisps */}
            {ghosts.map((ghost) => (
                <div
                    key={ghost.id}
                    className="ghost-float absolute w-32 h-32 rounded-full blur-3xl"
                    style={{
                        left: `${ghost.left}%`,
                        top: `${ghost.top}%`,
                        background: `radial-gradient(circle, rgba(255,255,255,${ghost.opacity}) 0%, transparent 70%)`,
                        animationDelay: `${ghost.delay}s`,
                    }}
                />
            ))}

            {/* Vignette overlay */}
            <div 
                className="absolute inset-0"
                style={{
                    background: "radial-gradient(ellipse at center, transparent 0%, rgba(13, 15, 20, 0.4) 100%)",
                }}
            />
        </div>
    );
}
