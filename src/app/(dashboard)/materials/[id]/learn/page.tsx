"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import {
    Check, X, Edit3, ArrowRight, Loader2
} from "lucide-react";
import { EncouragementToast, AnimatedProgress, HappyBirdMascot, SadBirdMascot } from "@/components/EmotionalAssets";
import SessionResultPage from "@/components/SessionResultPage";
import ExitPopup from "@/components/ExitPopup";
import StudySettingsModal from "@/components/StudySettingsModal";
import { createClient } from "@/config/supabase/client";
import { useXPStore, useThemeStore, useStudySettingsStore, getQuestionTypeForStage } from "@/lib/stores";
import type { StudySettings, QuestionType } from "@/lib/stores";
import { addXP, recordStudyActivity, updateFlashcardStatus, XP_REWARDS } from "@/services/activity";
import { DarkStudyMode, GhostIcon, PumpkinIcon } from "@/components/SpookyTheme/FlashlightEffect";

type LearnStage = 'new' | 'learning' | 'almost_done' | 'mastered';

interface LearnCard {
    id: string;
    term: string;
    definition: string;
    stage: LearnStage;
    masteredShown?: boolean;
}

interface SessionCard extends LearnCard {
    questionType: QuestionType;
    mcqOptions?: string[];
    correctOptionIndex?: number;
    tfDisplayedAnswer?: string;
    tfIsCorrect?: boolean;
}

function buildSessionQueue(cards: LearnCard[], settings: StudySettings): SessionCard[] {
    const candidates = cards.filter(c => c.stage !== 'mastered' || !c.masteredShown);
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, settings.cardsPerRound);

    // Determine if we're showing definition and asking for term, or vice versa
    const askForTerm = settings.frontSide === 'definition';

    return selected.map(card => {
        const questionType = getQuestionTypeForStage(card.stage, settings.enabledQuestionTypes);
        const sessionCard: SessionCard = { ...card, questionType };

        if (questionType === 'mcq') {
            // If showing definition, options should be TERMS (not definitions)
            // If showing term, options should be DEFINITIONS
            const correctAnswer = askForTerm ? card.term : card.definition;
            const otherOptions = cards
                .filter(c => c.id !== card.id)
                .map(c => askForTerm ? c.term : c.definition);
            const shuffledOthers = otherOptions.sort(() => Math.random() - 0.5).slice(0, 3);
            const options = [...shuffledOthers, correctAnswer].sort(() => Math.random() - 0.5);
            sessionCard.mcqOptions = options;
            sessionCard.correctOptionIndex = options.indexOf(correctAnswer);
        } else if (questionType === 'truefalse') {
            const isCorrect = Math.random() > 0.5;
            if (isCorrect) {
                sessionCard.tfDisplayedAnswer = askForTerm ? card.term : card.definition;
            } else {
                const others = cards.filter(c => c.id !== card.id);
                const wrongAnswer = others.length > 0
                    ? (askForTerm ? others[Math.floor(Math.random() * others.length)].term : others[Math.floor(Math.random() * others.length)].definition)
                    : (askForTerm ? card.term : card.definition);
                sessionCard.tfDisplayedAnswer = wrongAnswer;
            }
            sessionCard.tfIsCorrect = isCorrect;
        }

        return sessionCard;
    });
}

