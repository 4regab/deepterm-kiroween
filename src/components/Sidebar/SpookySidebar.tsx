"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { imgLogo } from "@/config/assets";
import SpookyLogo from "@/components/SpookyLogo";
import { createClient } from "@/config/supabase/client";
import { useUIStore, useProfileStore, useThemeStore } from "@/lib/stores";
import {
    Home,
    Library,
    Plus,
    Menu,
    X,
    LogOut,
    Timer,
    Pin,
    LifeBuoy,
    Trophy,
    Skull,
    Ghost,
    BookOpen,
    Flame
} from "lucide-react";

const NAV_ITEMS = [
    { label: "Home", spookyLabel: "Crypt", href: "/dashboard", icon: Home, spookyIcon: Ghost },
    { label: "Materials", spookyLabel: "Grimoires", href: "/materials", icon: Library, spookyIcon: BookOpen },
    { label: "Pomodoro", spookyLabel: "Dark Ritual", href: "/pomodoro", icon: Timer, spookyIcon: Flame },
    { label: "Achievements", spookyLabel: "Soul Trophies", href: "/achievements", icon: Trophy, spookyIcon: Skull },
] as const;

function getInitials(name: string | null): string {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

let profileFetchTriggered = false;
function triggerProfileFetch() {
    if (!profileFetchTriggered) {
        profileFetchTriggered = true;
        queueMicrotask(() => {
            useProfileStore.getState().fetchProfile();
        });
    }
}

export default function SpookySidebar() {
    const pathname = usePathname();
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";

    const {
        sidebarPinned,
        sidebarMobileOpen,
        profileMenuOpen,
        toggleSidebarPinned,
        setSidebarMobileOpen,
        setProfileMenuOpen
    } = useUIStore();

    const { profile } = useProfileStore();
    triggerProfileFetch();

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const closeMobileMenu = () => setSidebarMobileOpen(false);

    // Theme-aware colors
    const bgColor = isSpooky ? "bg-[#0d0f14]" : "bg-[#f0f0ea]";
    const borderColor = isSpooky ? "border-purple-500/20" : "border-[#171d2b]/10";
    const textColor = isSpooky ? "text-purple-100" : "text-[#171d2b]";
    const textMuted = isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60";
    const hoverBg = isSpooky ? "hover:bg-purple-500/10" : "hover:bg-[#171d2b]/5";
    const activeBg = isSpooky ? "bg-purple-600" : "bg-[#171d2b]";
    const activeText = "text-white";

    return (
        <>
            <button
                onClick={() => setSidebarMobileOpen(true)}
                className={`fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${isSpooky ? "bg-purple-600 text-white" : "bg-[#171d2b] text-white"
                    }`}
                aria-label="Open menu"
            >
                <Menu size={20} />
            </button>

            {sidebarMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            <aside className={`fixed left-0 top-0 h-screen ${bgColor} border-r ${borderColor} flex flex-col z-50 transition-all duration-300 overflow-hidden shadow-sm
                ${sidebarMobileOpen ? "w-[220px] translate-x-0" : "-translate-x-full w-[220px]"}
                ${sidebarPinned ? "md:translate-x-0 md:w-[220px]" : "md:translate-x-0 md:w-[64px] md:hover:w-[220px] md:hover:shadow-xl group"}`}>

                <button
                    onClick={closeMobileMenu}
                    className={`absolute top-4 right-4 md:hidden w-8 h-8 flex items-center justify-center ${textMuted} hover:${textColor}`}
                    aria-label="Close menu"
                >
                    <X size={20} />
                </button>

                <div className="p-4 flex items-center justify-between h-[64px]">
                    <div className="flex items-center gap-1">
                        <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0">
                            <div>
                                {isSpooky ? (
                                    <SpookyLogo className="w-[26px] h-[26px] text-purple-500" />
                                ) : (
                                    <img alt="Deepterm Logo" className="w-[26px] h-[26px]" src={imgLogo} />
                                )}
                            </div>
                        </div>
                        <span className={`font-sora text-[20px] transition-opacity duration-300 whitespace-nowrap overflow-hidden ${textColor} ${sidebarPinned ? "md:opacity-100" : "md:opacity-0 md:group-hover:opacity-100"}`}>
                            deepterm
                        </span>
                    </div>
                    <button
                        onClick={toggleSidebarPinned}
                        className={`hidden md:flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 flex-shrink-0 ${sidebarPinned
                            ? `opacity-100 ${isSpooky ? "bg-purple-500/20 text-purple-300" : "bg-[#171d2b]/10 text-[#171d2b]"}`
                            : `opacity-0 group-hover:opacity-100 ${textMuted} ${hoverBg}`
                            }`}
                        title={sidebarPinned ? "Unpin sidebar" : "Pin sidebar"}
                        aria-label={sidebarPinned ? "Unpin sidebar" : "Pin sidebar"}
                    >
                        <Pin size={16} className={`transition-transform ${sidebarPinned ? "rotate-0" : "rotate-45"}`} />
                    </button>
                </div>

                <div className="px-3 mb-2">
                    <Link
                        href="/materials/create"
                        onClick={closeMobileMenu}
                        className={`w-full h-[44px] rounded-xl flex items-center font-sans font-medium transition-all duration-300 overflow-hidden ${sidebarPinned ? "md:justify-start md:pl-4" : "md:justify-center md:pl-0 md:group-hover:justify-start md:group-hover:pl-4"} justify-start pl-4 ${pathname === "/materials/create"
                            ? `${activeBg} ${activeText}`
                            : `${textMuted} ${hoverBg} hover:${textColor}`}`}
                    >
                        <Plus size={20} className="flex-shrink-0" />
                        <span className={`ml-4 transition-all duration-300 whitespace-nowrap overflow-hidden ${sidebarPinned ? "md:opacity-100 md:max-w-[150px] md:ml-4" : "md:opacity-0 md:max-w-0 md:ml-0 md:group-hover:opacity-100 md:group-hover:max-w-[150px] md:group-hover:ml-4"}`}>
                            {isSpooky ? "Summon" : "Create"}
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = isSpooky ? item.spookyIcon : item.icon;
                        const label = isSpooky ? item.spookyLabel : item.label;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileMenu}
                                className={`flex items-center py-2.5 rounded-lg transition-all duration-200 ${sidebarPinned ? "md:justify-start md:pl-4 md:pr-3" : "md:justify-center md:pl-0 md:pr-0 md:group-hover:justify-start md:group-hover:pl-4 md:group-hover:pr-3"} justify-start pl-4 pr-3 ${isActive
                                    ? `${activeBg} ${activeText} font-medium`
                                    : `${textMuted} ${hoverBg}`
                                    }`}
                            >
                                <Icon
                                    size={20}
                                    className={`flex-shrink-0 ${isActive ? "text-white" : ""}`}
                                />
                                <span className={`font-sans text-[15px] ml-4 transition-all duration-300 whitespace-nowrap overflow-hidden ${sidebarPinned ? "md:opacity-100 md:max-w-[150px] md:ml-4" : "md:opacity-0 md:max-w-0 md:ml-0 md:group-hover:opacity-100 md:group-hover:max-w-[150px] md:group-hover:ml-4"}`}>
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-3 pb-2">
                    <Link
                        href="/help"
                        onClick={closeMobileMenu}
                        className={`flex items-center py-2.5 rounded-lg transition-all duration-200 ${sidebarPinned ? "md:justify-start md:pl-4 md:pr-3" : "md:justify-center md:pl-0 md:pr-0 md:group-hover:justify-start md:group-hover:pl-4 md:group-hover:pr-3"} justify-start pl-4 pr-3 ${textMuted} ${hoverBg}`}
                    >
                        <LifeBuoy size={20} className="flex-shrink-0" />
                        <span className={`font-sans text-[15px] ml-4 transition-all duration-300 whitespace-nowrap overflow-hidden ${sidebarPinned ? "md:opacity-100 md:max-w-[150px] md:ml-4" : "md:opacity-0 md:max-w-0 md:ml-0 md:group-hover:opacity-100 md:group-hover:max-w-[150px] md:group-hover:ml-4"}`}>
                            {isSpooky ? "Séance Help" : "Help Center"}
                        </span>
                    </Link>
                </div>

                <div className={`p-2 border-t ${borderColor} relative`} ref={profileMenuRef}>
                    <button
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        className={`w-full flex items-center py-2 rounded-lg ${hoverBg} transition-all duration-200 cursor-pointer ${sidebarPinned ? "md:justify-start md:pl-2" : "md:justify-center md:pl-0 md:group-hover:justify-start md:group-hover:pl-2"} justify-start pl-2`}
                    >
                        {profile?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={profile.avatar_url}
                                alt="Profile"
                                className={`w-9 h-9 rounded-full flex-shrink-0 object-cover ${isSpooky ? "ring-2 ring-purple-500/30" : ""}`}
                            />
                        ) : (
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-sora text-sm flex-shrink-0 ${isSpooky ? "bg-gradient-to-br from-purple-600 to-purple-800" : "bg-gradient-to-br from-[#171d2b] to-[#2a3347]"
                                }`}>
                                {getInitials(profile?.full_name ?? null)}
                            </div>
                        )}
                        <div className={`min-w-0 ml-3 transition-all duration-300 overflow-hidden ${sidebarPinned ? "md:opacity-100 md:max-w-[150px] md:ml-3" : "md:opacity-0 md:max-w-0 md:ml-0 md:group-hover:opacity-100 md:group-hover:max-w-[150px] md:group-hover:ml-3"}`}>
                            <p className={`font-sans text-[14px] font-medium truncate ${textColor}`}>
                                {profile?.full_name || "Loading..."}
                            </p>
                        </div>
                    </button>

                    {profileMenuOpen && (
                        <div className={`absolute bottom-full left-2 mb-2 border rounded-lg shadow-lg py-1 min-w-[160px] z-50 ${isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-[#171d2b]/10"
                            }`}>
                            <Link
                                href="/account"
                                onClick={() => { setProfileMenuOpen(false); closeMobileMenu(); }}
                                className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${isSpooky ? "text-purple-200 hover:bg-purple-500/10" : "text-[#171d2b]/70 hover:bg-[#171d2b]/5 hover:text-[#171d2b]"
                                    }`}
                            >
                                <span className="font-sans text-[14px]">{isSpooky ? "Soul Settings" : "Account Settings"}</span>
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${isSpooky ? "text-purple-200 hover:bg-red-900/20 hover:text-red-400" : "text-[#171d2b]/70 hover:bg-red-50 hover:text-red-600"
                                    }`}
                            >
                                <LogOut size={18} />
                                <span className="font-sans text-[14px]">{isSpooky ? "Banish" : "Sign Out"}</span>
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
