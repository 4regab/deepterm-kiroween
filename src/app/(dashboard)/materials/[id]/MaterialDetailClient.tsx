"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
    ArrowLeft,
    Share2,
    Edit,
    Trash2,
    Plus,
    X,
    Check,
    GripVertical,
    Download,
    Loader2,
    ChevronDown,
    ChevronUp,
    Copy,
    Search,
    Skull
} from "lucide-react";
import { exportToPDF, exportToDOCX } from "@/utils/exportReviewer";
import Link from "next/link";
import {
    FlashcardsIcon,
    LearnIcon,
    PracticeIcon,
    MatchIcon
} from "@/components/StudyIcons";
import StudyingProgress from "@/components/StudyingProgress";
import ShareModal from "@/components/ShareModal";
import { createClient } from "@/config/supabase/client";
import { useThemeStore } from "@/lib/stores";

type LearnStage = 'new' | 'learning' | 'review' | 'mastered';

export interface Term {
    id: string;
    front: string;
    back: string;
    stage: LearnStage;
}

export interface ReviewerTerm {
    id: string;
    term: string;
    definition: string;
}

export interface ReviewerCategory {
    id: string;
    name: string;
    color: string;
    terms: ReviewerTerm[];
}

export interface MaterialData {
    id: string;
    title: string;
    updated_at: string;
}

type FlashcardProps = {
    materialType: 'flashcard';
    material: MaterialData;
    initialTerms: Term[];
    initialCategories?: never;
};

type ReviewerProps = {
    materialType: 'reviewer';
    material: MaterialData;
    initialCategories: ReviewerCategory[];
    initialTerms?: never;
};

type Props = FlashcardProps | ReviewerProps;

const StudyToolButton = ({ title, icon: Icon, href, isSpooky }: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    isSpooky: boolean;
}) => (
    <Link href={href} className="group">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
            isSpooky 
                ? "bg-[#151821] border-purple-500/20 hover:border-purple-500/40 hover:shadow-purple-500/10 hover:shadow-lg" 
                : "bg-white border-[#171d2b]/5 hover:border-[#171d2b]/20 hover:shadow-md"
        }`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${
                isSpooky ? "bg-purple-600" : "bg-[#171d2b]"
            }`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <span className={`font-sora font-medium text-sm ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{title}</span>
        </div>
    </Link>
);

const TermItem = ({ term, onEdit, onDelete, isEditing, onSave, onCancel, editData, setEditData, isSpooky }: {
    term: Term;
    onEdit: () => void;
    onDelete: () => void;
    isEditing: boolean;
    onSave: () => void;
    onCancel: () => void;
    editData: { front: string; back: string };
    setEditData: (data: { front: string; back: string }) => void;
    isSpooky: boolean;
}) => {
    if (isEditing) {
        return (
            <div className={`px-4 py-3 border-b ${isSpooky ? "bg-purple-500/10 border-purple-500/10" : "bg-[#f0f0ea]/50 border-[#171d2b]/5"}`}>
                <div className="flex flex-col md:flex-row gap-3">
                    <input type="text" value={editData.front} onChange={(e) => setEditData({ ...editData, front: e.target.value })} placeholder="Term" className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 text-sm ${
                        isSpooky ? "bg-[#0d0f14] border-purple-500/20 text-purple-100 focus:ring-purple-500/30" : "bg-white border-[#171d2b]/10 focus:ring-[#171d2b]/20"
                    }`} />
                    <input type="text" value={editData.back} onChange={(e) => setEditData({ ...editData, back: e.target.value })} placeholder="Definition" className={`flex-[2] px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 text-sm ${
                        isSpooky ? "bg-[#0d0f14] border-purple-500/20 text-purple-100 focus:ring-purple-500/30" : "bg-white border-[#171d2b]/10 focus:ring-[#171d2b]/20"
                    }`} />
                    <div className="flex gap-2">
                        <button onClick={onSave} className={`p-2 rounded-lg text-white transition-colors ${isSpooky ? "bg-purple-600 hover:bg-purple-500" : "bg-[#171d2b] hover:bg-[#2a3347]"}`}><Check size={16} /></button>
                        <button onClick={onCancel} className={`p-2 rounded-lg transition-colors ${isSpooky ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30" : "bg-[#171d2b]/10 text-[#171d2b] hover:bg-[#171d2b]/20"}`}><X size={16} /></button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Reorder.Item value={term} id={term.id} className={`px-4 py-3 transition-colors flex items-center gap-3 border-b group cursor-grab active:cursor-grabbing ${
            isSpooky ? "hover:bg-purple-500/5 border-purple-500/10 bg-[#151821]" : "hover:bg-[#f0f0ea]/30 border-[#171d2b]/5 bg-white"
        }`}>
            <div className={`flex-shrink-0 transition-colors ${isSpooky ? "text-purple-500/30 hover:text-purple-400" : "text-[#171d2b]/30 hover:text-[#171d2b]/60"}`}><GripVertical size={16} /></div>
            <div className="flex-1 min-w-0"><p className={`font-medium text-sm truncate ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{term.front}</p></div>
            <div className={`hidden md:block flex-[2] min-w-0 border-l pl-4 ${isSpooky ? "border-purple-500/10" : "border-[#171d2b]/5"}`}><p className={`text-sm truncate ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>{term.back}</p></div>
            <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button onClick={onEdit} className={`p-1.5 rounded-lg ${isSpooky ? "hover:bg-purple-500/10 text-purple-400/50 hover:text-purple-300" : "hover:bg-[#171d2b]/5 text-[#171d2b]/50 hover:text-[#171d2b]"}`}><Edit size={14} /></button>
                <button onClick={onDelete} className={`p-1.5 rounded-lg ${isSpooky ? "hover:bg-red-900/20 text-purple-400/50 hover:text-red-400" : "hover:bg-red-50 text-[#171d2b]/50 hover:text-red-500"}`}><Trash2 size={14} /></button>
            </div>
        </Reorder.Item>
    );
};

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

