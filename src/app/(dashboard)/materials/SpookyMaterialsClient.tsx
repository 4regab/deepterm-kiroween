"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    MoreVertical,
    Clock,
    Trash2,
    FolderOpen,
    Plus,
    Share2,
    Filter,
    ChevronDown,
    Skull,
    Ghost,
    BookOpen,
    FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMaterialsStore, useThemeStore } from "@/lib/stores";
import type { MaterialItem, MaterialFilter } from "@/lib/schemas/materials";
import { useState } from "react";
import ShareModal from "@/components/ShareModal";
import { createClient } from "@/config/supabase/client";

interface SpookyMaterialsClientProps {
    initialItems: MaterialItem[];
}

const FILTERS: MaterialFilter[] = ["All", "Cards", "Reviewer"];
const SPOOKY_FILTERS: Record<string, string> = {
    "All": "All Tomes",
    "Cards": "Spell Cards",
    "Reviewer": "Grimoires",
    "Flashcards": "Spell Cards",
    "Note": "Scrolls"
};

function getItemLabel(type: MaterialItem["type"], count: number, isSpooky: boolean): string {
    if (type === "Reviewer") return `${count} ${isSpooky ? "incantations" : "terms"}`;
    return `${count} ${isSpooky ? "spells" : "cards"}`;
}

function EmptyState({ onCreateClick, isSpooky }: { onCreateClick: () => void; isSpooky: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                isSpooky ? "bg-purple-500/10" : "bg-[#171d2b]/5"
            }`}>
                {isSpooky ? (
                    <Ghost size={40} className="text-purple-400/40" />
                ) : (
                    <FolderOpen size={40} className="text-[#171d2b]/20" />
                )}
            </div>
            <h3 className={`text-xl font-sora font-semibold mb-2 ${
                isSpooky ? "text-purple-100" : "text-[#171d2b]"
            }`}>
                {isSpooky ? "The library is empty..." : "No materials yet"}
            </h3>
            <p className={`max-w-sm mb-6 ${isSpooky ? "text-purple-300/50" : "text-[#171d2b]/50"}`}>
                {isSpooky ? "Summon your first grimoire to begin the dark studies." : "Create your first study material to get started."}
            </p>
            <button
                onClick={onCreateClick}
                className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                    isSpooky 
                        ? "bg-purple-600 text-white hover:bg-purple-500" 
                        : "bg-[#171d2b] text-white hover:bg-[#2a3347]"
                }`}
            >
                <Plus size={18} />
                {isSpooky ? "Summon New Tome" : "Create New Material"}
            </button>
        </div>
    );
}

