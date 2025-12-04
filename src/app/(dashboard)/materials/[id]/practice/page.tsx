"use client";

import { useState, useCallback, useRef, useSyncExternalStore } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { FloatingOrb, EncouragementToast, AnimatedProgress, HappyBirdMascot, SadBirdMascot } from "@/components/EmotionalAssets";
import SessionResultPage from "@/components/SessionResultPage";
import ExitPopup from "@/components/ExitPopup";
import PracticeSettingsModal from "@/components/PracticeSettingsModal";
import { createClient } from "@/config/supabase/client";
import { useXPStore, useThemeStore, useStudySettingsStore } from "@/lib/stores";
import { addXP, recordStudyActivity, updateFlashcardStatus, XP_REWARDS } from "@/services/activity";
import { DarkStudyMode, GhostIcon, PumpkinIcon } from "@/components/SpookyTheme/FlashlightEffect";
import SurvivalModeOverlay, { SurvivalTimer } from "@/components/SurvivalModeOverlay";

type QuestionType = "multipleChoice" | "trueFalse" | "fillBlank";

type CardStatus = 'new' | 'learning' | 'review' | 'mastered';

interface FlashcardData {
    id: string;
    term: string;
    definition: string;
    status: CardStatus;
}

interface Question {
    id: string;
    type: QuestionType;
    question: string;
    options?: string[];
    correctAnswer: string;
    userAnswer?: string;
    isCorrect?: boolean;
    explanation?: string;
    // For true/false questions
    tfDisplayedTerm?: string;
    tfIsCorrectPairing?: boolean;
}

type Stage = "loading" | "config" | "generating" | "take" | "results";

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
    multipleChoice: "Multiple Choice",
    trueFalse: "True/False",
    fillBlank: "Fill in Blank",
};

function generateQuestionsFromCards(cards: FlashcardData[], types: QuestionType[], cardCount: number): Question[] {
    const questions: Question[] = [];
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    const selectedCards = shuffled.slice(0, cardCount);

    selectedCards.forEach((card, idx) => {
        const type = types[idx % types.length];
        
        if (type === 'trueFalse') {
            // True/False: Show definition, display a term, ask if it's correct
            const isCorrectPairing = Math.random() > 0.5;
            let displayedTerm: string;
            
            if (isCorrectPairing) {
                displayedTerm = card.term;
            } else {
                const others = cards.filter(c => c.id !== card.id);
                displayedTerm = others.length > 0 
                    ? others[Math.floor(Math.random() * others.length)].term 
                    : card.term;
            }
            
            questions.push({
                id: card.id,
                type,
                question: card.definition,
                correctAnswer: isCorrectPairing ? 'true' : 'false',
                tfDisplayedTerm: displayedTerm,
                tfIsCorrectPairing: isCorrectPairing,
            });
        } else if (type === 'fillBlank') {
            questions.push({
                id: card.id,
                type,
                question: `${card.definition.split(' ').slice(0, 3).join(' ')} _____ ${card.definition.split(' ').slice(-2).join(' ')}`,
                correctAnswer: card.term.toLowerCase(),
            });
        } else {
            // Multiple choice - show definition, ask for term (like learn mode)
            const others = cards.filter(c => c.id !== card.id).map(c => c.term);
            const wrongOptions = others.sort(() => Math.random() - 0.5).slice(0, 3);
            questions.push({
                id: card.id,
                type,
                question: card.definition,
                correctAnswer: card.term,
                options: [...wrongOptions, card.term].sort(() => Math.random() - 0.5),
            });
        }
    });

    return questions;
}