const ReviewerDisplay = ({ categories, expandedCategories, toggleCategory, filterText, setFilterText, onEditTerm, onDeleteTerm, onAddTerm, onDeleteCategory, isSpooky }: {
    categories: ReviewerCategory[];
    expandedCategories: string[];
    toggleCategory: (id: string) => void;
    filterText: string;
    setFilterText: (text: string) => void;
    onEditTerm: (categoryId: string, termId: string, term: string, definition: string) => void;
    onDeleteTerm: (categoryId: string, termId: string) => void;
    onAddTerm: (categoryId: string, term: string, definition: string) => void;
    onDeleteCategory: (categoryId: string) => void;
    isSpooky: boolean;
}) => {
    const [editingTermId, setEditingTermId] = useState<string | null>(null);
    const [editTermData, setEditTermData] = useState({ term: '', definition: '' });
    const [addingToCategoryId, setAddingToCategoryId] = useState<string | null>(null);
    const [newTermData, setNewTermData] = useState({ term: '', definition: '' });

    const filteredCategories = categories.map(cat => ({
        ...cat,
        terms: cat.terms.filter(t =>
            t.term.toLowerCase().includes(filterText.toLowerCase()) ||
            t.definition.toLowerCase().includes(filterText.toLowerCase())
        )
    })).filter(cat => cat.terms.length > 0 || !filterText);

    const handleStartEdit = (term: ReviewerTerm) => {
        setEditingTermId(term.id);
        setEditTermData({ term: term.term, definition: term.definition });
    };

    const handleSaveEdit = (categoryId: string) => {
        if (editingTermId && editTermData.term.trim() && editTermData.definition.trim()) {
            onEditTerm(categoryId, editingTermId, editTermData.term, editTermData.definition);
            setEditingTermId(null);
            setEditTermData({ term: '', definition: '' });
        }
    };

    const handleCancelEdit = () => {
        setEditingTermId(null);
        setEditTermData({ term: '', definition: '' });
    };

    const handleAddTerm = (categoryId: string) => {
        if (newTermData.term.trim() && newTermData.definition.trim()) {
            onAddTerm(categoryId, newTermData.term, newTermData.definition);
            setAddingToCategoryId(null);
            setNewTermData({ term: '', definition: '' });
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isSpooky ? "text-purple-400/40" : "text-[#171d2b]/40"}`} size={18} />
                <input
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder={isSpooky ? "Search the grimoire..." : "Filter terms..."}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border outline-none transition-all focus:shadow-sm text-sm ${
                        isSpooky 
                            ? "bg-[#151821] border-purple-500/20 focus:border-purple-500 text-purple-100 placeholder:text-purple-400/40" 
                            : "bg-white border-[#171d2b]/10 focus:border-[#171d2b]"
                    }`}
                />
            </div>

            <div className="space-y-4">
                {filteredCategories.map(category => (
                    <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                            isSpooky ? "bg-[#151821] border-purple-500/20 hover:shadow-purple-500/10" : "bg-white border-[#171d2b]/10"
                        }`}
                    >
                        <div
                            onClick={() => toggleCategory(category.id)}
                            className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                                isSpooky ? "hover:bg-purple-500/5" : "hover:bg-gray-50"
                            }`}
                            style={{ borderLeft: `4px solid ${isSpooky ? "#a855f7" : category.color}` }}
                        >
                            <div className="flex items-center gap-4">
                                <h3 className={`font-sora font-semibold ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{category.name}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    isSpooky ? "bg-purple-500/20 text-purple-300" : "bg-[#171d2b]/5 text-[#171d2b]/60"
                                }`}>
                                    {category.terms.length} {isSpooky ? "incantations" : "terms"}
                                </span>
                            </div>
                            <div className={`flex items-center gap-2 ${isSpooky ? "text-purple-400" : ""}`}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setAddingToCategoryId(addingToCategoryId === category.id ? null : category.id);
                                        setNewTermData({ term: '', definition: '' });
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                        isSpooky ? "hover:bg-purple-500/10 text-purple-400/50 hover:text-purple-300" : "hover:bg-[#171d2b]/10 text-[#171d2b]/50 hover:text-[#171d2b]"
                                    }`}
                                    title="Add term"
                                >
                                    <Plus size={16} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(`Delete "${category.name}" and all its terms?`)) {
                                            onDeleteCategory(category.id);
                                        }
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                        isSpooky ? "hover:bg-red-900/20 text-purple-400/50 hover:text-red-400" : "hover:bg-red-50 text-[#171d2b]/50 hover:text-red-500"
                                    }`}
                                    title="Delete category"
                                >
                                    <Trash2 size={16} />
                                </button>
                                {expandedCategories.includes(category.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                        </div>
                        <AnimatePresence>
                            {expandedCategories.includes(category.id) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className={`border-t ${isSpooky ? "border-purple-500/10" : "border-[#171d2b]/5"}`}
                                >
                                    {addingToCategoryId === category.id && (
                                        <div className={`p-4 border-b ${isSpooky ? "bg-purple-500/10 border-purple-500/10" : "bg-[#171d2b]/5 border-[#171d2b]/10"}`}>
                                            <div className="flex flex-col gap-2">
                                                <input
                                                    type="text"
                                                    value={newTermData.term}
                                                    onChange={(e) => setNewTermData({ ...newTermData, term: e.target.value })}
                                                    placeholder={isSpooky ? "Incantation name..." : "Term"}
                                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 text-sm ${
                                                        isSpooky ? "bg-[#0d0f14] border-purple-500/20 text-purple-100 focus:ring-purple-500/30" : "bg-white border-[#171d2b]/10 focus:ring-[#171d2b]/20"
                                                    }`}
                                                    autoFocus
                                                />
                                                <textarea
                                                    value={newTermData.definition}
                                                    onChange={(e) => setNewTermData({ ...newTermData, definition: e.target.value })}
                                                    placeholder={isSpooky ? "Dark knowledge..." : "Definition"}
                                                    rows={2}
                                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 text-sm resize-none ${
                                                        isSpooky ? "bg-[#0d0f14] border-purple-500/20 text-purple-100 focus:ring-purple-500/30" : "bg-white border-[#171d2b]/10 focus:ring-[#171d2b]/20"
                                                    }`}
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => { setAddingToCategoryId(null); setNewTermData({ term: '', definition: '' }); }}
                                                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                                            isSpooky ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30" : "bg-[#171d2b]/10 text-[#171d2b] hover:bg-[#171d2b]/20"
                                                        }`}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleAddTerm(category.id)}
                                                        disabled={!newTermData.term.trim() || !newTermData.definition.trim()}
                                                        className={`px-3 py-1.5 rounded-lg text-white text-sm transition-colors disabled:opacity-50 ${
                                                            isSpooky ? "bg-purple-600 hover:bg-purple-500" : "bg-[#171d2b] hover:bg-[#2a3347]"
                                                        }`}
                                                    >
                                                        {isSpooky ? "Inscribe" : "Add Term"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-4 grid gap-4 grid-cols-1 lg:grid-cols-2">
                                        {category.terms.map(term => (
                                            <div key={term.id} className={`p-4 rounded-xl border transition-colors group relative ${
                                                isSpooky ? "bg-[#0d0f14] border-purple-500/10 hover:border-purple-500/30" : "bg-[#f8f9fa] border-[#171d2b]/5 hover:border-[#171d2b]/20"
                                            }`}>
                                                {editingTermId === term.id ? (
                                                    <div className="flex flex-col gap-2">
                                                        <input
                                                            type="text"
                                                            value={editTermData.term}
                                                            onChange={(e) => setEditTermData({ ...editTermData, term: e.target.value })}
                                                            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 text-sm font-bold ${
                                                                isSpooky ? "bg-[#151821] border-purple-500/20 text-purple-100 focus:ring-purple-500/30" : "bg-white border-[#171d2b]/10 focus:ring-[#171d2b]/20"
                                                            }`}
                                                            autoFocus
                                                        />
                                                        <textarea
                                                            value={editTermData.definition}
                                                            onChange={(e) => setEditTermData({ ...editTermData, definition: e.target.value })}
                                                            rows={3}
                                                            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 text-sm resize-none ${
                                                                isSpooky ? "bg-[#151821] border-purple-500/20 text-purple-100 focus:ring-purple-500/30" : "bg-white border-[#171d2b]/10 focus:ring-[#171d2b]/20"
                                                            }`}
                                                        />
                                                        <div className="flex gap-2 justify-end">
                                                            <button onClick={handleCancelEdit} className={`p-1.5 rounded-lg transition-colors ${
                                                                isSpooky ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30" : "bg-[#171d2b]/10 text-[#171d2b] hover:bg-[#171d2b]/20"
                                                            }`}>
                                                                <X size={14} />
                                                            </button>
                                                            <button onClick={() => handleSaveEdit(category.id)} className={`p-1.5 rounded-lg text-white transition-colors ${
                                                                isSpooky ? "bg-purple-600 hover:bg-purple-500" : "bg-[#171d2b] hover:bg-[#2a3347]"
                                                            }`}>
                                                                <Check size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className={`font-bold pr-16 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{term.term}</h4>
                                                            <div className="absolute top-4 right-4 flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-all">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleStartEdit(term); }}
                                                                    className={`p-1.5 rounded-lg transition-colors ${
                                                                        isSpooky ? "hover:bg-purple-500/10 text-purple-400/40 hover:text-purple-300" : "hover:bg-[#171d2b]/10 text-[#171d2b]/40 hover:text-[#171d2b]"
                                                                    }`}
                                                                    title="Edit"
                                                                >
                                                                    <Edit size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`${term.term}: ${term.definition}`); }}
                                                                    className={`p-1.5 rounded-lg transition-colors ${
                                                                        isSpooky ? "hover:bg-purple-500/10 text-purple-400/40 hover:text-purple-300" : "hover:bg-[#171d2b]/10 text-[#171d2b]/40 hover:text-[#171d2b]"
                                                                    }`}
                                                                    title="Copy"
                                                                >
                                                                    <Copy size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); onDeleteTerm(category.id, term.id); }}
                                                                    className={`p-1.5 rounded-lg transition-colors ${
                                                                        isSpooky ? "hover:bg-red-900/20 text-purple-400/40 hover:text-red-400" : "hover:bg-red-50 text-[#171d2b]/40 hover:text-red-500"
                                                                    }`}
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className={`text-sm leading-relaxed ${isSpooky ? "text-purple-300/80" : "text-[#171d2b]/80"}`}>{term.definition}</p>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>

            {categories.length === 0 && (
                <div className={`rounded-xl border shadow-sm p-10 text-center ${
                    isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-[#171d2b]/5"
                }`}>
                    <p className={`text-sm ${isSpooky ? "text-purple-300/50" : "text-[#171d2b]/50"}`}>
                        {isSpooky ? "No dark knowledge inscribed yet..." : "No categories yet."}
                    </p>
                </div>
            )}

            {filterText && filteredCategories.length === 0 && categories.length > 0 && (
                <div className={`rounded-xl border shadow-sm p-10 text-center ${
                    isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-[#171d2b]/5"
                }`}>
                    <p className={`text-sm ${isSpooky ? "text-purple-300/50" : "text-[#171d2b]/50"}`}>
                        {isSpooky ? `No incantations match "${filterText}"` : `No terms match "${filterText}"`}
                    </p>
                </div>
            )}
        </div>
    );
};

