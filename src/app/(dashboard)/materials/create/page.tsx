"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Plus,
    Trash2,
    Sparkles,
    Save,
    Loader2,
    X,
    Layers,
    BookOpen,
    Check,
    Info,
    Search,
    ChevronDown,
    ChevronUp,
    Copy,
    RefreshCw
} from "lucide-react";
import { Confetti } from "@/components/EmotionalAssets";
import { createClient } from "@/config/supabase/client";
import { useThemeStore } from "@/lib/stores";

type CreateType = "material" | "reviewer";
type InputMode = "manual" | "bulk" | "ai";
type ReviewerStep = "input" | "processing" | "results";
type ExtractionMode = "full" | "sentence" | "keywords";

interface Card {
    id: string;
    term: string;
    definition: string;
}

interface ExtractedTerm {
    id: string;
    term: string;
    definition: string;
    examples?: string[];
    keywords?: string[];
    subcategoryTitle?: string;
    subcategories?: string[];
}

interface Category {
    id: string;
    name: string;
    terms: ExtractedTerm[];
    color: string;
}

interface ApiTerm {
    term: string;
    definition: string;
    examples?: string[];
    keywords?: string[];
    subcategoryTitle?: string;
    subcategories?: string[];
}

interface ApiCategory {
    name: string;
    color?: string;
    terms?: ApiTerm[];
}

const ACCEPTED_FILE_TYPES = ".pdf";
const MAX_FILE_SIZE = 20 * 1024 * 1024;

function parseTextToCards(text: string): Card[] {
    const lines = text.split('\n').filter(line => line.trim());
    const cards: Card[] = [];
    const separators = [' - ', ' : ', ' ; ', '\t', ' – ', ' — ', '-', ':', ';'];

    for (const line of lines) {
        let term = '';
        let definition = '';

        for (const sep of separators) {
            const idx = line.indexOf(sep);
            if (idx > 0) {
                term = line.substring(0, idx).trim();
                definition = line.substring(idx + sep.length).trim();
                break;
            }
        }

        if (term && definition) {
            cards.push({ id: Date.now().toString() + Math.random(), term, definition });
        }
    }
    return cards;
}

