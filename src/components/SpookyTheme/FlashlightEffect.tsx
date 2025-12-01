"use client";

import { useState, useCallback } from "react";
import { useThemeStore } from "@/lib/stores";

// SVG Icons for spooky theme
const FlashlightIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" />
        <path d="M8.5 8.5 4 13l7 7 4.5-4.5" />
        <path d="m14 4 6 6-4.5 4.5-6-6L14 4Z" />
    </svg>
);

const GhostIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C7.58 2 4 5.58 4 10v10.5c0 .83 1 1.25 1.59.66l1.41-1.41 1.41 1.41c.78.78 2.05.78 2.83 0L12 20.41l.76.75c.78.78 2.05.78 2.83 0l1.41-1.41 1.41 1.41c.59.59 1.59.17 1.59-.66V10c0-4.42-3.58-8-8-8zm-2 8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
    </svg>
);

const PumpkinIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2c-.5 0-1 .19-1.41.59l-.83.83C8.77 2.54 7.64 2 6.5 2A4.5 4.5 0 0 0 2 6.5c0 1.14.54 2.27 1.42 3.26l.83.83c-.4.41-.59.91-.59 1.41 0 1.1.9 2 2 2h.5c.28 2.9 2.5 5.2 5.34 5.84V22h2v-2.16c2.84-.64 5.06-2.94 5.34-5.84h.5c1.1 0 2-.9 2-2 0-.5-.19-1-.59-1.41l.83-.83c.88-.99 1.42-2.12 1.42-3.26A4.5 4.5 0 0 0 17.5 2c-1.14 0-2.27.54-3.26 1.42l-.83.83c-.41-.4-.91-.59-1.41-.59zM9 10c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1v-2c0-.55.45-1 1-1zm6 0c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1v-2c0-.55.45-1 1-1z"/>
    </svg>
);

const SkullIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12v4c0 1.1.9 2 2 2h1v2c0 1.1.9 2 2 2h2v-2h2v2h2v-2h2v2h2c1.1 0 2-.9 2-2v-2h1c1.1 0 2-.9 2-2v-4c0-5.52-4.48-10-10-10zM8 13c-.83 0-1.5-.67-1.5-1.5S7.17 10 8 10s1.5.67 1.5 1.5S8.83 13 8 13zm8 0c-.83 0-1.5-.67-1.5-1.5S15.17 10 16 10s1.5.67 1.5 1.5S16.83 13 16 13z"/>
    </svg>
);

interface FlashlightEffectProps {
    children: React.ReactNode;
    enabled?: boolean;
    radius?: number;
}

/**
 * Flashlight effect component - creates a dark overlay where only the area
 * around the mouse cursor is visible, like a flashlight in the dark.
 * 
 * Perfect for spooky flashcard study modes!
 */