export default function SpookyMaterialsClient({ initialItems }: SpookyMaterialsClientProps) {
    const router = useRouter();
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";
    
    const [initialized, setInitialized] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [shareItem, setShareItem] = useState<MaterialItem | null>(null);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    
    const {
        items,
        searchQuery,
        activeFilter,
        setSearchQuery,
        setActiveFilter,
        setItems,
        removeItem
    } = useMaterialsStore();

    if (!initialized && initialItems.length > 0) {
        setItems(initialItems);
        setInitialized(true);
    }

    const sourceItems = items.length > 0 ? items : initialItems;

    const filteredItems = sourceItems.filter((item: MaterialItem) => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'All' ||
            (activeFilter === 'Cards' && item.type === 'Flashcards') ||
            item.type === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const handleCreateClick = () => router.push("/materials/create");

    const handleDelete = async (item: MaterialItem) => {
        const supabase = createClient();
        const table = item.type === "Flashcards" ? "flashcard_sets" : "reviewers";
        await supabase.from(table).delete().eq("id", item.id);
        removeItem(item.id);
    };

    // Theme colors
    const bgCard = isSpooky ? "bg-[#151821]" : "bg-white";
    const borderCard = isSpooky ? "border-purple-500/10 hover:border-purple-500/30" : "border-[#171d2b]/5 hover:border-[#171d2b]/20";
    const textPrimary = isSpooky ? "text-purple-100" : "text-[#171d2b]";
    const textMuted = isSpooky ? "text-purple-300/40" : "text-[#171d2b]/40";
    const inputBg = isSpooky ? "bg-[#151821] border-purple-500/20 focus:border-purple-500" : "bg-white border-[#171d2b]/10 focus:border-[#171d2b]";
    const activeBtnBg = isSpooky ? "bg-purple-600 text-white" : "bg-[#171d2b] text-white";
    const inactiveBtnBg = isSpooky ? "bg-[#151821] text-purple-300/60 hover:bg-purple-500/10 border-purple-500/20" : "bg-white text-[#171d2b]/60 hover:bg-[#171d2b]/5 border-[#171d2b]/10";

    return (
        <>
            {/* Page Title */}
            <div className="mb-8">
                <h1 className={`text-4xl font-sora font-bold mb-2 ${isSpooky ? "text-purple-100 spooky-glow" : "text-[#171d2b]"}`}>
                    {isSpooky ? "Forbidden Archives" : "Materials"}
                </h1>
            </div>
            <div className="flex flex-col gap-4 mb-8">
                {/* Mobile: Search + Filter dropdown */}
                <div className="flex gap-2 md:hidden">
                    <div className="relative flex-1">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} size={18} />
                        <input
                            type="text"
                            placeholder={isSpooky ? "Search the archives..." : "Search..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-9 pr-3 py-3 rounded-xl border outline-none transition-all focus:shadow-sm text-sm ${inputBg} ${textPrimary}`}
                        />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`flex items-center gap-1 px-3 py-3 rounded-xl border text-sm ${inactiveBtnBg}`}
                        >
                            <Filter size={16} />
                            <ChevronDown size={14} />
                        </button>
                        {showFilterMenu && (
                            <div className={`absolute right-0 top-full mt-1 rounded-lg shadow-lg border py-1 z-50 min-w-[120px] ${
                                isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-[#171d2b]/10"
                            }`}>
                                {FILTERS.map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => {
                                            setActiveFilter(filter);
                                            setShowFilterMenu(false);
                                        }}
                                        className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${activeFilter === filter
                                            ? (isSpooky ? "bg-purple-500/10 text-purple-200 font-medium" : "bg-[#171d2b]/5 text-[#171d2b] font-medium")
                                            : (isSpooky ? "text-purple-300/60 hover:bg-purple-500/10" : "text-[#171d2b]/60 hover:bg-[#171d2b]/5")
                                            }`}
                                    >
                                        {isSpooky ? SPOOKY_FILTERS[filter] : (filter === "All" ? "All Items" : filter)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Desktop: Search + Filter buttons */}
                <div className="hidden md:flex gap-4">
                    <div className="relative flex-1">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${textMuted}`} size={20} />
                        <input
                            type="text"
                            placeholder={isSpooky ? "Search the forbidden archives..." : "Search by title..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border outline-none transition-all focus:shadow-sm ${inputBg} ${textPrimary}`}
                        />
                    </div>
                    <div className="flex gap-2">
                        {FILTERS.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap border ${activeFilter === filter
                                    ? activeBtnBg
                                    : inactiveBtnBg
                                    }`}
                            >
                                {isSpooky ? SPOOKY_FILTERS[filter] : (filter === "All" ? "All Items" : filter)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {filteredItems.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <AnimatePresence mode="sync">
                        {filteredItems.map((item: MaterialItem) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut", layout: { duration: 0.2, ease: "easeInOut" } }}
                                whileHover={{ y: -4, transition: { duration: 0.15 } }}
                                onClick={() => router.push(`/materials/${item.id}`)}
                                className={`${bgCard} rounded-xl p-4 border ${borderCard} hover:shadow-lg transition-all cursor-pointer group ${
                                    isSpooky ? "hover:shadow-purple-500/10" : ""
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider flex items-center gap-1 ${item.type === "Reviewer"
                                        ? (isSpooky ? "bg-purple-600 text-white" : "bg-[#171d2b] text-white")
                                        : (isSpooky ? "bg-purple-500/20 text-purple-300" : "bg-[#171d2b]/10 text-[#171d2b]")
                                        }`}>
                                        {isSpooky && (item.type === "Reviewer" ? <BookOpen size={10} /> : <FileText size={10} />)}
                                        {item.type === "Flashcards" ? (isSpooky ? "Spells" : "Cards") : (isSpooky ? "Grimoire" : item.type)} · {getItemLabel(item.type, item.itemsCount, isSpooky)}
                                    </span>
                                    <div className="relative">
                                        <button
                                            className={`p-1 rounded-full transition-colors ${
                                                isSpooky 
                                                    ? "hover:bg-purple-500/10 text-purple-300/30 hover:text-purple-300" 
                                                    : "hover:bg-[#171d2b]/5 text-[#171d2b]/30 hover:text-[#171d2b]"
                                            }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === item.id ? null : item.id);
                                            }}
                                            aria-label="More options"
                                        >
                                            <MoreVertical size={14} />
                                        </button>
                                        {openMenuId === item.id && (
                                            <div 
                                                className={`absolute right-0 top-full mt-1 rounded-lg shadow-lg border py-1 z-50 min-w-[120px] ${
                                                    isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-[#171d2b]/10"
                                                }`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                                                        isSpooky ? "text-purple-200 hover:bg-purple-500/10" : "text-[#171d2b] hover:bg-[#171d2b]/5"
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(null);
                                                        setShareItem(item);
                                                    }}
                                                >
                                                    <Share2 size={14} />
                                                    {isSpooky ? "Share Curse" : "Share"}
                                                </button>
                                                <button
                                                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                                                        isSpooky ? "text-purple-200 hover:bg-red-900/20 hover:text-red-400" : "text-[#171d2b] hover:bg-[#171d2b]/5"
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(null);
                                                        handleDelete(item);
                                                    }}
                                                >
                                                    {isSpooky ? <Skull size={14} /> : <Trash2 size={14} />}
                                                    {isSpooky ? "Banish" : "Delete"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <h3 className={`font-sora font-semibold text-sm line-clamp-2 ${textPrimary}`}>{item.title}</h3>
                                </div>
                                <div className={`flex items-center text-xs ${textMuted}`}>
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} />
                                        <span>{item.lastAccessed}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <EmptyState onCreateClick={handleCreateClick} isSpooky={isSpooky} />
            )}

            {shareItem && (
                <ShareModal
                    isOpen={!!shareItem}
                    onClose={() => setShareItem(null)}
                    materialId={shareItem.id}
                    materialType={shareItem.type === "Flashcards" ? "flashcard_set" : "reviewer"}
                    materialTitle={shareItem.title}
                />
            )}
        </>
    );
}