export default function MaterialDetailClient(props: Props) {
    const { materialType, material } = props;
    const router = useRouter();
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";
    const [terms, setTerms] = useState<Term[]>(props.materialType === 'flashcard' ? props.initialTerms : []);
    const [categories, setCategories] = useState<ReviewerCategory[]>(props.materialType === 'reviewer' ? props.initialCategories : []);
    const [expandedCategories, setExpandedCategories] = useState<string[]>(props.materialType === 'reviewer' ? props.initialCategories.map(c => c.id) : []);
    const [filterText, setFilterText] = useState("");

    // Refresh flashcard statuses on mount to get latest progress after study sessions
    useSyncExternalStore(
        useCallback(() => {
            if (materialType !== 'flashcard') return () => {};
            let mounted = true;
            const refresh = async () => {
                const supabase = createClient();
                const { data } = await supabase
                    .from("flashcards")
                    .select("id, front, back, status")
                    .eq("set_id", material.id)
                    .order("created_at");
                if (data && mounted) {
                    setTerms(data.map(card => ({
                        id: card.id,
                        front: card.front,
                        back: card.back,
                        stage: (card.status || 'new') as LearnStage,
                    })));
                }
            };
            refresh();
            return () => { mounted = false; };
        }, [materialType, material.id]),
        () => null,
        () => null
    );
    
    const toggleCategory = (id: string) => {
        setExpandedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
    };
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState({ front: '', back: '' });
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newTerm, setNewTerm] = useState({ front: '', back: '' });
    const [showShareModal, setShowShareModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = useCallback((term: Term) => {
        setEditingId(term.id);
        setEditData({ front: term.front, back: term.back });
    }, []);

    const handleSaveEdit = useCallback(async () => {
        if (!editingId || !editData.front.trim() || !editData.back.trim()) return;
        const supabase = createClient();
        await supabase.from("flashcards").update({ front: editData.front, back: editData.back }).eq("id", editingId);
        setTerms(prev => prev.map(t => t.id === editingId ? { ...t, front: editData.front, back: editData.back } : t));
        setEditingId(null);
        setEditData({ front: '', back: '' });
    }, [editingId, editData]);

    const handleCancelEdit = useCallback(() => {
        setEditingId(null);
        setEditData({ front: '', back: '' });
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        const supabase = createClient();
        await supabase.from("flashcards").delete().eq("id", id);
        setTerms(prev => prev.filter(t => t.id !== id));
    }, []);

    const handleAddNew = useCallback(async () => {
        if (!newTerm.front.trim() || !newTerm.back.trim()) return;
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: newCard } = await supabase.from("flashcards").insert({ set_id: material.id, user_id: user.id, front: newTerm.front, back: newTerm.back }).select().single();
        if (newCard) setTerms(prev => [...prev, { id: newCard.id, front: newCard.front, back: newCard.back, stage: 'new' }]);
        setNewTerm({ front: '', back: '' });
        setIsAddingNew(false);
    }, [newTerm, material.id]);

    const handleDeleteSet = useCallback(async () => {
        setIsDeleting(true);
        const supabase = createClient();
        const table = materialType === 'flashcard' ? "flashcard_sets" : "reviewers";
        await supabase.from(table).delete().eq("id", material.id);
        router.push("/materials");
    }, [material.id, router, materialType]);

    const handleEditReviewerTerm = useCallback(async (categoryId: string, termId: string, term: string, definition: string) => {
        const supabase = createClient();
        await supabase.from("reviewer_terms").update({ term, definition }).eq("id", termId);
        setCategories(prev => prev.map(cat => 
            cat.id === categoryId 
                ? { ...cat, terms: cat.terms.map(t => t.id === termId ? { ...t, term, definition } : t) }
                : cat
        ));
    }, []);

    const handleDeleteReviewerTerm = useCallback(async (categoryId: string, termId: string) => {
        const supabase = createClient();
        await supabase.from("reviewer_terms").delete().eq("id", termId);
        setCategories(prev => prev.map(cat => 
            cat.id === categoryId 
                ? { ...cat, terms: cat.terms.filter(t => t.id !== termId) }
                : cat
        ));
    }, []);

    const handleAddReviewerTerm = useCallback(async (categoryId: string, term: string, definition: string) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: newTerm } = await supabase
            .from("reviewer_terms")
            .insert({ category_id: categoryId, user_id: user.id, term, definition })
            .select()
            .single();
        if (newTerm) {
            setCategories(prev => prev.map(cat => 
                cat.id === categoryId 
                    ? { ...cat, terms: [...cat.terms, { id: newTerm.id, term: newTerm.term, definition: newTerm.definition }] }
                    : cat
            ));
        }
    }, []);

    const handleDeleteCategory = useCallback(async (categoryId: string) => {
        const supabase = createClient();
        await supabase.from("reviewer_categories").delete().eq("id", categoryId);
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        setExpandedCategories(prev => prev.filter(id => id !== categoryId));
    }, []);

    return (
        <div className="w-full">
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                materialId={material.id}
                materialType={materialType === 'flashcard' ? "flashcard_set" : "reviewer"}
                materialTitle={material.title}
            />
            <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                    <button onClick={() => router.back()} className={`flex items-center gap-2 transition-colors ${
                        isSpooky ? "text-purple-200 hover:text-white" : "text-[#171d2b]/50 hover:text-[#171d2b]"
                    }`}>
                        <ArrowLeft size={16} /><span className="font-sans text-sm">{isSpooky ? "Return to Archives" : "Back to Materials"}</span>
                    </button>
                    <div className="flex gap-2 md:hidden">
                        {materialType === 'reviewer' && (
                            <div className="relative">
                                <button 
                                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                                    className={`p-2 rounded-lg border transition-colors ${
                                        isSpooky ? "border-purple-500/20 hover:bg-purple-500/10 text-purple-400" : "border-[#171d2b]/10 hover:bg-[#171d2b]/5 text-[#171d2b]/60"
                                    }`} 
                                    title="Download"
                                >
                                    <Download size={18} />
                                </button>
                                {showDownloadMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowDownloadMenu(false)} />
                                        <div className="absolute right-0 top-full mt-1 z-50">
                                            <div className={`rounded-lg border shadow-lg py-1 min-w-[140px] ${
                                                isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-[#171d2b]/10"
                                            }`}>
                                                <button 
                                                    onClick={() => { 
                                                        const exportCategories = categories.map(c => ({
                                                            name: c.name,
                                                            terms: c.terms.map(t => ({ front: t.term, back: t.definition }))
                                                        }));
                                                        exportToPDF({ title: material.title, terms: [], categories: exportCategories });
                                                        setShowDownloadMenu(false);
                                                    }} 
                                                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                                        isSpooky ? "text-purple-200 hover:bg-purple-500/10" : "text-[#171d2b] hover:bg-[#171d2b]/5"
                                                    }`}
                                                >
                                                    Download PDF
                                                </button>
                                                <button 
                                                    onClick={() => { 
                                                        const exportCategories = categories.map(c => ({
                                                            name: c.name,
                                                            terms: c.terms.map(t => ({ front: t.term, back: t.definition }))
                                                        }));
                                                        exportToDOCX({ title: material.title, terms: [], categories: exportCategories });
                                                        setShowDownloadMenu(false);
                                                    }} 
                                                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                                        isSpooky ? "text-purple-200 hover:bg-purple-500/10" : "text-[#171d2b] hover:bg-[#171d2b]/5"
                                                    }`}
                                                >
                                                    Download DOCX
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        <button onClick={() => setShowShareModal(true)} className={`p-2 rounded-lg border transition-colors ${
                            isSpooky ? "border-purple-500/20 hover:bg-purple-500/10 text-purple-400" : "border-[#171d2b]/10 hover:bg-[#171d2b]/5 text-[#171d2b]/60"
                        }`} title="Share"><Share2 size={18} /></button>
                        <button onClick={() => setShowDeleteConfirm(true)} className={`p-2 rounded-lg border transition-colors ${
                            isSpooky ? "border-purple-500/20 hover:bg-red-900/20 text-red-400" : "border-[#171d2b]/10 hover:bg-red-50 hover:border-red-200 text-red-500"
                        }`} title="Delete">{isSpooky ? <Skull size={18} /> : <Trash2 size={18} />}</button>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl md:text-3xl font-sora font-bold mb-1 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{material.title}</h1>
                        <div className={`flex flex-wrap items-center gap-2 text-xs ${isSpooky ? "text-purple-200" : "text-[#171d2b]/50"}`}>
                            <span>{materialType === 'flashcard' ? terms.length : categories.reduce((sum, c) => sum + c.terms.length, 0)} {isSpooky ? "incantations" : "terms"}</span><span>•</span><span>Last updated {formatTimeAgo(new Date(material.updated_at))}</span>
                        </div>
                    </div>
                    <div className="hidden md:flex gap-2">
                        {materialType === 'reviewer' && (
                            <div className="relative">
                                <button 
                                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                                    className={`p-2 rounded-lg border transition-colors ${
                                        isSpooky ? "border-purple-500/20 hover:bg-purple-500/10 text-purple-400" : "border-[#171d2b]/10 hover:bg-[#171d2b]/5 text-[#171d2b]/60"
                                    }`} 
                                    title="Download"
                                >
                                    <Download size={18} />
                                </button>
                                {showDownloadMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowDownloadMenu(false)} />
                                        <div className="absolute right-0 top-full mt-1 z-50">
                                            <div className={`rounded-lg border shadow-lg py-1 min-w-[140px] ${
                                                isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-[#171d2b]/10"
                                            }`}>
                                                <button 
                                                    onClick={() => { 
                                                        const exportCategories = categories.map(c => ({
                                                            name: c.name,
                                                            terms: c.terms.map(t => ({ front: t.term, back: t.definition }))
                                                        }));
                                                        exportToPDF({ title: material.title, terms: [], categories: exportCategories });
                                                        setShowDownloadMenu(false);
                                                    }} 
                                                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                                        isSpooky ? "text-purple-200 hover:bg-purple-500/10" : "text-[#171d2b] hover:bg-[#171d2b]/5"
                                                    }`}
                                                >
                                                    Download PDF
                                                </button>
                                                <button 
                                                    onClick={() => { 
                                                        const exportCategories = categories.map(c => ({
                                                            name: c.name,
                                                            terms: c.terms.map(t => ({ front: t.term, back: t.definition }))
                                                        }));
                                                        exportToDOCX({ title: material.title, terms: [], categories: exportCategories });
                                                        setShowDownloadMenu(false);
                                                    }} 
                                                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                                        isSpooky ? "text-purple-200 hover:bg-purple-500/10" : "text-[#171d2b] hover:bg-[#171d2b]/5"
                                                    }`}
                                                >
                                                    Download DOCX
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        <button onClick={() => setShowShareModal(true)} className={`p-2 rounded-lg border transition-colors ${
                            isSpooky ? "border-purple-500/20 hover:bg-purple-500/10 text-purple-400" : "border-[#171d2b]/10 hover:bg-[#171d2b]/5 text-[#171d2b]/60"
                        }`} title="Share"><Share2 size={18} /></button>
                        <button onClick={() => setShowDeleteConfirm(true)} className={`p-2 rounded-lg border transition-colors ${
                            isSpooky ? "border-purple-500/20 hover:bg-red-900/20 text-red-400" : "border-[#171d2b]/10 hover:bg-red-50 hover:border-red-200 text-red-500"
                        }`} title="Delete">{isSpooky ? <Skull size={18} /> : <Trash2 size={18} />}</button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className={`rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 ${
                        isSpooky ? "bg-[#151821] border border-purple-500/20" : "bg-white"
                    }`}>
                        <h2 className={`font-sora font-bold text-lg mb-2 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
                            {isSpooky ? "Banish this tome?" : `Delete ${materialType === 'flashcard' ? 'Flashcard Set' : 'Reviewer'}?`}
                        </h2>
                        <p className={`text-sm mb-6 ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>
                            This will permanently delete &quot;{material.title}&quot; and all its {materialType === 'flashcard' ? 'flashcards' : 'terms'}. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className={`flex-1 py-3 border rounded-xl font-medium transition-colors disabled:opacity-50 ${
                                    isSpooky ? "border-purple-500/20 text-purple-300 hover:bg-purple-500/10" : "border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteSet}
                                disabled={isDeleting}
                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : (isSpooky ? <Skull size={18} /> : <Trash2 size={18} />)}
                                {isDeleting ? (isSpooky ? "Banishing..." : "Deleting...") : (isSpooky ? "Banish" : "Delete")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {materialType === 'flashcard' && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                        <StudyToolButton title={isSpooky ? "Dark Cards" : "Flashcards"} icon={FlashcardsIcon} href={`/materials/${material.id}/flashcards`} isSpooky={isSpooky} />
                        <StudyToolButton title={isSpooky ? "Learn" : "Learn"} icon={LearnIcon} href={`/materials/${material.id}/learn`} isSpooky={isSpooky} />
                        <StudyToolButton title={isSpooky ? "Practice" : "Practice"} icon={PracticeIcon} href={`/materials/${material.id}/practice`} isSpooky={isSpooky} />
                        <StudyToolButton title={isSpooky ? "Match" : "Match"} icon={MatchIcon} href={`/materials/${material.id}/match`} isSpooky={isSpooky} />
                    </div>

                    <StudyingProgress items={terms.map(t => ({ id: t.id, status: t.stage === 'review' ? 'almost_done' : t.stage }))} className="mb-5" />

                    <div className={`rounded-xl border shadow-sm overflow-hidden ${
                        isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-[#171d2b]/5"
                    }`}>
                        <div className={`px-4 py-3 border-b flex items-center justify-between ${
                            isSpooky ? "border-purple-500/10" : "border-[#171d2b]/5"
                        }`}>
                            <h3 className={`font-sora font-semibold text-sm ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
                                {isSpooky ? `Incantations (${terms.length})` : `Terms (${terms.length})`}
                            </h3>
                            <button onClick={() => setIsAddingNew(true)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-colors ${
                                isSpooky ? "bg-purple-600 hover:bg-purple-500" : "bg-[#171d2b] hover:bg-[#2a3347]"
                            }`}><Plus size={14} />{isSpooky ? "Inscribe" : "Add Term"}</button>
                        </div>

                        <AnimatePresence>
                            {isAddingNew && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <div className={`px-4 py-3 border-b ${isSpooky ? "bg-purple-500/10 border-purple-500/10" : "bg-[#171d2b]/5 border-[#171d2b]/5"}`}>
                                        <div className="flex flex-col md:flex-row gap-2">
                                            <input type="text" value={newTerm.front} onChange={(e) => setNewTerm({ ...newTerm, front: e.target.value })} placeholder={isSpooky ? "Incantation..." : "Enter term"} className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 text-sm ${
                                                isSpooky ? "bg-[#0d0f14] border-purple-500/20 text-purple-100 focus:ring-purple-500/30" : "bg-white border-[#171d2b]/10 focus:ring-[#171d2b]/20"
                                            }`} autoFocus />
                                            <input type="text" value={newTerm.back} onChange={(e) => setNewTerm({ ...newTerm, back: e.target.value })} placeholder={isSpooky ? "Dark knowledge..." : "Enter definition"} className={`flex-[2] px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 text-sm ${
                                                isSpooky ? "bg-[#0d0f14] border-purple-500/20 text-purple-100 focus:ring-purple-500/30" : "bg-white border-[#171d2b]/10 focus:ring-[#171d2b]/20"
                                            }`} />
                                            <div className="flex gap-2">
                                                <button onClick={handleAddNew} disabled={!newTerm.front.trim() || !newTerm.back.trim()} className={`px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 ${
                                                    isSpooky ? "bg-purple-600 hover:bg-purple-500" : "bg-[#171d2b] hover:bg-[#2a3347]"
                                                }`}>{isSpooky ? "Inscribe" : "Add"}</button>
                                                <button onClick={() => { setIsAddingNew(false); setNewTerm({ front: '', back: '' }); }} className={`p-2 rounded-lg transition-colors ${
                                                    isSpooky ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30" : "bg-[#171d2b]/10 text-[#171d2b] hover:bg-[#171d2b]/20"
                                                }`}><X size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Reorder.Group axis="y" values={terms} onReorder={setTerms} className={`divide-y ${isSpooky ? "divide-purple-500/10" : "divide-[#171d2b]/5"}`}>
                            {terms.map((term) => (
                                <TermItem key={term.id} term={term} onEdit={() => handleEdit(term)} onDelete={() => handleDelete(term.id)} isEditing={editingId === term.id} onSave={handleSaveEdit} onCancel={handleCancelEdit} editData={editData} setEditData={setEditData} isSpooky={isSpooky} />
                            ))}
                        </Reorder.Group>

                        {terms.length === 0 && <div className="p-10 text-center"><p className={`text-sm ${isSpooky ? "text-purple-300/50" : "text-[#171d2b]/50"}`}>{isSpooky ? "No incantations inscribed yet. Add your first spell to begin." : "No terms yet. Add your first term to get started."}</p></div>}
                    </div>
                </>
            )}

            {materialType === 'reviewer' && (
                <ReviewerDisplay 
                    categories={categories} 
                    expandedCategories={expandedCategories} 
                    toggleCategory={toggleCategory} 
                    filterText={filterText} 
                    setFilterText={setFilterText}
                    onEditTerm={handleEditReviewerTerm}
                    onDeleteTerm={handleDeleteReviewerTerm}
                    onAddTerm={handleAddReviewerTerm}
                    onDeleteCategory={handleDeleteCategory}
                    isSpooky={isSpooky}
                />
            )}
        </div>
    );
}