export default function CreatePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";

    // Theme colors
    const bgColor = isSpooky ? "bg-[#0a0b0f]" : "";
    const cardBg = isSpooky ? "bg-[#1a1b26]" : "bg-white";
    const cardBorder = isSpooky ? "border-purple-500/20" : "border-[#171d2b]/10";
    const textColor = isSpooky ? "text-purple-100" : "text-[#171d2b]";
    const textMuted = isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60";
    const inputBg = isSpooky ? "bg-[#0d0e14] border-purple-500/30 text-purple-100 placeholder:text-purple-400/40" : "border-[#171d2b]/10 text-[#171d2b] placeholder:text-[#171d2b]/30";

    const [createType, setCreateType] = useState<CreateType>("material");
    const [title, setTitle] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const [inputMode, setInputMode] = useState<InputMode>("manual");
    const [cards, setCards] = useState<Card[]>([{ id: "1", term: "", definition: "" }]);
    const [bulkText, setBulkText] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    // Reviewer specific state
    const [reviewerStep, setReviewerStep] = useState<ReviewerStep>("input");
    const [extractionMode, setExtractionMode] = useState<ExtractionMode>("full");
    const [reviewerResults, setReviewerResults] = useState<Category[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const [filterText, setFilterText] = useState("");

    const handleFileSelect = useCallback((file: File) => {
        setError(null);
        if (file.size > MAX_FILE_SIZE) {
            setError("File size must be less than 20MB");
            return;
        }
        const ext = file.name.toLowerCase().split(".").pop();
        if (ext !== "pdf") {
            setError("Only PDF files are supported. Please convert PPTX, DOCX, or other formats to PDF first.");
            return;
        }
        setSelectedFile(file);
        if (!title.trim()) setTitle(file.name.replace(/\.[^/.]+$/, ""));
        if (createType === "reviewer") setReviewerStep("input");
    }, [title, createType]);



    const addCard = () => setCards([...cards, { id: Date.now().toString(), term: "", definition: "" }]);

    const updateCard = (id: string, field: "term" | "definition", value: string) => {
        setCards(cards.map(card => card.id === id ? { ...card, [field]: value } : card));
    };

    const removeCard = (id: string) => {
        if (cards.length > 1) setCards(cards.filter(card => card.id !== id));
    };

    const handleImportFromBulk = () => {
        if (!bulkText.trim()) {
            setError("Please enter text first");
            return;
        }
        const parsed = parseTextToCards(bulkText);
        if (parsed.length === 0) {
            setError("No valid term-definition pairs found. Use formats like: term - definition, term : definition, or term ; definition");
            return;
        }
        const existingNonEmpty = cards.filter(c => (c.term || "").trim() || (c.definition || "").trim());
        setCards(existingNonEmpty.length > 0 ? [...existingNonEmpty, ...parsed] : parsed);
        setBulkText("");
        setInputMode("manual");
        setError(null);
    };

    const handleGenerateCards = async () => {
        if (!selectedFile) return;
        setIsGenerating(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            const response = await fetch("/api/generate-cards", { method: "POST", body: formData });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to generate cards");
            }
            const data = await response.json();
            const generatedCards: Card[] = data.cards.map((card: { term: string; definition: string }, i: number) => ({
                id: (Date.now() + i).toString(),
                term: card.term || "",
                definition: card.definition || "",
            }));
            const existingNonEmpty = cards.filter(c => (c.term || "").trim() || (c.definition || "").trim());
            setCards(existingNonEmpty.length > 0 ? [...existingNonEmpty, ...generatedCards] : generatedCards);
            // Only switch to manual mode for material type
            if (createType === "material") {
                setInputMode("manual");
            }
            setSelectedFile(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate cards");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateReviewer = async () => {
        if (!selectedFile) return;
        setIsGenerating(true);
        setReviewerStep("processing");
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("extractionMode", extractionMode);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s client timeout

            const response = await fetch("/api/generate-reviewer", {
                method: "POST",
                body: formData,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Check content type before parsing
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server returned an invalid response. Please try again with a smaller file.");
            }

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to generate reviewer");
            }

            const data = await response.json();

            if (data.title && !title) {
                setTitle(data.title);
            }

            const categories: Category[] = (data.categories || []).map((cat: ApiCategory, i: number) => ({
                id: `cat-${Date.now()}-${i}`,
                name: cat.name,
                color: cat.color || '#E0F2FE',
                terms: (cat.terms || []).map((t: ApiTerm, j: number) => ({
                    id: `term-${Date.now()}-${i}-${j}`,
                    term: String(t.term || ''),
                    definition: String(t.definition || ''),
                    examples: (t.examples || []).map((ex: unknown) => typeof ex === 'string' ? ex : String(ex)),
                    keywords: (t.keywords || []).map((kw: unknown) => typeof kw === 'string' ? kw : String(kw)),
                    subcategoryTitle: t.subcategoryTitle ? String(t.subcategoryTitle) : undefined,
                    subcategories: (t.subcategories || []).map((sub: unknown) => typeof sub === 'string' ? sub : String(sub)),
                })),
            }));

            setReviewerResults(categories);
            setExpandedCategories(categories.map(c => c.id));
            setTimeout(() => setReviewerStep("results"), 300);
            setSelectedFile(null);
        } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
                setError("Request timed out. Please try with a smaller file or simpler content.");
            } else {
                setError(err instanceof Error ? err.message : "Failed to generate reviewer");
            }
            setReviewerStep("input");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            setError("Please enter a title");
            return;
        }
        const validCards = cards.filter(c => (c.term || "").trim() && (c.definition || "").trim());
        if (validCards.length === 0) {
            setError("Please add at least one card with both term and definition");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Create flashcard set
            const { data: flashcardSet, error: setError } = await supabase
                .from("flashcard_sets")
                .insert({
                    user_id: user.id,
                    title: title.trim(),
                    color: '#E0F2FE'
                })
                .select()
                .single();

            if (setError) throw setError;

            // Create flashcards
            const flashcardsToInsert = validCards.map(c => ({
                set_id: flashcardSet.id,
                user_id: user.id,
                front: c.term,
                back: c.definition,
                status: 'new'
            }));

            const { error: cardsError } = await supabase
                .from("flashcards")
                .insert(flashcardsToInsert);

            if (cardsError) throw cardsError;

            // Update stats
            await supabase.rpc("increment_stat", { p_stat_name: "flashcard_sets_created", p_amount: 1 });

            setShowSuccess(true);
            setTimeout(() => router.push("/materials"), 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save material");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveReviewer = async () => {
        if (!title.trim() || reviewerResults.length === 0) return;

        setIsSaving(true);
        setError(null);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Create reviewer
            const { data: reviewer, error: reviewerError } = await supabase
                .from("reviewers")
                .insert({
                    user_id: user.id,
                    title: title.trim(),
                    source_content: selectedFile?.name || '',
                    extraction_mode: extractionMode,
                })
                .select()
                .single();

            if (reviewerError) throw reviewerError;

            // Create categories and terms
            for (const category of reviewerResults) {
                const { data: cat, error: catError } = await supabase
                    .from("reviewer_categories")
                    .insert({
                        reviewer_id: reviewer.id,
                        user_id: user.id,
                        name: category.name,
                        color: category.color,
                    })
                    .select()
                    .single();

                if (catError) throw catError;

                if (category.terms.length > 0) {
                    const termsToInsert = category.terms.map(term => ({
                        category_id: cat.id,
                        user_id: user.id,
                        term: term.term,
                        definition: term.definition,
                        examples: term.examples || [],
                        keywords: term.keywords || [],
                    }));

                    const { error: termsError } = await supabase
                        .from("reviewer_terms")
                        .insert(termsToInsert);

                    if (termsError) throw termsError;
                }
            }

            // Update user stats
            await supabase.rpc("increment_stat", { p_stat_name: "reviewers_created", p_amount: 1 });

            setShowSuccess(true);
            setTimeout(() => router.push("/materials"), 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save reviewer");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleCategory = (id: string) => {
        setExpandedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
    };

    const filteredReviewerResults = reviewerResults.map(cat => ({
        ...cat,
        terms: cat.terms.filter(t =>
            t.term.toLowerCase().includes(filterText.toLowerCase()) ||
            t.definition.toLowerCase().includes(filterText.toLowerCase())
        )
    })).filter(cat => cat.terms.length > 0);

    const totalReviewerTerms = reviewerResults.reduce((acc, cat) => acc + cat.terms.length, 0);

    return (
        <div className={bgColor}>
            <div>
                {/* Header */}
                <div className="mb-8">
                    <h1 className={`text-4xl font-sora font-bold mb-2 ${textColor}`}>{isSpooky ? "Conjure Dark Knowledge" : "Create Materials"}</h1>
                    <p className={`font-sans text-lg ${textMuted}`}>{isSpooky ? "Choose your dark creation" : "Choose what you want to create"}</p>
                </div>

                {/* Type Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                    <button
                        onClick={() => setCreateType("material")}
                        className={`p-4 sm:p-5 rounded-xl border-2 text-left transition-all ${createType === "material"
                            ? (isSpooky ? "border-purple-500 bg-purple-900/20" : "border-[#171d2b] bg-[#171d2b]/5")
                            : (isSpooky ? "border-purple-500/20 hover:border-purple-500/40 bg-[#1a1b26]" : "border-[#171d2b]/10 hover:border-[#171d2b]/30 bg-white")
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSpooky ? "bg-purple-600" : "bg-[#171d2b]"}`}>
                                    <Layers size={20} className="text-white" />
                                </div>
                                <span className={`font-sora font-semibold ${textColor}`}>{isSpooky ? "Dark Cards" : "Cards"}</span>
                            </div>
                            {createType === "material" && <Check size={18} className={isSpooky ? "text-purple-400" : "text-[#171d2b]"} />}
                        </div>
                        <p className={`text-sm ${textMuted}`}>{isSpooky ? "Conjure cards for dark memorization" : "Create cards for memorization"}</p>
                    </button>

                    <button
                        onClick={() => {
                            setCreateType("reviewer");
                            setReviewerStep("input");
                        }}
                        className={`p-4 sm:p-5 rounded-xl border-2 text-left transition-all ${createType === "reviewer"
                            ? (isSpooky ? "border-purple-500 bg-purple-900/20" : "border-[#171d2b] bg-[#171d2b]/5")
                            : (isSpooky ? "border-purple-500/20 hover:border-purple-500/40 bg-[#1a1b26]" : "border-[#171d2b]/10 hover:border-[#171d2b]/30 bg-white")
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${isSpooky ? "bg-[#1a1b26] border-purple-500/30" : "bg-white border-[#171d2b]/10"}`}>
                                    <BookOpen size={20} className={isSpooky ? "text-purple-400" : "text-[#171d2b]"} />
                                </div>
                                <span className={`font-sora font-semibold ${textColor}`}>{isSpooky ? "Grimoire" : "Reviewer"}</span>
                            </div>
                            {createType === "reviewer" && <Check size={18} className={isSpooky ? "text-purple-400" : "text-[#171d2b]"} />}
                        </div>
                        <p className={`text-sm ${textMuted}`}>{isSpooky ? "Extract forbidden knowledge from scrolls" : "Extract organized notes from documents"}</p>
                    </button>
                </div>

                {/* Extraction Mode Selection - Only for reviewer type */}
                {createType === "reviewer" && reviewerStep === "input" && (
                    <div className="mb-6">
                        <label className={`block text-sm font-medium mb-3 text-left ${textMuted}`}>
                            {isSpooky ? "Dark Extraction Mode" : "Extraction Mode"}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { id: "full", label: isSpooky ? "Full Ritual" : "Full Mode", desc: isSpooky ? "Complete dark knowledge & examples" : "Complete definitions & examples" },
                                { id: "sentence", label: isSpooky ? "Swift Curse" : "Sentence Mode", desc: isSpooky ? "Concise dark summaries" : "Concise summaries" },
                                { id: "keywords", label: isSpooky ? "Shadow Words" : "Keywords Mode", desc: isSpooky ? "Key dark phrases only" : "Key phrases only" }
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => setExtractionMode(mode.id as ExtractionMode)}
                                    className={`p-3 rounded-xl border text-left transition-all ${extractionMode === mode.id
                                        ? (isSpooky ? "border-purple-500 bg-purple-900/20" : "border-[#171d2b] bg-[#171d2b]/5")
                                        : (isSpooky ? "border-purple-500/20 hover:border-purple-500/40 bg-[#1a1b26]" : "border-[#171d2b]/10 hover:border-[#171d2b]/30 bg-white")
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`font-sora font-semibold text-sm ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>{mode.label}</span>
                                        {extractionMode === mode.id && <Check size={14} className={isSpooky ? "text-purple-400" : "text-[#171d2b]"} />}
                                    </div>
                                    <p className={`text-xs ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>{mode.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Title Input */}
                <div className={`rounded-xl border p-4 sm:p-5 mb-6 ${cardBg} ${cardBorder}`}>
                    <label className={`block text-sm font-medium mb-2 text-left ${textMuted}`}>
                        {isSpooky ? "Spell Name" : "Material Title"}
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={isSpooky ? "e.g., Dark Arts Chapter 1" : "e.g., Biology Chapter 1"}
                        className={`w-full px-4 py-3 rounded-lg border focus:outline-none text-left ${inputBg} ${isSpooky ? "focus:border-purple-400" : "focus:border-[#171d2b]/30"}`}
                    />
                </div>

                {/* Input Mode Tabs - Only show for material type */}
                {createType === "material" && (
                    <div className="mb-6">
                        <div className={`inline-flex rounded-full p-1 ${isSpooky ? "bg-purple-900/30" : "bg-[#171d2b]/5"}`}>
                            <button
                                onClick={() => setInputMode("manual")}
                                className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all ${inputMode === "manual"
                                    ? (isSpooky ? "bg-purple-600 text-white" : "bg-[#171d2b] text-white")
                                    : (isSpooky ? "text-purple-300/60 hover:text-purple-300" : "text-[#171d2b]/60 hover:text-[#171d2b]")
                                    }`}
                            >
                                {isSpooky ? "Manual Conjure" : "Manual Entry"}
                            </button>
                            <button
                                onClick={() => setInputMode("bulk")}
                                className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all ${inputMode === "bulk"
                                    ? (isSpooky ? "bg-purple-600 text-white" : "bg-[#171d2b] text-white")
                                    : (isSpooky ? "text-purple-300/60 hover:text-purple-300" : "text-[#171d2b]/60 hover:text-[#171d2b]")
                                    }`}
                            >
                                {isSpooky ? "Mass Summon" : "Bulk Add"}
                            </button>
                            <button
                                onClick={() => setInputMode("ai")}
                                className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all ${inputMode === "ai"
                                    ? (isSpooky ? "bg-purple-600 text-white" : "bg-[#171d2b] text-white")
                                    : (isSpooky ? "text-purple-300/60 hover:text-purple-300" : "text-[#171d2b]/60 hover:text-[#171d2b]")
                                    }`}
                            >
                                {isSpooky ? "Dark AI" : "AI Generate"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-left"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Manual Entry Mode - Only for material type */}
                <AnimatePresence mode="wait">
                    {createType === "material" && inputMode === "manual" && (
                        <motion.div
                            key="manual"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`rounded-xl border p-4 sm:p-6 ${cardBg} ${cardBorder}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className={`font-sora font-semibold text-left ${textColor}`}>
                                    {isSpooky ? "Dark Spells" : "Cards"} ({cards.filter(c => (c.term || "").trim() && (c.definition || "").trim()).length})
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {cards.map((card, index) => (
                                    <div
                                        key={card.id}
                                        className={`p-4 rounded-xl border ${isSpooky ? "bg-[#0d0e14] border-purple-500/20" : "bg-[#f8f9fa] border-[#171d2b]/5"}`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`text-sm font-medium ${isSpooky ? "text-purple-400/40" : "text-[#171d2b]/40"}`}>{index + 1}</span>
                                            {cards.length > 1 && (
                                                <button
                                                    onClick={() => removeCard(card.id)}
                                                    className={`p-1.5 rounded-lg transition-colors ${isSpooky ? "hover:bg-red-900/30 text-purple-400/40 hover:text-red-400" : "hover:bg-red-50 text-[#171d2b]/40 hover:text-red-500"}`}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div>
                                                <label className={`block text-xs font-medium mb-1.5 uppercase tracking-wider text-left ${isSpooky ? "text-purple-400/40" : "text-[#171d2b]/40"}`}>
                                                    {isSpooky ? "Incantation" : "Term"}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={card.term}
                                                    onChange={(e) => updateCard(card.id, "term", e.target.value)}
                                                    placeholder={isSpooky ? "Enter incantation" : "Enter term"}
                                                    className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none text-sm text-left ${inputBg} ${isSpooky ? "focus:border-purple-400" : "focus:border-[#171d2b]/30"}`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-xs font-medium mb-1.5 uppercase tracking-wider text-left ${isSpooky ? "text-purple-400/40" : "text-[#171d2b]/40"}`}>
                                                    {isSpooky ? "Dark Knowledge" : "Definition"}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={card.definition}
                                                    onChange={(e) => updateCard(card.id, "definition", e.target.value)}
                                                    placeholder={isSpooky ? "Enter dark knowledge" : "Enter definition"}
                                                    className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none text-sm text-left ${inputBg} ${isSpooky ? "focus:border-purple-400" : "focus:border-[#171d2b]/30"}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={addCard}
                                className={`mt-4 w-full py-3 border-2 border-dashed rounded-xl transition-colors flex items-center justify-center gap-2 ${isSpooky ? "border-purple-500/30 text-purple-300/60 hover:border-purple-400/50 hover:text-purple-300" : "border-[#171d2b]/20 text-[#171d2b]/60 hover:border-[#171d2b]/40 hover:text-[#171d2b]"}`}
                            >
                                <Plus size={18} />
                                <span className="text-sm font-medium">{isSpooky ? "Conjure Spell" : "Add Card"}</span>
                            </button>
                        </motion.div>
                    )}

                    {/* Bulk Add Mode - Only for material type */}
                    {createType === "material" && inputMode === "bulk" && (
                        <motion.div
                            key="bulk"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`rounded-xl border p-4 sm:p-6 ${cardBg} ${cardBorder}`}
                        >
                            <div className="text-left mb-4">
                                <div className="flex items-center gap-2">
                                    <h2 className={`font-sora font-semibold ${textColor}`}>{isSpooky ? "Mass Summon" : "Bulk Add"}</h2>
                                    <div className="relative group">
                                        <button className={`p-1 rounded-full transition-colors ${isSpooky ? "hover:bg-purple-900/30" : "hover:bg-[#171d2b]/10"}`}>
                                            <Info size={14} className={isSpooky ? "text-purple-400/40" : "text-[#171d2b]/40"} />
                                        </button>
                                        <div className={`absolute left-0 top-full mt-1 w-48 p-3 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-lg ${isSpooky ? "bg-purple-900" : "bg-[#171d2b]"}`}>
                                            <p className="font-medium mb-1.5">{isSpooky ? "Spell formats:" : "Supported formats:"}</p>
                                            <ul className="space-y-0.5 text-white/80">
                                                <li>term - definition</li>
                                                <li>term : definition</li>
                                                <li>term ; definition</li>
                                                <li>term [tab] definition</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <p className={`text-sm mt-1 ${textMuted}`}>{isSpooky ? "Inscribe your dark incantations below" : "Paste your term-definition pairs below"}</p>
                            </div>

                            <textarea
                                value={bulkText}
                                onChange={(e) => setBulkText(e.target.value)}
                                placeholder={isSpooky ? `Example format:\nDark Spell - A forbidden incantation\nShadow : The absence of light\nNecromancy ; The art of the dead` : `Example format:\nApple - A round fruit with red or green skin\nCapital : The city where a country's government is located\nH2O ; The chemical formula for water`}
                                className={`w-full h-48 sm:h-64 px-4 py-3 rounded-xl border focus:outline-none text-sm resize-none text-left ${inputBg} ${isSpooky ? "focus:border-purple-400" : "focus:border-[#171d2b]/30"}`}
                            />

                            <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                <button
                                    onClick={() => {
                                        setBulkText("");
                                        setInputMode("manual");
                                    }}
                                    className={`flex-1 py-3 rounded-xl border transition-colors text-sm font-medium ${isSpooky ? "border-purple-500/30 text-purple-300/60 hover:bg-purple-900/30" : "border-[#171d2b]/10 text-[#171d2b]/60 hover:bg-[#171d2b]/5"}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleImportFromBulk}
                                    disabled={!bulkText.trim()}
                                    className={`flex-1 py-3 rounded-xl text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${isSpooky ? "bg-purple-600 hover:bg-purple-500" : "bg-[#171d2b] hover:bg-[#171d2b]/90"}`}
                                >
                                    {isSpooky ? "Summon Spells" : "Import Cards"}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* AI Generate Mode - Show for reviewer (input/processing) OR when ai mode selected for material */}
                    {((createType === "reviewer" && reviewerStep !== "results") || (createType === "material" && inputMode === "ai")) && (
                        <motion.div
                            key="ai"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`rounded-xl border p-4 sm:p-6 ${cardBg} ${cardBorder}`}
                        >
                            <div className="text-left mb-4">
                                <h2 className={`font-sora font-semibold mb-1 ${textColor}`}>{isSpooky ? "Dark AI Extraction" : "AI Generate"}</h2>
                                <p className={`text-sm ${textMuted}`}>
                                    {isSpooky ? "Upload a scroll and let dark forces extract forbidden knowledge" : "Upload a document and let AI extract terms automatically"}
                                </p>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={ACCEPTED_FILE_TYPES}
                                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                className="hidden"
                            />

                            {!selectedFile ? (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-full py-12 border-2 border-dashed rounded-xl transition-colors flex flex-col items-center justify-center gap-3 ${isSpooky ? "border-purple-500/30 text-purple-300/60 hover:border-purple-400/50 hover:text-purple-300" : "border-[#171d2b]/20 text-[#171d2b]/60 hover:border-[#171d2b]/40 hover:text-[#171d2b]"}`}
                                >
                                    <FileText size={32} />
                                    <div className="text-center">
                                        <p className="text-sm font-medium">{isSpooky ? "Click to upload dark scroll" : "Click to upload PDF"}</p>
                                        <p className={`text-xs mt-1 ${isSpooky ? "text-purple-400/40" : "text-[#171d2b]/40"}`}>PDF only (max 20MB)</p>
                                        <p className={`text-xs mt-0.5 ${isSpooky ? "text-purple-400/30" : "text-[#171d2b]/30"}`}>Convert PPTX/DOCX to PDF first</p>
                                    </div>
                                </button>
                            ) : (
                                <div className={`p-4 rounded-xl border ${isSpooky ? "bg-[#0d0e14] border-purple-500/20" : "bg-[#f8f9fa] border-[#171d2b]/10"}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileText size={20} className={isSpooky ? "text-purple-400/60" : "text-[#171d2b]/60"} />
                                            <div className="text-left">
                                                <p className={`text-sm font-medium ${textColor}`}>{selectedFile.name}</p>
                                                <p className={`text-xs ${isSpooky ? "text-purple-400/40" : "text-[#171d2b]/40"}`}>
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className={`p-1.5 rounded-lg transition-colors ${isSpooky ? "hover:bg-purple-900/30 text-purple-400/40 hover:text-purple-300" : "hover:bg-[#171d2b]/10 text-[#171d2b]/40 hover:text-[#171d2b]"}`}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                <button
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setInputMode("manual");
                                    }}
                                    className={`flex-1 py-3 rounded-xl border transition-colors text-sm font-medium ${isSpooky ? "border-purple-500/30 text-purple-300/60 hover:bg-purple-900/30" : "border-[#171d2b]/10 text-[#171d2b]/60 hover:bg-[#171d2b]/5"}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createType === "reviewer" ? handleGenerateReviewer : handleGenerateCards}
                                    disabled={!selectedFile || isGenerating}
                                    className={`flex-1 py-3 rounded-xl text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isSpooky ? "bg-purple-600 hover:bg-purple-500" : "bg-[#171d2b] hover:bg-[#171d2b]/90"}`}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            {isSpooky ? "Channeling..." : "Generating..."}
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={16} />
                                            {isSpooky ? "Channel Dark Forces" : "Generate"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Reviewer Results Mode */}
                <AnimatePresence>
                    {createType === "reviewer" && reviewerStep === "results" && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <Confetti isActive={true} />

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className={`text-xl font-sora font-bold ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>{isSpooky ? "Dark Extraction Complete" : "Extraction Complete"}</h2>
                                    <p className={`text-sm ${textMuted}`}>
                                        Found {totalReviewerTerms} {isSpooky ? "forbidden terms" : "key terms"} across {reviewerResults.length} {isSpooky ? "dark categories" : "categories"}.
                                    </p>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => {
                                            setReviewerStep("input");
                                            setReviewerResults([]);
                                            setTitle("");
                                        }}
                                        className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl border transition-colors text-sm font-medium flex items-center justify-center gap-2 ${isSpooky ? "border-purple-500/20 text-purple-300/60 hover:bg-purple-500/10" : "border-[#171d2b]/10 text-[#171d2b]/60 hover:bg-[#171d2b]/5"}`}
                                    >
                                        <RefreshCw size={16} />
                                        Extract Again
                                    </button>
                                    <button
                                        onClick={handleSaveReviewer}
                                        disabled={isSaving || !title.trim()}
                                        className={`flex-1 sm:flex-none py-2.5 px-6 rounded-xl transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isSpooky ? "bg-purple-600 text-white hover:bg-purple-500" : "bg-[#171d2b] text-white hover:bg-[#171d2b]/90"}`}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                Save Reviewer
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Search Filter */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#171d2b]/40" size={18} />
                                <input
                                    type="text"
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                    placeholder="Filter terms..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#171d2b]/10 focus:border-[#171d2b] outline-none bg-white transition-all focus:shadow-sm text-sm"
                                />
                            </div>

                            {/* Categories Display */}
                            <div className="space-y-4">
                                {filteredReviewerResults.map(category => (
                                    <motion.div
                                        key={category.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-xl border border-[#171d2b]/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div
                                            onClick={() => toggleCategory(category.id)}
                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                            style={{ borderLeft: `4px solid ${category.color}` }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <h3 className="font-sora font-semibold text-[#171d2b]">{category.name}</h3>
                                                <span className="px-2 py-0.5 rounded-full bg-[#171d2b]/5 text-xs font-medium text-[#171d2b]/60">
                                                    {category.terms.length} terms
                                                </span>
                                            </div>
                                            {expandedCategories.includes(category.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </div>
                                        <AnimatePresence>
                                            {expandedCategories.includes(category.id) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-[#171d2b]/5"
                                                >
                                                    <div className="p-4 grid gap-4 grid-cols-1 lg:grid-cols-2">
                                                        {category.terms.map(term => (
                                                            <div key={term.id} className="p-4 rounded-xl bg-[#f8f9fa] border border-[#171d2b]/5 hover:border-[#171d2b]/20 transition-colors group relative">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <h4 className="font-bold text-[#171d2b] pr-8">{term.term}</h4>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            navigator.clipboard.writeText(`${term.term}: ${term.definition}`);
                                                                        }}
                                                                        className="absolute top-4 right-4 p-1.5 hover:bg-[#171d2b]/10 rounded-lg text-[#171d2b]/40 opacity-0 group-hover:opacity-100 transition-all"
                                                                        title="Copy"
                                                                    >
                                                                        <Copy size={14} />
                                                                    </button>
                                                                </div>
                                                                <p className="text-[#171d2b]/80 text-sm leading-relaxed mb-3">{term.definition}</p>

                                                                {term.examples && term.examples.length > 0 && (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        <span className="text-[10px] font-semibold text-[#171d2b]/40 uppercase tracking-wider py-1">Examples:</span>
                                                                        {term.examples.map((ex, i) => (
                                                                            <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-[#171d2b]/10 text-xs text-[#171d2b]/70">
                                                                                {ex}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {term.subcategories && term.subcategories.length > 0 && (
                                                                    <div className="mt-2">
                                                                        <span className="text-[10px] font-semibold text-[#171d2b]/40 uppercase tracking-wider">
                                                                            {term.subcategoryTitle || 'Subcategories'}:
                                                                        </span>
                                                                        <ul className="mt-1 space-y-1">
                                                                            {term.subcategories.map((sub, i) => (
                                                                                <li key={i} className="text-xs text-[#171d2b]/70 pl-3 border-l-2 border-[#171d2b]/10">
                                                                                    {sub}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
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
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Action Buttons - Only show when there's valid card data and no pending file upload (Material Type) */}
                {createType === "material" && cards.filter(c => (c.term || "").trim() && (c.definition || "").trim()).length > 0 && !selectedFile && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <button
                            onClick={() => router.back()}
                            className={`flex-1 py-3 rounded-xl border transition-colors text-sm font-medium ${isSpooky ? "border-purple-500/20 text-purple-300/60 hover:bg-purple-500/10" : "border-[#171d2b]/10 text-[#171d2b]/60 hover:bg-[#171d2b]/5"}`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !title.trim()}
                            className={`flex-1 py-3 rounded-xl transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isSpooky ? "bg-purple-600 text-white hover:bg-purple-500" : "bg-[#171d2b] text-white hover:bg-[#171d2b]/90"}`}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Save Material
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Success Modal */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className={`rounded-2xl p-6 sm:p-8 text-center max-w-sm w-full ${isSpooky ? "bg-[#1a1b26] border border-purple-500/20" : "bg-white"}`}
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isSpooky ? "bg-purple-600/20" : "bg-green-100"}`}>
                                    <Check size={32} className={isSpooky ? "text-purple-400" : "text-green-600"} />
                                </div>
                                <h3 className={`text-xl font-sora font-bold mb-2 ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>
                                    {isSpooky ? "Dark Knowledge Sealed!" : "Material Saved!"}
                                </h3>
                                <p className={`text-sm ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>
                                    {isSpooky ? "Returning to your grimoire..." : "Redirecting to your materials..."}
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