export default function LearnPage() {
    const router = useRouter();
    const params = useParams();
    const [isLoading, setIsLoading] = useState(true);
    
    // Use Zustand store for settings - reactive updates
    const settings = useStudySettingsStore((state) => state.studySettings);
    const settingsVersion = useStudySettingsStore((state) => state.settingsVersion);
    
    const [cards, setCards] = useState<LearnCard[]>([]);
    const [sessionQueue, setSessionQueue] = useState<SessionCard[]>([]);
    const [lastSettingsVersion, setLastSettingsVersion] = useState(settingsVersion);

    const fetchCards = useCallback(async () => {
        // Fetch XP stats for display
        useXPStore.getState().fetchXPStats();

        const supabase = createClient();
        const { data } = await supabase
            .from("flashcards")
            .select("id, front, back, status")
            .eq("set_id", params.id)
            .order("created_at");

        if (data && data.length > 0) {
            const loadedCards: LearnCard[] = data.map(c => ({
                id: c.id,
                term: c.front,
                definition: c.back,
                stage: (c.status === 'review' ? 'almost_done' : c.status || 'new') as LearnStage,
            }));
            setCards(loadedCards);
            const currentSettings = useStudySettingsStore.getState().studySettings;
            setSessionQueue(buildSessionQueue(loadedCards, currentSettings));
        }
        setIsLoading(false);
    }, [params.id]);

    useState(() => { fetchCards(); });
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [writtenAnswer, setWrittenAnswer] = useState("");
    const [writtenSubmitted, setWrittenSubmitted] = useState(false);
    const [writtenCorrect, setWrittenCorrect] = useState(false);
    const [showExitPopup, setShowExitPopup] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [sessionStats, setSessionStats] = useState(() => ({ correct: 0, incorrect: 0, xpGained: 0, startTime: Date.now() }));
    const [showToast, setShowToast] = useState(false);
    const [toastMessage] = useState("");
    const [sessionComplete, setSessionComplete] = useState(false);

    // New state for feedback flow
    const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
    const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
    const [pendingResult, setPendingResult] = useState<{ correct: boolean } | null>(null);

    // Edit card state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTerm, setEditTerm] = useState("");
    const [editDefinition, setEditDefinition] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    
    // Rebuild session when settings change (reactive) - settings are from store
    if (settingsVersion !== lastSettingsVersion && cards.length > 0 && !sessionComplete) {
        setLastSettingsVersion(settingsVersion);
        setSessionQueue(buildSessionQueue(cards, settings));
        setCurrentIndex(0);
        setIsFlipped(false);
        setWrittenAnswer("");
        setWrittenSubmitted(false);
        setAnswerState('idle');
        setSelectedOptionIndex(null);
        setPendingResult(null);
    }

    // Settings are managed by store, this callback just closes modal
    const handleSettingsSave = () => {
        // Settings already saved to store by modal
    };

    const openEditModal = () => {
        const currentCard = sessionQueue[currentIndex];
        setEditTerm(currentCard.term);
        setEditDefinition(currentCard.definition);
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editTerm.trim() || !editDefinition.trim()) return;

        setIsSavingEdit(true);
        const currentCard = sessionQueue[currentIndex];

        const supabase = createClient();
        await supabase
            .from("flashcards")
            .update({ front: editTerm.trim(), back: editDefinition.trim() })
            .eq("id", currentCard.id);

        // Update local state - cards, sessionQueue
        setCards(prev => prev.map(c =>
            c.id === currentCard.id
                ? { ...c, term: editTerm.trim(), definition: editDefinition.trim() }
                : c
        ));
        setSessionQueue(prev => prev.map(c =>
            c.id === currentCard.id
                ? { ...c, term: editTerm.trim(), definition: editDefinition.trim() }
                : c
        ));

        setIsSavingEdit(false);
        setShowEditModal(false);
    };

    const restartSession = () => {
        const queue = buildSessionQueue(cards, settings);
        setSessionQueue(queue);
        setCurrentIndex(0);
        setIsFlipped(false);
        setWrittenAnswer("");
        setWrittenSubmitted(false);
        setSessionStats({ correct: 0, incorrect: 0, xpGained: 0, startTime: Date.now() });
        setSessionComplete(false);
        setAnswerState('idle');
        setSelectedOptionIndex(null);
        setPendingResult(null);
    };

    // 1. Submit Answer (UI Feedback)
    const submitAnswer = useCallback((correct: boolean, index?: number) => {
        if (answerState !== 'idle') return; // Prevent double submission

        setAnswerState(correct ? 'correct' : 'incorrect');
        if (index !== undefined) setSelectedOptionIndex(index);
        setPendingResult({ correct });
    }, [answerState]);

    // 2. Override Result
    const handleOverride = () => {
        if (!pendingResult) return;
        const newCorrect = !pendingResult.correct;
        setPendingResult({ correct: newCorrect });
        setAnswerState(newCorrect ? 'correct' : 'incorrect');
    };

    // 3. Continue to Next Question (Commit Result)
    const handleNext = useCallback(async () => {
        if (!pendingResult) return;

        const currentCard = sessionQueue[currentIndex];
        const correct = pendingResult.correct;
        let nextStage: LearnStage = currentCard.stage;
        let xp = 0;

        if (correct) {
            if (currentCard.stage === 'new') nextStage = 'learning';
            else if (currentCard.stage === 'learning') nextStage = 'almost_done';
            else if (currentCard.stage === 'almost_done') nextStage = 'mastered';
            xp = XP_REWARDS.FLASHCARD_CORRECT;
        } else {
            if (currentCard.stage === 'almost_done') nextStage = 'learning';
        }

        // Persist card status to database
        const dbStatus = nextStage === 'almost_done' ? 'review' : nextStage;
        await updateFlashcardStatus(currentCard.id, dbStatus as 'new' | 'learning' | 'review' | 'mastered');

        const isMasteredCard = currentCard.stage === 'mastered';
        setCards(prev => prev.map(c => c.id === currentCard.id
            ? { ...c, stage: nextStage, masteredShown: isMasteredCard ? true : c.masteredShown }
            : c
        ));

        setSessionStats(prev => ({
            ...prev,
            correct: prev.correct + (correct ? 1 : 0),
            incorrect: prev.incorrect + (correct ? 0 : 1),
            xpGained: prev.xpGained + xp
        }));

        const isLastQuestion = currentIndex >= sessionQueue.length - 1;

        if (!isLastQuestion) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
            setWrittenAnswer("");
            setWrittenSubmitted(false);
            setAnswerState('idle');
            setSelectedOptionIndex(null);
            setPendingResult(null);
        } else {
            // Session complete - persist XP and activity
            const totalXpGained = sessionStats.xpGained + xp;
            if (totalXpGained > 0) {
                await addXP(totalXpGained);
                useXPStore.getState().fetchXPStats();
            }
            const minutesStudied = Math.max(1, Math.round((Date.now() - sessionStats.startTime) / 60000));
            await recordStudyActivity({ flashcards: sessionQueue.length, minutes: minutesStudied });
            setSessionComplete(true);
        }
    }, [currentIndex, pendingResult, sessionQueue, sessionStats.xpGained, sessionStats.startTime]);

    // Auto-next effect - triggers handleNext after configured duration
    useSyncExternalStore(
        useCallback(() => {
            if (!sessionComplete && answerState !== 'idle' && settings.autoNextAfterAnswer && pendingResult) {
                const timer = setTimeout(() => {
                    handleNext();
                }, settings.autoNextDuration * 1000);
                return () => clearTimeout(timer);
            }
            return () => { };
        }, [sessionComplete, answerState, settings.autoNextAfterAnswer, settings.autoNextDuration, pendingResult, handleNext]),
        () => null,
        () => null
    );

    const [justSubmittedWritten, setJustSubmittedWritten] = useState(false);

    const handleWrittenSubmit = () => {
        const currentCard = sessionQueue[currentIndex];
        const correct = writtenAnswer.trim().toLowerCase() === currentCard.term.toLowerCase();
        setWrittenCorrect(correct);
        setWrittenSubmitted(true);
        setJustSubmittedWritten(true);
        submitAnswer(correct);
        // Reset flag after a short delay to allow key handler to ignore the Enter key
        setTimeout(() => setJustSubmittedWritten(false), 100);
    };

    // Key press handler with keyboard shortcuts
    const handleKeyPress = useCallback((e: KeyboardEvent) => {
        if (sessionComplete || showExitPopup || showSettings || showEditModal || justSubmittedWritten) return;

        const currentCard = sessionQueue[currentIndex];
        if (!currentCard) return;

        // Keyboard shortcuts for MCQ (1-4 for A-D)
        if (currentCard.questionType === 'mcq' && currentCard.mcqOptions && answerState === 'idle') {
            const key = e.key;
            if (['1', '2', '3', '4'].includes(key)) {
                const index = parseInt(key) - 1;
                if (index < currentCard.mcqOptions.length) {
                    e.preventDefault();
                    const isCorrect = index === currentCard.correctOptionIndex;
                    submitAnswer(isCorrect, index);
                }
            }
        }

        // Keyboard shortcuts for True/False (a/b or 1/2)
        if (currentCard.questionType === 'truefalse' && answerState === 'idle') {
            const key = e.key.toLowerCase();
            if (key === 'a' || key === '1') {
                e.preventDefault();
                submitAnswer(true === currentCard.tfIsCorrect, 0);
            } else if (key === 'b' || key === '2') {
                e.preventDefault();
                submitAnswer(false === currentCard.tfIsCorrect, 1);
            }
        }

        // Keyboard shortcut for Flashcard (space to flip)
        if (currentCard.questionType === 'flashcard' && !isFlipped) {
            if (e.code === 'Space') {
                e.preventDefault();
                setIsFlipped(true);
            }
        }

        // Keyboard shortcuts for flashcard feedback (1 for didn't get it, 2 for got it)
        if (currentCard.questionType === 'flashcard' && isFlipped && answerState === 'idle') {
            const key = e.key;
            if (key === '1') {
                e.preventDefault();
                submitAnswer(false);
            } else if (key === '2') {
                e.preventDefault();
                submitAnswer(true);
            }
        }

        // Press any key to continue to next question
        if (answerState !== 'idle') {
            handleNext();
        }
    }, [sessionComplete, answerState, showExitPopup, showSettings, showEditModal, justSubmittedWritten, currentIndex, sessionQueue, isFlipped, submitAnswer, handleNext]);

    useSyncExternalStore(
        useCallback(() => {
            const handler = (e: KeyboardEvent) => handleKeyPress(e);
            window.addEventListener('keydown', handler);
            return () => window.removeEventListener('keydown', handler);
        }, [handleKeyPress]),
        () => null,
        () => null
    );

    // Get XP stats from store - must be called before any early returns
    const xpStats = useXPStore((state) => state.stats);
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";

    // Theme colors
    const bgColor = isSpooky ? "bg-[#0a0b0f]" : "bg-[#f0f0ea]";
    const textColor = isSpooky ? "text-purple-100" : "text-[#171d2b]";
    const textMuted = isSpooky ? "text-purple-300/50" : "text-[#171d2b]/50";
    const cardBg = isSpooky ? "bg-[#1a1b26]" : "bg-white";
    const cardBorder = isSpooky ? "border-purple-500/20" : "border-gray-100";
    const headerBg = isSpooky ? "bg-[#0d0e14] border-purple-500/20" : "bg-white border-gray-100";
    const buttonBg = isSpooky ? "bg-[#1a1b26] border-purple-500/30 text-purple-100" : "bg-white border-gray-200 text-[#171d2b]";
    const buttonHover = isSpooky ? "hover:bg-purple-900/30 hover:border-purple-400/50" : "hover:bg-gray-50";
    const inputBg = isSpooky ? "bg-[#1a1b26] border-purple-500/30 text-purple-100 placeholder:text-purple-300/40" : "bg-white border-gray-300 text-[#171d2b] placeholder:text-gray-400";

    if (isLoading) {
        return (
            <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
                <Loader2 size={32} className={`animate-spin ${isSpooky ? "text-purple-400" : "text-[#171d2b]/40"}`} />
            </div>
        );
    }

    if (sessionQueue.length === 0 && !sessionComplete) {
        return (
            <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
                <p className={textMuted}>{isSpooky ? "No dark spells found..." : "No flashcards found"}</p>
            </div>
        );
    }

    if (sessionComplete) {
        const total = sessionStats.correct + sessionStats.incorrect;

        // Map cards to ResultItem format
        const resultItems = cards.map(c => ({
            id: c.id,
            term: c.term,
            definition: c.definition,
            status: c.stage as 'new' | 'learning' | 'almost_done' | 'mastered'
        }));

        return (
            <SessionResultPage
                level={xpStats?.currentLevel || 1}
                currentXp={xpStats?.xpInLevel || 0}
                requiredXp={xpStats?.xpForNext || 100}
                xpEarned={sessionStats.xpGained}
                correctCount={sessionStats.correct}
                totalCount={total}
                items={resultItems}
                onContinue={restartSession}
                onExit={() => router.back()}
                showPressAnyKey={false}
            />
        );
    }

    const currentCard = sessionQueue[currentIndex];
    const frontContent = settings.frontSide === 'definition' ? currentCard.definition : currentCard.term;
    const backContent = settings.frontSide === 'definition' ? currentCard.term : currentCard.definition;

    const content = (
        <div className={`min-h-screen ${bgColor} flex flex-col pb-32 relative`}>
            <EncouragementToast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
            <ExitPopup
                isOpen={showExitPopup}
                onClose={() => setShowExitPopup(false)}
                onExit={() => { setShowExitPopup(false); router.back(); }}
                xpToLose={sessionStats.xpGained}
                currentLevel={xpStats?.currentLevel || 1}
                currentXp={xpStats?.xpInLevel || 0}
                maxXp={xpStats?.xpForNext || 100}
                nextLevel={(xpStats?.currentLevel || 1) + 1}
            />
            <StudySettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} onSave={handleSettingsSave} />

            {/* Edit Card Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className={`rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 ${isSpooky ? "bg-[#1a1b26] border border-purple-500/30" : "bg-white"}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`font-sora font-bold text-xl ${textColor}`}>{isSpooky ? "Edit Dark Spell" : "Edit Card"}</h2>
                            <button onClick={() => setShowEditModal(false)} className={`p-2 rounded-full ${isSpooky ? "hover:bg-purple-900/30 text-purple-300" : "hover:bg-gray-100"}`}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isSpooky ? "text-purple-300/70" : "text-[#171d2b]/70"}`}>{isSpooky ? "Incantation" : "Term"}</label>
                                <input
                                    type="text"
                                    value={editTerm}
                                    onChange={(e) => setEditTerm(e.target.value)}
                                    className={`w-full p-3 border rounded-xl focus:outline-none ${isSpooky ? "bg-[#0d0e14] border-purple-500/30 text-purple-100 focus:border-purple-400" : "border-gray-200 focus:border-[#171d2b]"}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isSpooky ? "text-purple-300/70" : "text-[#171d2b]/70"}`}>{isSpooky ? "Dark Knowledge" : "Definition"}</label>
                                <textarea
                                    value={editDefinition}
                                    onChange={(e) => setEditDefinition(e.target.value)}
                                    rows={4}
                                    className={`w-full p-3 border rounded-xl focus:outline-none resize-none ${isSpooky ? "bg-[#0d0e14] border-purple-500/30 text-purple-100 focus:border-purple-400" : "border-gray-200 focus:border-[#171d2b]"}`}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className={`flex-1 py-3 border rounded-xl font-medium ${isSpooky ? "border-purple-500/30 text-purple-300 hover:bg-purple-900/30" : "border-gray-200 hover:bg-gray-50"}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={isSavingEdit || !editTerm.trim() || !editDefinition.trim()}
                                className={`flex-1 py-3 rounded-xl font-medium disabled:opacity-50 ${isSpooky ? "bg-purple-600 text-white hover:bg-purple-500" : "bg-[#171d2b] text-white hover:bg-[#2a3347]"}`}
                            >
                                {isSavingEdit ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className={`border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10 ${headerBg}`}>
                <div className="flex items-center gap-4">
                    {/* Learn Mode button removed */}
                </div>

                <h1 className={`font-sora font-bold text-base sm:text-lg absolute left-1/2 transform -translate-x-1/2 truncate max-w-[40%] ${textColor}`}>
                    {isSpooky ? "Dark Study Session" : "DSA MIDTERMS"}
                </h1>

                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => setShowSettings(true)}
                        className={`px-3 sm:px-4 py-2 border rounded-full font-semibold text-xs sm:text-sm transition-colors shadow-sm ${buttonBg} ${buttonHover}`}
                    >
                        {isSpooky ? "Rituals" : "Options"}
                    </button>
                    <button
                        onClick={() => setShowExitPopup(true)}
                        className={`p-2 rounded-full transition-colors border shadow-sm ${isSpooky ? "border-purple-500/30 hover:bg-purple-900/30" : "border-gray-200 hover:bg-gray-100"}`}
                    >
                        <X size={20} className={isSpooky ? "text-purple-300" : "text-[#171d2b]"} />
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-8 flex flex-col items-center">

                {/* Progress Bar */}
                <div className="w-full max-w-3xl mb-4 sm:mb-8">
                    <AnimatedProgress value={currentIndex + 1} total={sessionQueue.length} />
                </div>

                {/* Question Card */}
                <div className={`w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-sm border p-4 sm:p-8 min-h-[200px] sm:min-h-[300px] flex flex-col relative mb-4 sm:mb-8 ${cardBg} ${cardBorder}`}>
                    <div className="flex justify-between items-start mb-4 sm:mb-6">
                        <span className={`text-xs sm:text-sm font-medium ${isSpooky ? "text-purple-400/70" : "text-gray-500"}`}>{isSpooky ? "Dark Knowledge" : "Definition"}</span>
                        <div className="flex items-center gap-2">
                            {currentCard.stage === 'new' && (
                                <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${isSpooky ? "bg-purple-900/50 text-purple-300" : "bg-pink-100 text-pink-600"}`}>
                                    <div className={`w-2 h-2 rounded-full border-2 ${isSpooky ? "border-purple-400" : "border-pink-600"}`} />
                                    {isSpooky ? "New spell" : "New cards"}
                                </span>
                            )}
                            <button
                                onClick={openEditModal}
                                className={`p-2 rounded-full ${isSpooky ? "hover:bg-purple-900/30 text-purple-400 hover:text-purple-300" : "hover:bg-gray-50 text-gray-400 hover:text-[#171d2b]"}`}
                            >
                                <Edit3 size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-start">
                        <p className={`text-base sm:text-xl font-sora font-medium leading-relaxed ${textColor}`}>
                            {frontContent}
                        </p>
                    </div>
                </div>

                {/* Answer Section */}
                <div className="w-full max-w-3xl">
                    {/* Feedback Message */}
                    {answerState !== 'idle' && (
                        <div className="mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {answerState === 'correct' ? (
                                <h3 className={`font-bold text-lg flex items-center gap-2 ${isSpooky ? "text-fuchsia-400" : "text-[#2D9F83]"}`}>
                                    {isSpooky ? "Dark magic flows through you..." : "Nice work! That’s some impressive stuff! "}
                                </h3>
                            ) : (
                                <h3 className={`font-bold text-lg flex items-center gap-2 ${isSpooky ? "text-purple-400" : "text-[#FF6B6B]"}`}>
                                    {isSpooky ? "The spirits demand more practice..." : "No worries, you are still learning."}
                                </h3>
                            )}
                        </div>
                    )}
                    {/* 🥳
                                </h3>
                            ) : (
                                <h3 className="text-[#FF6B6B] font-bold text-lg flex items-center gap-2">
                                    No worries, you’re still learning.
                                </h3>
                            )}
                        </div>
                    )}

                    CLEANUP_END */}

                    {/* MCQ */}
                    {currentCard.questionType === 'mcq' && (
                        <>
                            {answerState === 'idle' && <h3 className={`font-bold mb-4 ${textColor}`}>{isSpooky ? "Choose the matching incantation" : "Select the matching term"}</h3>}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                {currentCard.mcqOptions?.map((opt, i) => {
                                    const isCorrectOption = i === currentCard.correctOptionIndex;
                                    const isSelected = i === selectedOptionIndex;

                                    const letters = ['A', 'B', 'C', 'D'];
                                    let buttonStyle = isSpooky 
                                        ? "bg-[#1a1b26] border-purple-500/30 hover:border-purple-400/50 hover:shadow-purple-900/20 hover:shadow-md" 
                                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md";
                                    let numberStyle = isSpooky 
                                        ? "bg-purple-900/50 text-purple-300 group-hover:bg-purple-600 group-hover:text-white" 
                                        : "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white";
                                    let numberContent: React.ReactNode = letters[i];

                                    if (answerState !== 'idle') {
                                        if (isCorrectOption) {
                                            buttonStyle = isSpooky ? "bg-fuchsia-900/30 border-fuchsia-500/50" : "bg-[#E6F8F3] border-[#2D9F83]";
                                            numberStyle = isSpooky ? "bg-fuchsia-500 text-white" : "bg-[#2D9F83] text-white";
                                            numberContent = <Check size={16} strokeWidth={3} />;
                                        } else if (isSelected && answerState === 'incorrect') {
                                            buttonStyle = isSpooky ? "bg-purple-900/40 border-purple-400/50" : "bg-[#FFF0F0] border-[#FF6B6B]";
                                            numberStyle = isSpooky ? "bg-purple-500 text-white" : "bg-[#FF6B6B] text-white";
                                            numberContent = <X size={16} strokeWidth={3} />;
                                        } else {
                                            buttonStyle = isSpooky ? "bg-[#1a1b26] border-purple-500/10 opacity-50" : "bg-white border-gray-100 opacity-50";
                                            numberStyle = isSpooky ? "bg-purple-900/30 text-purple-500/50" : "bg-gray-100 text-gray-400";
                                        }
                                    }

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => submitAnswer(isCorrectOption, i)}
                                            disabled={answerState !== 'idle'}
                                            className={`group p-3 sm:p-4 border rounded-2xl transition-all text-left flex items-center gap-3 sm:gap-4 ${buttonStyle}`}
                                        >
                                            <div className={`w-8 h-8 min-w-[32px] rounded-full font-bold flex items-center justify-center text-sm transition-colors ${numberStyle}`}>
                                                {numberContent}
                                            </div>
                                            <span className={`font-medium text-base sm:text-lg break-words ${textColor}`}>{opt}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* True/False */}
                    {currentCard.questionType === 'truefalse' && (
                        <>
                            {answerState === 'idle' && (
                                <div className="mb-4">
                                    <h3 className={`font-bold mb-2 ${textColor}`}>{isSpooky ? "Is this the correct incantation?" : "Is this the correct term?"}</h3>
                                    <div className={`border rounded-xl p-4 ${isSpooky ? "bg-[#0d0e14] border-purple-500/30" : "bg-gray-50 border-gray-200"}`}>
                                        <span className={`text-xs block mb-1 ${isSpooky ? "text-purple-400/70" : "text-gray-500"}`}>{isSpooky ? "Incantation" : "Term"}</span>
                                        <p className={`text-lg font-semibold ${textColor}`}>{currentCard.tfDisplayedAnswer}</p>
                                    </div>
                                </div>
                            )}
                            {answerState !== 'idle' && (
                                <div className={`mb-4 border rounded-xl p-4 ${isSpooky ? "bg-[#0d0e14] border-purple-500/30" : "bg-gray-50 border-gray-200"}`}>
                                    <span className={`text-xs block mb-1 ${isSpooky ? "text-purple-400/70" : "text-gray-500"}`}>{isSpooky ? "Displayed Incantation" : "Displayed Term"}</span>
                                    <p className={`text-lg font-semibold ${textColor}`}>{currentCard.tfDisplayedAnswer}</p>
                                    {!currentCard.tfIsCorrect && (
                                        <div className={`mt-2 pt-2 border-t ${isSpooky ? "border-purple-500/20" : "border-gray-200"}`}>
                                            <span className={`text-xs block mb-1 ${isSpooky ? "text-purple-400/70" : "text-gray-500"}`}>{isSpooky ? "Correct Incantation" : "Correct Term"}</span>
                                            <p className="text-lg font-semibold text-[#2D9F83]">{backContent}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {[true, false].map((val, i) => {
                                    const isCorrectOption = val === currentCard.tfIsCorrect;
                                    const isSelected = (i === 0 && selectedOptionIndex === 0) || (i === 1 && selectedOptionIndex === 1);
                                    const optionIndex = i;
                                    const letters = ['A', 'B'];

                                    let buttonStyle = isSpooky 
                                        ? "bg-[#1a1b26] border-purple-500/30 hover:border-purple-400/50 hover:shadow-purple-900/20 hover:shadow-md" 
                                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md";
                                    let numberStyle = isSpooky 
                                        ? "bg-purple-900/50 text-purple-300 group-hover:bg-purple-600 group-hover:text-white" 
                                        : "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white";
                                    let numberContent: React.ReactNode = letters[i];

                                    if (answerState !== 'idle') {
                                        if (isCorrectOption) {
                                            buttonStyle = isSpooky ? "bg-green-900/30 border-green-500/50" : "bg-[#E6F8F3] border-[#2D9F83]";
                                            numberStyle = "bg-[#2D9F83] text-white";
                                            numberContent = <Check size={16} strokeWidth={3} />;
                                        } else if (isSelected && answerState === 'incorrect') {
                                            buttonStyle = isSpooky ? "bg-red-900/30 border-red-500/50" : "bg-[#FFF0F0] border-[#FF6B6B]";
                                            numberStyle = "bg-[#FF6B6B] text-white";
                                            numberContent = <X size={16} strokeWidth={3} />;
                                        } else {
                                            buttonStyle = isSpooky ? "bg-[#1a1b26] border-purple-500/10 opacity-50" : "bg-white border-gray-100 opacity-50";
                                            numberStyle = isSpooky ? "bg-purple-900/30 text-purple-500/50" : "bg-gray-100 text-gray-400";
                                        }
                                    }

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => submitAnswer(isCorrectOption, optionIndex)}
                                            disabled={answerState !== 'idle'}
                                            className={`group p-4 sm:p-6 border rounded-2xl transition-all text-left flex items-center gap-4 ${buttonStyle}`}
                                        >
                                            <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm transition-colors ${numberStyle}`}>
                                                {numberContent}
                                            </div>
                                            <span className={`font-medium text-base sm:text-lg ${textColor}`}>{val ? "True" : "False"}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Written */}
                    {currentCard.questionType === 'written' && (
                        <>
                            <h3 className={`font-bold mb-4 ${textColor}`}>{isSpooky ? "Cast your spell" : "Answer to the best of your ability"}</h3>
                            {!writtenSubmitted ? (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={writtenAnswer}
                                        onChange={(e) => setWrittenAnswer(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && writtenAnswer.trim() && handleWrittenSubmit()}
                                        placeholder={isSpooky ? "Whisper your incantation..." : "Type your answer and press Enter"}
                                        className={`w-full p-4 border rounded-2xl focus:outline-none text-lg ${inputBg} ${isSpooky ? "focus:border-purple-400" : "focus:border-[#171d2b]"}`}
                                        autoFocus
                                    />
                                    <div className="flex gap-3 justify-end">
                                        <button
                                            onClick={() => submitAnswer(false)}
                                            className={`px-6 py-3 font-bold rounded-xl transition-colors border ${buttonBg} ${buttonHover}`}
                                        >
                                            Skip
                                        </button>
                                        <button
                                            onClick={handleWrittenSubmit}
                                            disabled={!writtenAnswer.trim()}
                                            className={`px-8 py-3 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all ${isSpooky ? "bg-purple-600 hover:bg-purple-500" : "bg-[#171d2b] hover:bg-[#2a3347]"}`}
                                        >
                                            {isSpooky ? "Cast" : "Answer"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className={`border rounded-xl p-4 mb-3 ${isSpooky ? "bg-[#0d0e14] border-purple-500/30" : "bg-gray-50 border-gray-200"}`}>
                                        <span className={`text-xs block mb-1 ${isSpooky ? "text-purple-400/70" : "text-gray-500"}`}>{isSpooky ? "Your Incantation" : "Your Answer"}</span>
                                        <p className={`text-lg font-medium ${textColor}`}>{writtenAnswer}</p>
                                    </div>
                                    <div className={`p-6 rounded-2xl ${writtenCorrect 
                                        ? (isSpooky ? 'bg-green-900/30 border border-green-500/50' : 'bg-[#E6F8F3] border border-[#2D9F83]') 
                                        : (isSpooky ? 'bg-red-900/30 border border-red-500/50' : 'bg-[#FFF0F0] border border-[#FF6B6B]')}`}>
                                        <p className={`font-semibold text-lg ${writtenCorrect ? 'text-[#2D9F83]' : 'text-[#FF6B6B]'}`}>
                                            {writtenCorrect ? (isSpooky ? 'Spell mastered!' : 'Correct!') : (isSpooky ? 'Spell failed...' : 'Incorrect')}
                                        </p>
                                        <div className={`mt-3 pt-3 border-t ${isSpooky ? "border-purple-500/20" : "border-current/10"}`}>
                                            <span className={`text-xs block mb-1 ${isSpooky ? "text-purple-400/70" : "opacity-70"}`}>{isSpooky ? "Correct Incantation" : "Correct Answer"}</span>
                                            <p className={`font-bold text-lg ${textColor}`}>{backContent}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Flashcard */}
                    {currentCard.questionType === 'flashcard' && (
                        <div className="flex flex-col items-center">
                            {!isFlipped ? (
                                <button
                                    onClick={() => setIsFlipped(true)}
                                    className={`px-8 py-3 rounded-full border font-bold shadow-sm transition-all ${buttonBg} ${buttonHover}`}
                                >
                                    {isSpooky ? "Reveal the Secret" : "Show Answer"}
                                </button>
                            ) : (
                                <div className={`w-full rounded-3xl shadow-sm border p-8 text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-300 ${cardBg} ${cardBorder}`}>
                                    <span className={`text-sm font-medium block mb-4 ${isSpooky ? "text-purple-400/70" : "text-gray-500"}`}>{isSpooky ? "Incantation" : "Term"}</span>
                                    <p className={`text-xl font-sora font-medium mb-8 ${textColor}`}>{backContent}</p>

                                    {answerState === 'idle' && (
                                        <div className="flex justify-center gap-4">
                                            <button
                                                onClick={() => submitAnswer(false)}
                                                className={`px-8 py-3 rounded-xl border-2 font-bold transition-colors ${isSpooky ? "border-red-500/30 text-red-400 hover:bg-red-900/20" : "border-red-100 text-red-600 hover:bg-red-50"}`}
                                            >
                                                <X className="inline mr-2" size={18} />
                                                {isSpooky ? "Lost" : "Forgot"}
                                            </button>
                                            <button
                                                onClick={() => submitAnswer(true)}
                                                className={`px-8 py-3 rounded-xl border-2 font-bold transition-colors ${isSpooky ? "border-green-500/30 text-green-400 hover:bg-green-900/20" : "border-green-100 text-green-600 hover:bg-green-50"}`}
                                            >
                                                <Check className="inline mr-2" size={18} />
                                                {isSpooky ? "Mastered" : "Knew it"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Bottom Bar */}
            <AnimatePresence>
                {answerState !== 'idle' && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className={`fixed bottom-0 left-0 right-0 border-t p-3 sm:p-4 z-40 ${isSpooky ? "bg-[#0d0e14] border-purple-500/20 shadow-[0_-4px_20px_rgba(139,92,246,0.1)]" : "bg-white border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"}`}
                    >
                        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 relative">
                            <div className={`hidden md:block font-medium ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>
                                {isSpooky ? "Press any key to continue the ritual..." : "Press any key to continue"}
                            </div>

                            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto sm:ml-auto relative">
                                <button
                                    onClick={handleOverride}
                                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full border font-bold transition-colors text-sm sm:text-base ${isSpooky ? "border-purple-500/30 text-purple-300 hover:bg-purple-900/30" : "border-gray-200 text-[#171d2b] hover:bg-gray-50"}`}
                                >
                                    Override: I got it {answerState === 'correct' ? 'wrong' : 'right'}
                                </button>

                                <div className="relative">
                                    {/* Mascot - Sitting on top of button */}
                                    <div className="absolute -top-[44px] sm:-top-[54px] left-1/2 -translate-x-1/2 pointer-events-none z-20">
                                        {answerState === 'correct' ? (
                                            isSpooky ? <PumpkinIcon className="w-14 h-14 sm:w-[68px] sm:h-[68px] text-orange-400" /> : <HappyBirdMascot className="w-14 h-14 sm:w-[68px] sm:h-[68px]" />
                                        ) : (
                                            isSpooky ? <GhostIcon className="w-14 h-14 sm:w-[68px] sm:h-[68px] text-purple-300" /> : <SadBirdMascot className="w-14 h-14 sm:w-[68px] sm:h-[68px]" />
                                        )}
                                    </div>
                                    <button
                                        onClick={handleNext}
                                        className={`px-6 sm:px-8 py-2 sm:py-3 rounded-full text-white font-bold transition-colors flex items-center gap-2 relative z-10 text-sm sm:text-base ${
                                            isSpooky ? "bg-purple-600 hover:bg-purple-500" : "bg-[#2D9F83] hover:bg-[#258a70]"
                                        }`}
                                    >
                                        {isSpooky ? "Continue" : "Next"}
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    // Wrap with flashlight effect in spooky mode
    return (
        <DarkStudyMode enabled={isSpooky}>
            {content}
        </DarkStudyMode>
    );
}