export default function PracticePage() {
    const router = useRouter();
    const params = useParams();
    const [flashcardData, setFlashcardData] = useState<FlashcardData[]>([]);
    const [stage, setStage] = useState<Stage>("loading");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [showSettings, setShowSettings] = useState(false);
    
    // Use Zustand store for settings - reactive updates
    const rawSettings = useStudySettingsStore((state) => state.practiceSettings);
    const settingsVersion = useStudySettingsStore((state) => state.settingsVersion);
    const [lastSettingsVersion, setLastSettingsVersion] = useState(settingsVersion);
    
    // Ensure survivalMode has defaults (handles migration from old persisted state)
    const settings = {
        ...rawSettings,
        survivalMode: rawSettings.survivalMode ?? { enabled: false, timePerQuestion: 10 },
    };

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
            const cards = data.map(c => ({ id: c.id, term: c.front, definition: c.back, status: (c.status || 'new') as CardStatus }));
            setFlashcardData(cards);
            // Show config screen first
            setStage("config");
            setShowSettings(true);
        } else {
            setStage("config");
        }
    }, [params.id]);

    useState(() => { fetchCards(); });
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [streak, setStreak] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showExitPopup, setShowExitPopup] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [finalXpEarned, setFinalXpEarned] = useState(0);
    
    // Survival mode state
    const [survivalTimeLeft, setSurvivalTimeLeft] = useState(0);
    const survivalTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [survivalEnded, setSurvivalEnded] = useState(false);
    
    // Rebuild questions when settings change during "take" stage (reactive)
    if (settingsVersion !== lastSettingsVersion && stage === "take" && flashcardData.length > 0) {
        setLastSettingsVersion(settingsVersion);
        const count = settings.cardCount === "max" ? flashcardData.length : settings.cardCount;
        const generated = generateQuestionsFromCards(flashcardData, settings.enabledQuestionTypes as QuestionType[], count);
        setQuestions(generated);
        setCurrentQuestionIndex(0);
        setShowAnswer(false);
        setStreak(0);
    }

    // Survival mode timer - runs when in take stage and survival mode is enabled
    const startSurvivalTimer = useCallback(() => {
        if (survivalTimerRef.current) {
            clearInterval(survivalTimerRef.current);
        }
        setSurvivalTimeLeft(settings.survivalMode.timePerQuestion);
        survivalTimerRef.current = setInterval(() => {
            setSurvivalTimeLeft(prev => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [settings.survivalMode.timePerQuestion]);

    // Handle survival mode time up - end session
    const handleSurvivalTimeUp = useCallback(() => {
        if (survivalTimerRef.current) {
            clearInterval(survivalTimerRef.current);
            survivalTimerRef.current = null;
        }
        setSurvivalEnded(true);
        
        // Calculate XP earned so far
        const correct = questions.filter(q => q.isCorrect).length;
        const xpEarned = correct * XP_REWARDS.FLASHCARD_CORRECT;
        setFinalXpEarned(xpEarned);
        
        const persistResults = async () => {
            if (xpEarned > 0) {
                await addXP(xpEarned);
                useXPStore.getState().fetchXPStats();
            }
            await recordStudyActivity({ quizzes: 1 });
        };
        persistResults();
        
        setStage("results");
    }, [questions]);

    // Start survival timer when entering take stage
    // Using a ref to track if we've started the timer for this session
    const survivalStartedRef = useRef(false);
    if (stage === "take" && settings.survivalMode.enabled && !survivalStartedRef.current && !showAnswer) {
        survivalStartedRef.current = true;
        startSurvivalTimer();
    }
    // Reset the ref when leaving take stage
    if (stage !== "take" && survivalStartedRef.current) {
        survivalStartedRef.current = false;
    }

    const handleSettingsSave = () => {
        // Settings already saved to store by modal
        setShowSettings(false);
        // Generate questions with settings
        setStage("generating");
        setTimeout(() => {
            const currentSettings = useStudySettingsStore.getState().practiceSettings;
            const count = currentSettings.cardCount === "max" ? flashcardData.length : currentSettings.cardCount;
            const generated = generateQuestionsFromCards(flashcardData, currentSettings.enabledQuestionTypes as QuestionType[], count);
            setQuestions(generated);
            setCurrentQuestionIndex(0);
            setShowAnswer(false);
            setStreak(0);
            setSurvivalEnded(false);
            // Initialize survival timer if enabled
            if (currentSettings.survivalMode.enabled) {
                setSurvivalTimeLeft(currentSettings.survivalMode.timePerQuestion);
            }
            setStage("take");
        }, 1500);
    };

    const handleSettingsClose = () => {
        setShowSettings(false);
        // If still in config stage (initial), go back
        if (stage === "config") {
            router.back();
        }
    };

    const nextQuestion = useCallback(() => {
        setShowAnswer(false);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            // Reset survival timer for next question
            if (settings.survivalMode.enabled) {
                setSurvivalTimeLeft(settings.survivalMode.timePerQuestion);
                startSurvivalTimer();
            }
        } else {
            // Stop survival timer
            if (survivalTimerRef.current) {
                clearInterval(survivalTimerRef.current);
                survivalTimerRef.current = null;
            }
            // Persist XP at moment of completion (not during render)
            const correct = questions.filter(q => q.isCorrect).length;
            const xpEarned = correct * XP_REWARDS.FLASHCARD_CORRECT;
            setFinalXpEarned(xpEarned);
            
            const persistResults = async () => {
                if (xpEarned > 0) {
                    await addXP(xpEarned);
                    useXPStore.getState().fetchXPStats();
                }
                await recordStudyActivity({ quizzes: 1 });
            };
            persistResults();
            
            setStage("results");
        }
    }, [currentQuestionIndex, questions, settings.survivalMode.enabled, settings.survivalMode.timePerQuestion, startSurvivalTimer]);

    const handleAnswer = useCallback(async (answer: string) => {
        // Stop survival timer when answering
        if (survivalTimerRef.current) {
            clearInterval(survivalTimerRef.current);
            survivalTimerRef.current = null;
        }
        
        const updated = [...questions];
        updated[currentQuestionIndex].userAnswer = answer;
        const current = updated[currentQuestionIndex];
        const isCorrect = current.type === "fillBlank"
            ? answer.toLowerCase().trim().includes(current.correctAnswer.toLowerCase().trim().split(" ")[0])
            : answer.toLowerCase() === current.correctAnswer.toLowerCase();
        updated[currentQuestionIndex].isCorrect = isCorrect;
        setQuestions(updated);
        setShowAnswer(true);

        // Update flashcard status in database
        const cardIndex = flashcardData.findIndex(c => c.id === current.id);
        if (cardIndex !== -1) {
            const card = flashcardData[cardIndex];
            const newStatus: CardStatus = isCorrect
                ? (card.status === 'new' ? 'learning' : card.status === 'learning' ? 'review' : 'mastered')
                : 'learning';
            await updateFlashcardStatus(card.id, newStatus);
            const updatedCards = [...flashcardData];
            updatedCards[cardIndex] = { ...card, status: newStatus };
            setFlashcardData(updatedCards);
        }

        if (isCorrect) {
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > 1 && newStreak % 3 === 0) {
                setToastMessage(`${newStreak} in a row!`);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        } else {
            setStreak(0);
        }

        // Auto next after configured duration if enabled
        if (settings.autoNextAfterAnswer) {
            let count = settings.autoNextDuration;
            const tick = () => {
                count--;
                if (count <= 0) {
                    nextQuestion();
                } else {
                    timerRef.current = setTimeout(tick, 1000);
                }
            };
            timerRef.current = setTimeout(tick, 1000);
        }
    }, [questions, currentQuestionIndex, flashcardData, streak, settings.autoNextAfterAnswer, settings.autoNextDuration, nextQuestion]);

    const startOver = () => {
        // Stop any existing survival timer
        if (survivalTimerRef.current) {
            clearInterval(survivalTimerRef.current);
            survivalTimerRef.current = null;
        }
        setSurvivalEnded(false);
        
        // Regenerate with current settings
        setStage("generating");
        setTimeout(() => {
            const count = settings.cardCount === "max" ? flashcardData.length : settings.cardCount;
            const generated = generateQuestionsFromCards(flashcardData, settings.enabledQuestionTypes as QuestionType[], count);
            setQuestions(generated);
            setCurrentQuestionIndex(0);
            setShowAnswer(false);
            setStreak(0);
            setFinalXpEarned(0);
            // Reset survival timer if enabled
            if (settings.survivalMode.enabled) {
                setSurvivalTimeLeft(settings.survivalMode.timePerQuestion);
            }
            setStage("take");
        }, 1500);
    };



    const calculateScore = () => {
        const correct = questions.filter(q => q.isCorrect).length;
        return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) };
    };

    const currentQuestion = questions[currentQuestionIndex];

    // Keyboard shortcuts handler
    const handleKeyPress = useCallback((e: KeyboardEvent) => {
        if (stage !== "take" || !currentQuestion || showAnswer) return;

        // MCQ shortcuts (1-4 for A-D)
        if (currentQuestion.type === "multipleChoice" && currentQuestion.options) {
            const key = e.key;
            if (['1', '2', '3', '4'].includes(key)) {
                const index = parseInt(key) - 1;
                if (index < currentQuestion.options.length) {
                    e.preventDefault();
                    handleAnswer(currentQuestion.options[index]);
                }
            }
        }

        // True/False shortcuts (a/b or 1/2)
        if (currentQuestion.type === "trueFalse") {
            const key = e.key.toLowerCase();
            if (key === 'a' || key === '1') {
                e.preventDefault();
                handleAnswer('true');
            } else if (key === 'b' || key === '2') {
                e.preventDefault();
                handleAnswer('false');
            }
        }

        // Fill blank - Enter to submit
        if (currentQuestion.type === "fillBlank") {
            if (e.key === 'Enter') {
                const input = (e.target as HTMLInputElement);
                if (input.value.trim()) {
                    e.preventDefault();
                    handleAnswer(input.value);
                }
            }
        }
    }, [stage, currentQuestion, showAnswer, handleAnswer]);

    useSyncExternalStore(
        useCallback(() => {
            const handler = (e: KeyboardEvent) => handleKeyPress(e);
            window.addEventListener('keydown', handler);
            return () => window.removeEventListener('keydown', handler);
        }, [handleKeyPress]),
        () => null,
        () => null
    );

    // Get XP stats from store
    const xpStats = useXPStore((state) => state.stats);
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";

    // Theme colors
    const bgColor = isSpooky ? "bg-[#0a0b0f]" : "bg-[#f0f0ea]";
    const cardBg = isSpooky ? "bg-[#1a1b26]" : "bg-white";
    const textColor = isSpooky ? "text-purple-100" : "text-[#171d2b]";
    const textMuted = isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60";
    const buttonBg = isSpooky ? "bg-[#1a1b26] border-purple-500/30 text-purple-100" : "bg-white border-gray-200 text-[#171d2b]";
    const buttonHover = isSpooky ? "hover:bg-purple-900/30" : "hover:bg-gray-50";

    // Results screen renders as full page
    if (stage === "results") {
        const score = calculateScore();

        // Only show incorrect answers
        const incorrectQuestions = questions.filter(q => !q.isCorrect);
        const resultItems = incorrectQuestions.map(q => {
            const fc = flashcardData.find(f => f.id === q.id);
            return {
                id: q.id,
                term: fc?.term || q.correctAnswer,
                definition: fc?.definition || q.question,
                status: 'incorrect' as 'new' | 'learning' | 'almost_done' | 'mastered' | 'incorrect'
            };
        });

        return (
            <SessionResultPage
                level={xpStats?.currentLevel || 1}
                currentXp={xpStats?.xpInLevel || 0}
                requiredXp={xpStats?.xpForNext || 100}
                xpEarned={finalXpEarned}
                correctCount={score.correct}
                totalCount={score.total}
                items={resultItems}
                onContinue={() => router.back()}
                onTryAgain={startOver}
                title={survivalEnded ? "Time's up! Session ended." : "Practice test complete, keep going!"}
                hideStudyProgress={true}
                continueButtonText="Exit"
            />
        );
    }

    if (stage === "loading") {
        return (
            <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
                <Loader2 size={32} className={`animate-spin ${isSpooky ? "text-purple-400" : "text-[#171d2b]/40"}`} />
            </div>
        );
    }

    const content = (
        <div className={`${settings.survivalMode.enabled ? "" : bgColor} min-h-screen flex justify-center relative z-10`}>
            <EncouragementToast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
            <main className="w-full max-w-[900px] px-4 sm:px-8 py-8 relative z-10">
                <AnimatePresence mode="wait">
                    {/* Config Screen - Shows settings modal */}
                    {stage === "config" && (
                        <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                            <PracticeSettingsModal
                                isOpen={showSettings}
                                onClose={handleSettingsClose}
                                onSave={handleSettingsSave}
                                totalCards={flashcardData.length}
                                currentSettings={settings}
                            />
                            <div className="mb-8"><FloatingOrb state="idle" /></div>
                            <h3 className="font-sora text-2xl font-bold text-[#171d2b] mb-2">Practice Test</h3>
                            <p className="text-[#171d2b]/60 mb-6">Configure your test settings</p>
                            <button
                                onClick={() => setShowSettings(true)}
                                className="px-8 py-3 bg-[#171d2b] text-white font-semibold rounded-xl hover:bg-[#2a3347] transition-colors"
                            >
                                Open Settings
                            </button>
                        </motion.div>
                    )}

                    {/* Generating Screen - Lazy Load Skeleton */}
                    {stage === "generating" && (
                        <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                            {/* Header skeleton */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                                <div className="w-32 h-6 bg-gray-200 rounded-lg animate-pulse" />
                                <div className="w-20 h-10 bg-gray-200 rounded-full animate-pulse" />
                            </div>
                            
                            {/* Progress bar skeleton */}
                            <div className={`w-full h-2 rounded-full animate-pulse ${isSpooky ? "bg-purple-900/30" : "bg-gray-200"}`} />
                            
                            {/* Question card skeleton */}
                            <div className={`rounded-3xl shadow-sm border p-8 min-h-[200px] ${cardBg} ${isSpooky ? "border-purple-500/20" : "border-gray-100"}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`w-36 h-4 rounded animate-pulse ${isSpooky ? "bg-purple-900/30" : "bg-gray-200"}`} />
                                    <div className={`w-24 h-6 rounded-full animate-pulse ${isSpooky ? "bg-purple-900/30" : "bg-gray-200"}`} />
                                </div>
                                <div className="space-y-3">
                                    <div className={`w-full h-5 rounded animate-pulse ${isSpooky ? "bg-purple-900/30" : "bg-gray-200"}`} />
                                    <div className={`w-3/4 h-5 rounded animate-pulse ${isSpooky ? "bg-purple-900/30" : "bg-gray-200"}`} />
                                </div>
                            </div>
                            
                            {/* Answer options skeleton */}
                            <div className="grid gap-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 ${isSpooky ? "border-purple-500/20 bg-[#1a1b26]" : "border-gray-200 bg-white"}`}>
                                        <div className={`w-8 h-8 rounded-full animate-pulse ${isSpooky ? "bg-purple-900/30" : "bg-gray-200"}`} />
                                        <div className={`flex-1 h-5 rounded animate-pulse ${isSpooky ? "bg-purple-900/30" : "bg-gray-200"}`} />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Take Test Screen */}
                    {stage === "take" && currentQuestion && (
                        <motion.div key="take" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`space-y-6 ${settings.survivalMode.enabled ? "survival-shake" : ""}`}>
                            {/* Survival Mode Overlay */}
                            <SurvivalModeOverlay
                                enabled={settings.survivalMode.enabled}
                                timeLeft={survivalTimeLeft}
                                maxTime={settings.survivalMode.timePerQuestion}
                                onTimeUp={handleSurvivalTimeUp}
                                isPaused={showAnswer || showSettings || showExitPopup}
                            />
                            <ExitPopup isOpen={showExitPopup} onClose={() => setShowExitPopup(false)} onExit={() => { setShowExitPopup(false); router.back(); }} xpToLose={questions.filter(q => q.isCorrect).length * XP_REWARDS.FLASHCARD_CORRECT} currentLevel={xpStats?.currentLevel || 1} currentXp={xpStats?.xpInLevel || 0} maxXp={xpStats?.xpForNext || 100} nextLevel={(xpStats?.currentLevel || 1) + 1} />
                            <PracticeSettingsModal
                                isOpen={showSettings}
                                onClose={handleSettingsClose}
                                onSave={handleSettingsSave}
                                totalCards={flashcardData.length}
                                currentSettings={settings}
                            />
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={() => setShowExitPopup(true)} className={`p-2 rounded-full transition-colors ${isSpooky ? "hover:bg-purple-900/30 text-purple-300" : "hover:bg-[#171d2b]/5"}`}><X size={24} /></button>
                                <div className="flex items-center gap-3">
                                    <span className={`font-sora font-semibold ${textColor}`}>
                                        {settings.survivalMode.enabled ? "Survival Mode" : (isSpooky ? "Dark Ritual" : "Practice Test")}
                                    </span>
                                    {/* Survival Timer Display */}
                                    {settings.survivalMode.enabled && !showAnswer && (
                                        <SurvivalTimer 
                                            timeLeft={survivalTimeLeft} 
                                            maxTime={settings.survivalMode.timePerQuestion}
                                            className="ml-2"
                                        />
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowSettings(true)}
                                    className={`px-3 sm:px-4 py-2 border rounded-full font-semibold text-xs sm:text-sm transition-colors shadow-sm ${buttonBg} ${buttonHover}`}
                                >
                                    {isSpooky ? "Rituals" : "Options"}
                                </button>
                            </div>
                            <AnimatedProgress value={currentQuestionIndex + 1} total={questions.length} color={settings.survivalMode.enabled ? "#ef4444" : (isSpooky ? "#a855f7" : "#171d2b")} />

                            {/* Question Card */}
                            <div className={`rounded-3xl shadow-sm border p-8 min-h-[200px] flex flex-col mb-6 ${cardBg} ${isSpooky ? "border-purple-500/20" : "border-gray-100"}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <span className={`text-sm font-medium ${isSpooky ? "text-purple-400/70" : "text-gray-500"}`}>{isSpooky ? "Spell" : "Question"} {currentQuestionIndex + 1} of {questions.length}</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${isSpooky ? "bg-purple-900/50 text-purple-300" : "bg-gray-100 text-[#171d2b]"}`}>{QUESTION_TYPE_LABELS[currentQuestion.type]}</span>
                                </div>
                                <h3 className={`font-sora text-xl font-medium leading-relaxed ${textColor}`}>{currentQuestion.question}</h3>
                            </div>

                            {/* Answer Section */}
                            <div className="flex-1">
                                {currentQuestion.type === "multipleChoice" && currentQuestion.options && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {currentQuestion.options.map((opt, i) => {
                                            const isSelected = currentQuestion.userAnswer === opt;
                                            const isCorrectAnswer = opt === currentQuestion.correctAnswer;

                                            let borderClass = isSpooky ? "border-purple-500/30" : "border-gray-200";
                                            let bgClass = isSpooky ? "bg-[#1a1b26]" : "bg-white";
                                            let textClass = textColor;

                                            if (showAnswer) {
                                                if (isCorrectAnswer) {
                                                    borderClass = isSpooky ? "border-fuchsia-500/50" : "border-green-500";
                                                    bgClass = isSpooky ? "bg-fuchsia-900/30" : "bg-green-50";
                                                    textClass = isSpooky ? "text-fuchsia-300" : "text-green-700";
                                                } else if (isSelected) {
                                                    borderClass = isSpooky ? "border-purple-400/50" : "border-red-500";
                                                    bgClass = isSpooky ? "bg-purple-900/40" : "bg-red-50";
                                                    textClass = isSpooky ? "text-purple-300" : "text-red-700";
                                                } else {
                                                    bgClass = isSpooky ? "bg-[#1a1b26]/50" : "bg-gray-50";
                                                    textClass = isSpooky ? "text-purple-400/50" : "text-gray-400";
                                                }
                                            } else if (isSelected) {
                                                borderClass = isSpooky ? "border-purple-500" : "border-[#171d2b]";
                                                bgClass = isSpooky ? "bg-purple-900/30" : "bg-gray-50";
                                            }

                                            return (
                                                <button key={i} onClick={() => !showAnswer && handleAnswer(opt)} disabled={showAnswer}
                                                    className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all flex items-center gap-4 ${borderClass} ${bgClass} ${textClass} hover:shadow-md`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${showAnswer && isCorrectAnswer 
                                                        ? (isSpooky ? "bg-fuchsia-500/30 text-fuchsia-300" : "bg-green-200 text-green-700") :
                                                        showAnswer && isSelected ? (isSpooky ? "bg-purple-500/30 text-purple-300" : "bg-red-200 text-red-700") :
                                                            isSpooky ? "bg-purple-900/50 text-purple-300" : "bg-blue-100 text-blue-600"
                                                        }`}>
                                                        {String.fromCharCode(65 + i)}
                                                    </div>
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                {currentQuestion.type === "trueFalse" && (
                                    <div className="space-y-4">
                                        {/* Show the term being asked about */}
                                        <div className={`border rounded-xl p-4 mb-4 ${isSpooky ? "bg-[#0d0e14] border-purple-500/30" : "bg-gray-50 border-gray-200"}`}>
                                            <span className={`text-xs block mb-1 ${isSpooky ? "text-purple-400/70" : "text-gray-500"}`}>{isSpooky ? "Is this the correct incantation?" : "Is this the correct term?"}</span>
                                            <p className={`text-lg font-semibold ${textColor}`}>{currentQuestion.tfDisplayedTerm}</p>
                                        </div>
                                        
                                        {/* Show correct term after answer if wrong */}
                                        {showAnswer && !currentQuestion.tfIsCorrectPairing && (
                                            <div className={`border rounded-xl p-4 mb-4 ${isSpooky ? "bg-fuchsia-900/30 border-fuchsia-500/30" : "bg-green-50 border-green-200"}`}>
                                                <span className={`text-xs block mb-1 ${isSpooky ? "text-fuchsia-300" : "text-green-600"}`}>{isSpooky ? "Correct Incantation" : "Correct Term"}</span>
                                                <p className={`text-lg font-semibold ${isSpooky ? "text-fuchsia-300" : "text-green-700"}`}>
                                                    {flashcardData.find(c => c.id === currentQuestion.id)?.term}
                                                </p>
                                            </div>
                                        )}
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            {["true", "false"].map((val, i) => {
                                                const isSelected = currentQuestion.userAnswer === val;
                                                const isCorrectAnswer = val === currentQuestion.correctAnswer;

                                                let borderClass = isSpooky ? "border-purple-500/30" : "border-gray-200";
                                                let bgClass = isSpooky ? "bg-[#1a1b26]" : "bg-white";
                                                let textClass = textColor;

                                                if (showAnswer) {
                                                    if (isCorrectAnswer) {
                                                        borderClass = isSpooky ? "border-fuchsia-500/50" : "border-green-500";
                                                        bgClass = isSpooky ? "bg-fuchsia-900/30" : "bg-green-50";
                                                        textClass = isSpooky ? "text-fuchsia-300" : "text-green-700";
                                                    } else if (isSelected) {
                                                        borderClass = isSpooky ? "border-purple-400/50" : "border-red-500";
                                                        bgClass = isSpooky ? "bg-purple-900/40" : "bg-red-50";
                                                        textClass = isSpooky ? "text-purple-300" : "text-red-700";
                                                    } else {
                                                        bgClass = isSpooky ? "bg-[#1a1b26]/50" : "bg-gray-50";
                                                        textClass = isSpooky ? "text-purple-400/50" : "text-gray-400";
                                                    }
                                                } else if (isSelected) {
                                                    borderClass = isSpooky ? "border-purple-500" : "border-[#171d2b]";
                                                    bgClass = isSpooky ? "bg-purple-900/30" : "bg-gray-50";
                                                }

                                                return (
                                                    <button key={val} onClick={() => !showAnswer && handleAnswer(val)} disabled={showAnswer}
                                                        className={`h-20 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-3 ${borderClass} ${bgClass} ${textClass} hover:shadow-md`}>
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${showAnswer && isCorrectAnswer 
                                                            ? (isSpooky ? "bg-fuchsia-500/30 text-fuchsia-300" : "bg-green-200 text-green-700") :
                                                            showAnswer && isSelected ? (isSpooky ? "bg-purple-500/30 text-purple-300" : "bg-red-200 text-red-700") :
                                                                isSpooky ? "bg-purple-900/50 text-purple-300" : (i === 0 ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600")
                                                            }`}>
                                                            {i + 1}
                                                        </div>
                                                        {val === "true" ? "True" : "False"}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {currentQuestion.type === "fillBlank" && (
                                    <div>
                                        <input type="text" placeholder={isSpooky ? "Whisper your incantation..." : "Type your answer..."} disabled={showAnswer} onKeyDown={e => { if (e.key === "Enter" && !showAnswer) handleAnswer((e.target as HTMLInputElement).value); }}
                                            className={`w-full p-4 rounded-xl border-2 focus:outline-none text-lg ${isSpooky ? "bg-[#1a1b26] border-purple-500/30 text-purple-100 placeholder:text-purple-400/40 focus:border-purple-400" : "border-gray-200 focus:border-[#171d2b] bg-white placeholder:text-gray-400"}`} />
                                        {!showAnswer && <p className={`text-xs mt-2 ml-1 ${isSpooky ? "text-purple-400/50" : "text-gray-400"}`}>Press Enter to submit</p>}
                                    </div>
                                )}
                            </div>

                            {/* Feedback Message */}
                            {showAnswer && (
                                <div className="mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {currentQuestion.isCorrect ? (
                                        <h3 className="text-[#2D9F83] font-bold text-lg flex items-center gap-2">
                                            Nice work! That&apos;s some impressive stuff!
                                        </h3>
                                    ) : (
                                        <h3 className="text-[#FF6B6B] font-bold text-lg flex items-center gap-2">
                                            No worries, you&apos;re still learning.
                                        </h3>
                                    )}
                                    {!currentQuestion.isCorrect && (
                                        <p className="text-[#171d2b]/80 text-sm mt-2">Correct answer: <span className="font-bold">{currentQuestion.correctAnswer}</span></p>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}


                </AnimatePresence>
            </main>

            {/* Bottom Bar with Bird Mascot */}
            <AnimatePresence>
                {stage === "take" && showAnswer && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className={`fixed bottom-0 left-0 right-0 border-t p-3 sm:p-4 z-40 ${isSpooky ? "bg-[#0d0e14] border-purple-500/20 shadow-[0_-4px_20px_rgba(139,92,246,0.1)]" : "bg-white border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"}`}
                    >
                        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 relative">
                            <div className={`hidden md:block font-medium ${textMuted}`}>
                                {currentQuestion.isCorrect 
                                    ? (isSpooky ? "Dark magic mastered!" : "Great job!") 
                                    : (isSpooky ? "The spirits demand more practice..." : "Keep practicing!")}
                            </div>

                            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto sm:ml-auto relative">
                                <div className="relative">
                                    {/* Mascot - Sitting on top of button */}
                                    <div className="absolute -top-[44px] sm:-top-[54px] left-1/2 -translate-x-1/2 pointer-events-none z-20">
                                        {currentQuestion.isCorrect ? (
                                            isSpooky ? <PumpkinIcon className="w-14 h-14 sm:w-[68px] sm:h-[68px] text-orange-400" /> : <HappyBirdMascot className="w-14 h-14 sm:w-[68px] sm:h-[68px]" />
                                        ) : (
                                            isSpooky ? <GhostIcon className="w-14 h-14 sm:w-[68px] sm:h-[68px] text-purple-300" /> : <SadBirdMascot className="w-14 h-14 sm:w-[68px] sm:h-[68px]" />
                                        )}
                                    </div>
                                    <button
                                        onClick={nextQuestion}
                                        className={`px-6 sm:px-8 py-2 sm:py-3 rounded-full text-white font-bold transition-colors flex items-center gap-2 relative z-10 text-sm sm:text-base ${isSpooky ? "bg-purple-600 hover:bg-purple-500" : "bg-[#2D9F83] hover:bg-[#258a70]"}`}
                                    >
                                        {currentQuestionIndex === questions.length - 1 ? "See Results" : "Next"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    // DarkStudyMode (pitch black room) conditions:
    // - Only enabled in spooky theme
    // - Only during "take" stage (not config/generating/results)
    // - Disabled when survival mode is enabled (survival has its own effects)
    const isDarkModeActive = isSpooky && stage === "take" && !settings.survivalMode.enabled;

    return (
        <DarkStudyMode enabled={isDarkModeActive}>
            {content}
        </DarkStudyMode>
    );
}