export function FlashlightEffect({ 
    children, 
    enabled = true,
    radius = 180 
}: FlashlightEffectProps) {
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isActive, setIsActive] = useState(false);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        if (!isActive) setIsActive(true);
    }, [isActive]);

    const handleMouseLeave = useCallback(() => {
        setIsActive(false);
    }, []);

    // Only apply effect in spooky mode and when enabled
    if (!isSpooky || !enabled) {
        return <>{children}</>;
    }

    return (
        <div 
            className="relative w-full h-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            
            {/* PITCH BLACK overlay with tight flashlight cutout */}
            <div 
                className="absolute inset-0 pointer-events-none z-50"
                style={{
                    background: isActive 
                        ? `radial-gradient(circle ${radius}px at ${mousePos.x}px ${mousePos.y}px, 
                            transparent 0%, 
                            transparent 20%,
                            rgba(0, 0, 0, 0.85) 40%,
                            rgba(0, 0, 0, 0.97) 60%,
                            #000000 100%)`
                        : '#000000',
                }}
            />
            
            {/* Eerie glow around flashlight */}
            {isActive && (
                <div 
                    className="absolute pointer-events-none z-40"
                    style={{
                        left: mousePos.x - radius,
                        top: mousePos.y - radius,
                        width: radius * 2,
                        height: radius * 2,
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
                        borderRadius: '50%',
                    }}
                />
            )}

            {/* Hint text when not active */}
            {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="text-purple-400/70 text-center">
                        <FlashlightIcon className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                        <p className="text-lg font-medium animate-pulse">Move your cursor to see...</p>
                        <p className="text-sm mt-2 text-purple-500/50">The darkness conceals all</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export { GhostIcon, PumpkinIcon, SkullIcon, FlashlightIcon };

/**
 * INTENSE dark study mode - pitch black with focused flashlight beam
 * Users MUST move their mouse/finger to see content - creates immersive study experience
 * Supports both mouse and touch for mobile devices
 * Flashlight size increased 50% for easier navigation (300px default)
 */
export function DarkStudyMode({ 
    children,
    enabled = true,
    flashlightSize = 300
}: { 
    children: React.ReactNode;
    enabled?: boolean;
    flashlightSize?: number;
}) {
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";
    const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
    const [hasInteracted, setHasInteracted] = useState(false);

    // Mouse handler
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        setMousePos({ x: e.clientX, y: e.clientY });
        if (!hasInteracted) setHasInteracted(true);
    }, [hasInteracted]);

    // Touch handler for mobile
    const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            setMousePos({ x: touch.clientX, y: touch.clientY });
            if (!hasInteracted) setHasInteracted(true);
        }
    }, [hasInteracted]);

    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            setMousePos({ x: touch.clientX, y: touch.clientY });
            if (!hasInteracted) setHasInteracted(true);
        }
    }, [hasInteracted]);

    if (!isSpooky || !enabled) {
        return <>{children}</>;
    }

    return (
        <div 
            className="relative min-h-screen"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onTouchStart={handleTouchStart}
        >
            {children}
            
            {/* PITCH BLACK overlay - only flashlight reveals content */}
            <div 
                className="fixed inset-0 pointer-events-none z-[100]"
                style={{
                    background: hasInteracted 
                        ? `radial-gradient(circle ${flashlightSize}px at ${mousePos.x}px ${mousePos.y}px, 
                            transparent 0%, 
                            transparent 25%,
                            rgba(0, 0, 0, 0.5) 40%,
                            rgba(0, 0, 0, 0.85) 60%,
                            rgba(0, 0, 0, 0.97) 80%,
                            #000000 100%)`
                        : '#000000',
                }}
            />

            {/* Subtle purple glow at flashlight edge */}
            {hasInteracted && (
                <div 
                    className="fixed pointer-events-none z-[99]"
                    style={{
                        left: mousePos.x - flashlightSize,
                        top: mousePos.y - flashlightSize,
                        width: flashlightSize * 2,
                        height: flashlightSize * 2,
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(88, 28, 135, 0.04) 50%, transparent 70%)',
                        borderRadius: '50%',
                    }}
                />
            )}

            {/* Flickering effect overlay */}
            {hasInteracted && (
                <div 
                    className="fixed inset-0 pointer-events-none z-[98] animate-flicker"
                    style={{
                        background: `radial-gradient(circle ${flashlightSize + 30}px at ${mousePos.x}px ${mousePos.y}px, 
                            rgba(255, 255, 255, 0.015) 0%, 
                            transparent 100%)`,
                    }}
                />
            )}

            {/* Initial prompt - spooky entrance */}
            {!hasInteracted && (
                <div className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none bg-black">
                    <div className="text-center px-4">
                        <FlashlightIcon className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 text-purple-400 animate-bounce" />
                        <p className="text-purple-300 text-xl sm:text-2xl font-medium animate-pulse mb-2">
                            The room is pitch black...
                        </p>
                        <p className="text-purple-400/60 text-sm sm:text-base">
                            Move your finger or cursor to illuminate
                        </p>
                        <p className="text-purple-500/40 text-xs sm:text-sm mt-4 italic">
                            Find the answers hidden in the shadows
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Global dark wrapper for all spooky pages - applies dark background
 * without the flashlight effect (for non-study pages)
 */
export function SpookyPageWrapper({ 
    children 
}: { 
    children: React.ReactNode;
}) {
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";

    if (!isSpooky) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-[#050507] text-purple-100">
            {/* Subtle ambient darkness gradient */}
            <div 
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(20, 10, 30, 0.3) 0%, rgba(0, 0, 0, 0.8) 100%)',
                }}
            />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
