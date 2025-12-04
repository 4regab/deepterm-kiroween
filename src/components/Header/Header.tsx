"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { imgLogo } from "@/config/assets";
import { createClient } from "@/config/supabase/client";
import { useUIStore, useThemeStore } from "@/lib/stores";
import { useScrolled } from "@/lib/hooks";
import { ThemeToggle } from "@/components/SpookyTheme";
import SpookyLogo from "@/components/SpookyLogo";
import type { User } from "@supabase/supabase-js";

const LEARN_ITEMS = [
    { label: "Pomodoro", href: "/pomodoro" },
    { label: "Practice Test", href: "/materials" },
    { label: "Flashcards", href: "/materials" },
    { label: "Reviewer", href: "/materials" },
] as const;

function SessionAwareHeader({ user, isLoading, className }: { user: User | null; isLoading: boolean; className?: string }) {
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";
    const isScrolled = useScrolled(20);

    const {
        sidebarMobileOpen: isMenuOpen,
        profileMenuOpen: isLearnOpen,
        setSidebarMobileOpen: setIsMenuOpen,
        setProfileMenuOpen: setIsLearnOpen
    } = useUIStore();

    const handleLogin = async () => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleLearn = () => setIsLearnOpen(!isLearnOpen);

    // Glass header styles applied via state instead of DOM manipulation
    const glassStyles = isScrolled ? {
        backgroundColor: isSpooky ? "rgba(13, 15, 20, 0.8)" : "rgba(240, 240, 234, 0.8)",
        borderColor: isSpooky ? "rgba(168, 85, 247, 0.1)" : "rgba(23, 29, 43, 0.05)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    } : {};

    return (
        <>
            <header 
                style={glassStyles}
                className={`relative flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 rounded-full mx-3 sm:mx-4 mt-3 border border-transparent bg-transparent ${className || ''}`}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center hover:opacity-70 transition-opacity">
                    <div className={`w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] flex items-center justify-center`}>
                        <div>
                            {isSpooky ? (
                                <SpookyLogo className="w-[32px] h-[32px] sm:w-[38px] sm:h-[38px] text-purple-500" />
                            ) : (
                                <Image alt="Deepterm Logo" className="w-[32px] h-[32px] sm:w-[38px] sm:h-[38px]" src={imgLogo} width={38} height={38} />
                            )}
                        </div>
                    </div>
                    <span className={`font-sora text-[20px] sm:text-[24px] ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>deepterm</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        {/* Learn Dropdown */}
                        <div className="relative group">
                            <button className={`font-sans text-[18px] hover:opacity-70 transition-opacity flex items-center gap-1 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
                                Learn
                                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                <div className={`rounded-lg shadow-lg py-2 min-w-[160px] border ${isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-[#f0f0ea] border-[#171d2b]/10"}`}>
                                    {LEARN_ITEMS.map((item) => (
                                        <a
                                            key={`${item.href}-${item.label}`}
                                            href={item.href}
                                            className={`block px-4 py-2 font-sans text-[16px] transition-colors ${isSpooky ? "text-purple-100 hover:bg-purple-500/10" : "text-[#171d2b] hover:bg-[#171d2b]/5"}`}
                                        >
                                            {item.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <span className={`w-[1px] h-[16px] opacity-50 ${isSpooky ? "bg-purple-400" : "bg-[#171d2b]"}`} />
                        <Link href="/help" className={`font-sans text-[18px] hover:opacity-70 transition-opacity ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>Help</Link>
                    </div>
                    <ThemeToggle />
                    {isLoading ? (
                        <div className={`h-[42px] rounded-[100px] px-6 w-[100px] animate-pulse ${isSpooky ? "bg-purple-500/20" : "bg-[#171d2b]/10"}`} />
                    ) : user ? (
                        <Link
                            href="/dashboard"
                            className={`h-[42px] rounded-[100px] px-6 font-sora text-[16px] transition-colors flex items-center justify-center ${isSpooky ? "bg-purple-600 text-white hover:bg-purple-500" : "bg-[#171d2b] text-[#fefeff] hover:bg-[#2a3347]"}`}
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className={`relative h-[42px] rounded-[100px] px-6 font-sora text-[16px] overflow-hidden group flex items-center justify-center ${isSpooky ? "bg-white text-purple-950" : "bg-[#171d2b] text-[#fefeff] hover:bg-[#2a3347]"}`}
                        >
                            {isSpooky && (
                                <span className="absolute inset-0 bg-purple-600 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0" />
                            )}
                            <span className={`relative z-10 transition-colors duration-300 ${isSpooky ? "group-hover:text-white" : ""}`}>
                                Log in
                            </span>
                        </Link>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-2">
                    <ThemeToggle />
                    <button
                        className="flex flex-col justify-center items-center w-10 h-10 gap-1.5"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        <span className={`block w-6 h-0.5 transition-transform ${isSpooky ? "bg-purple-300" : "bg-[#171d2b]"} ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
                        <span className={`block w-6 h-0.5 transition-opacity ${isSpooky ? "bg-purple-300" : "bg-[#171d2b]"} ${isMenuOpen ? "opacity-0" : ""}`} />
                        <span className={`block w-6 h-0.5 transition-transform ${isSpooky ? "bg-purple-300" : "bg-[#171d2b]"} ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className={`absolute top-full left-0 right-0 border-t md:hidden shadow-lg ${isSpooky ? "bg-[#0d0f14] border-purple-500/20" : "bg-[#f0f0ea] border-[#171d2b]/10"}`}>
                        <nav className="flex flex-col p-4 gap-2">
                            {/* Mobile Learn Accordion */}
                            <div>
                                <button
                                    onClick={toggleLearn}
                                    className={`w-full font-sans text-[18px] py-2 hover:opacity-70 transition-opacity flex items-center justify-between ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}
                                >
                                    Learn
                                    <svg className={`w-4 h-4 transition-transform ${isLearnOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {isLearnOpen && (
                                    <div className="pl-4 flex flex-col gap-1">
                                        {LEARN_ITEMS.map((item) => (
                                            <a
                                                key={`mobile-${item.href}-${item.label}`}
                                                href={item.href}
                                                className={`font-sans text-[16px] py-2 hover:opacity-70 transition-opacity ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}
                                            >
                                                {item.label}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Link href="/help" className={`font-sans text-[18px] py-2 hover:opacity-70 transition-opacity ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>Help</Link>
                            <div className="mt-2">
                                {isLoading ? (
                                    <div className={`h-[42px] rounded-[100px] px-6 w-full animate-pulse ${isSpooky ? "bg-purple-500/20" : "bg-[#171d2b]/10"}`} />
                                ) : user ? (
                                    <Link
                                        href="/dashboard"
                                        className={`h-[42px] rounded-[100px] px-6 font-sora text-[16px] transition-colors flex items-center justify-center w-full ${isSpooky ? "bg-purple-600 text-white hover:bg-purple-500" : "bg-[#171d2b] text-[#fefeff] hover:bg-[#2a3347]"}`}
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        className={`relative h-[42px] rounded-[100px] px-6 font-sora text-[16px] overflow-hidden group flex items-center justify-center w-full ${isSpooky ? "bg-white text-purple-950" : "bg-[#171d2b] text-[#fefeff] hover:bg-[#2a3347]"}`}
                                    >
                                        {isSpooky && (
                                            <span className="absolute inset-0 bg-purple-600 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0" />
                                        )}
                                        <span className={`relative z-10 transition-colors duration-300 ${isSpooky ? "group-hover:text-white" : ""}`}>
                                            Log in
                                        </span>
                                    </Link>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </header>
        </>
    );
}

export default function Header({ className }: { className?: string }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const hasCheckedRef = useRef(false);
    const isMountedRef = useRef(false);

    const checkUser = useCallback(async () => {
        if (hasCheckedRef.current || !isMountedRef.current) return;
        hasCheckedRef.current = true;
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (isMountedRef.current) {
                setUser(user);
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

    // Use ref callback to detect mount and trigger check
    const mountRef = useCallback((node: HTMLElement | null) => {
        if (node && !isMountedRef.current) {
            isMountedRef.current = true;
            checkUser();
        }
    }, [checkUser]);

    return (
        <div ref={mountRef} className="sticky top-0 z-50 w-full pt-2 sm:pt-3 lg:pt-4">
            <div className="max-w-[1440px] mx-auto">
                <SessionAwareHeader user={user} isLoading={isLoading} className={className} />
            </div>
        </div>
    );
}
