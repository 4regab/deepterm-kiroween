"use client";

import { useState } from "react";
import { X, HelpCircle } from "lucide-react";
import { useThemeStore, useStudySettingsStore } from "@/lib/stores";
import type { StudySettings, QuestionType } from "@/lib/stores";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: StudySettings) => void;
}

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
    mcq: 'Multiple Choice',
    truefalse: 'True / False',
    written: 'Written',
    flashcard: 'Flashcard',
};

const SPOOKY_QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
    mcq: 'Dark Choice',
    truefalse: 'Truth or Lies',
    written: 'Inscribed',
    flashcard: 'Spell Card',
};

// Help text descriptions for each option
const HELP_TEXTS: Record<string, string> = {
    lengthOfRounds: "Number of cards to study in each round before showing progress",
    answerWithTerm: "Show the definition and ask you to recall the term",
    answerWithDefinition: "Show the term and ask you to recall the definition",
    smartGrading: "Accept answers that are close but not exact matches (typos, minor differences)",
    retypeAnswers: "When you get an answer wrong, you'll need to type the correct answer to continue",
    autoNext: "Automatically move to the next question after answering",
    flashlightMode: "Creates a dark overlay where only the area around your cursor is visible",
};

// Moved outside component to avoid "creating components during render" error
const Toggle = ({ checked, onChange, isSpooky }: { checked: boolean; onChange: () => void; isSpooky?: boolean }) => (
    <button
        onClick={onChange}
        className={`w-12 h-6 rounded-full transition-colors relative ${
            checked 
                ? (isSpooky ? 'bg-purple-600' : 'bg-[#171d2b]') 
                : (isSpooky ? 'bg-purple-900/50' : 'bg-gray-300')
        }`}
    >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'left-7' : 'left-1'}`} />
    </button>
);

// Tooltip component with click to show/hide
const HelpTooltip = ({ text, isSpooky }: { text: string; isSpooky?: boolean }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    return (
        <div className="relative inline-flex">
            <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                onBlur={() => setTimeout(() => setIsVisible(false), 150)}
                className={`p-0.5 rounded-full transition-colors ${
                    isSpooky 
                        ? "text-purple-400/40 hover:text-purple-300 hover:bg-purple-500/20" 
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
            >
                <HelpCircle size={14} />
            </button>
            {isVisible && (
                <div className={`absolute z-50 left-6 top-0 w-56 p-2.5 rounded-lg shadow-lg text-xs leading-relaxed ${
                    isSpooky 
                        ? "bg-purple-900 text-purple-100 border border-purple-500/30" 
                        : "bg-gray-800 text-white"
                }`}>
                    {text}
                    <div className={`absolute left-[-6px] top-2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ${
                        isSpooky ? "border-r-[6px] border-r-purple-900" : "border-r-[6px] border-r-gray-800"
                    }`} />
                </div>
            )}
        </div>
    );
};

const SectionHeader = ({ title, isSpooky }: { title: string; isSpooky?: boolean }) => (
    <div className="flex items-center gap-2 mb-4">
        <h3 className={`font-sora font-semibold text-sm ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{title}</h3>
    </div>
);

export default function StudySettingsModal({ isOpen, onClose, onSave }: Props) {
    const storeSettings = useStudySettingsStore((state) => state.studySettings);
    const updateStudySettings = useStudySettingsStore((state) => state.updateStudySettings);
    const resetStudySettings = useStudySettingsStore((state) => state.resetStudySettings);
    const [settings, setSettings] = useState<StudySettings>(storeSettings);
    const [wasOpen, setWasOpen] = useState(false);
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";

    // Sync local state when modal opens (not during render)
    if (isOpen && !wasOpen) {
        setWasOpen(true);
        setSettings(storeSettings);
    } else if (!isOpen && wasOpen) {
        setWasOpen(false);
    }

    if (!isOpen) return null;

    const handleToggleType = (type: QuestionType) => {
        const current = settings.enabledQuestionTypes;
        const updated = current.includes(type)
            ? current.filter(t => t !== type)
            : [...current, type];

        if (updated.length === 0) return;
        setSettings(prev => ({ ...prev, enabledQuestionTypes: updated }));
    };

    const handleSave = () => {
        updateStudySettings(settings);
        onSave(settings);
        onClose();
    };

    const handleReset = () => {
        resetStudySettings();
        setSettings(useStudySettingsStore.getState().studySettings);
    };

    const textColor = isSpooky ? "text-purple-200/80" : "text-[#171d2b]/80";
    const labels = isSpooky ? SPOOKY_QUESTION_TYPE_LABELS : QUESTION_TYPE_LABELS;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className={`rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden ${
                isSpooky ? "bg-[#151821] border border-purple-500/20" : "bg-white"
            }`}>
                <div className={`flex items-center justify-between p-6 border-b ${isSpooky ? "border-purple-500/10" : "border-gray-100"}`}>
                    <h2 className={`font-sora font-bold text-xl ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
                        {isSpooky ? "Dark Ritual Settings" : "Learn Options"}
                    </h2>
                    <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isSpooky ? "hover:bg-purple-500/10" : "hover:bg-gray-100"}`}>
                        <X size={20} className={isSpooky ? "text-purple-400" : "text-[#171d2b]"} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* General Section */}
                    <div>
                        <SectionHeader title={isSpooky ? "Ritual Settings" : "General"} isSpooky={isSpooky} />
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium flex items-center gap-2 ${textColor}`}>
                                    {isSpooky ? "Spells per Round" : "Length of Rounds"} <HelpTooltip text={HELP_TEXTS.lengthOfRounds} isSpooky={isSpooky} />
                                </span>
                                <select
                                    value={settings.cardsPerRound}
                                    onChange={(e) => setSettings(prev => ({ ...prev, cardsPerRound: Number(e.target.value) }))}
                                    className={`p-2 border rounded-lg text-sm focus:outline-none ${
                                        isSpooky ? "bg-[#0d0f14] border-purple-500/20 text-purple-100 focus:border-purple-500" : "border-gray-200 focus:border-[#171d2b]"
                                    }`}
                                >
                                    {[5, 7, 10, 15, 20, 25, 30].map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Question Types */}
                    <div>
                        <SectionHeader title={isSpooky ? "Incantation Types" : "Question Types"} isSpooky={isSpooky} />
                        <div className="space-y-3">
                            {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map(type => (
                                <div key={type} className="flex items-center justify-between">
                                    <span className={`text-sm font-medium ${textColor}`}>{labels[type]}</span>
                                    <Toggle
                                        checked={settings.enabledQuestionTypes.includes(type)}
                                        onChange={() => handleToggleType(type)}
                                        isSpooky={isSpooky}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Question Format */}
                    <div>
                        <SectionHeader title={isSpooky ? "Spell Format" : "Question Format"} isSpooky={isSpooky} />
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium flex items-center gap-2 ${textColor}`}>
                                    {isSpooky ? "Answer with Incantation" : "Answer with Term"} <HelpTooltip text={HELP_TEXTS.answerWithTerm} isSpooky={isSpooky} />
                                </span>
                                <Toggle
                                    checked={settings.frontSide === 'definition'}
                                    onChange={() => setSettings(prev => ({ ...prev, frontSide: 'definition' }))}
                                    isSpooky={isSpooky}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium flex items-center gap-2 ${textColor}`}>
                                    {isSpooky ? "Answer with Dark Knowledge" : "Answer with Definition"} <HelpTooltip text={HELP_TEXTS.answerWithDefinition} isSpooky={isSpooky} />
                                </span>
                                <Toggle
                                    checked={settings.frontSide === 'term'}
                                    onChange={() => setSettings(prev => ({ ...prev, frontSide: 'term' }))}
                                    isSpooky={isSpooky}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Learning Options */}
                    <div>
                        <SectionHeader title={isSpooky ? "Ritual Options" : "Learning Options"} isSpooky={isSpooky} />
                        <div className="space-y-3">
                            {isSpooky && (
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm font-medium flex items-center gap-2 ${textColor}`}>
                                        Flashlight Mode <HelpTooltip text={HELP_TEXTS.flashlightMode} isSpooky={isSpooky} />
                                    </span>
                                    <Toggle
                                        checked={settings.darkStudyMode}
                                        onChange={() => setSettings(prev => ({ ...prev, darkStudyMode: !prev.darkStudyMode }))}
                                        isSpooky={isSpooky}
                                    />
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium ${textColor}`}>{isSpooky ? "Shuffle spells" : "Shuffle terms"}</span>
                                <Toggle
                                    checked={settings.shuffleTerms}
                                    onChange={() => setSettings(prev => ({ ...prev, shuffleTerms: !prev.shuffleTerms }))}
                                    isSpooky={isSpooky}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium flex items-center gap-2 ${textColor}`}>
                                    {isSpooky ? "Dark grading" : "Smart grading"} <HelpTooltip text={HELP_TEXTS.smartGrading} isSpooky={isSpooky} />
                                </span>
                                <Toggle
                                    checked={settings.smartGrading}
                                    onChange={() => setSettings(prev => ({ ...prev, smartGrading: !prev.smartGrading }))}
                                    isSpooky={isSpooky}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium flex items-center gap-2 ${textColor}`}>
                                    {isSpooky ? "Re-inscribe answers" : "Re-type answers"} <HelpTooltip text={HELP_TEXTS.retypeAnswers} isSpooky={isSpooky} />
                                </span>
                                <Toggle
                                    checked={settings.retypeAnswers}
                                    onChange={() => setSettings(prev => ({ ...prev, retypeAnswers: !prev.retypeAnswers }))}
                                    isSpooky={isSpooky}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium ${textColor}`}>{isSpooky ? "Override failed spells" : "Allow override wrong answers"}</span>
                                <Toggle
                                    checked={settings.overrideWrong}
                                    onChange={() => setSettings(prev => ({ ...prev, overrideWrong: !prev.overrideWrong }))}
                                    isSpooky={isSpooky}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium flex items-center gap-2 ${textColor}`}>
                                    {isSpooky ? "Auto-proceed after cast" : "Auto next after answer"} <HelpTooltip text={HELP_TEXTS.autoNext} isSpooky={isSpooky} />
                                </span>
                                <Toggle
                                    checked={settings.autoNextAfterAnswer}
                                    onChange={() => setSettings(prev => ({ ...prev, autoNextAfterAnswer: !prev.autoNextAfterAnswer }))}
                                    isSpooky={isSpooky}
                                />
                            </div>
                            {settings.autoNextAfterAnswer && (
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm font-medium ${textColor}`}>{isSpooky ? "Delay (seconds)" : "Duration (seconds)"}</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={settings.autoNextDuration}
                                        onChange={(e) => {
                                            const val = Math.max(1, Math.min(5, Number(e.target.value) || 1));
                                            setSettings(prev => ({ ...prev, autoNextDuration: val }));
                                        }}
                                        className={`w-20 px-3 py-2 border rounded-lg text-sm focus:outline-none ${
                                            isSpooky ? "bg-[#0d0f14] border-purple-500/20 text-purple-100 focus:border-purple-500" : "border-gray-200 focus:border-[#171d2b]"
                                        }`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={`p-6 border-t flex items-center justify-between ${
                    isSpooky ? "border-purple-500/10 bg-[#151821]" : "border-gray-100 bg-white"
                }`}>
                    <button
                        onClick={handleReset}
                        className={`px-6 py-3 font-semibold border rounded-xl transition-colors text-sm ${
                            isSpooky ? "text-red-400 border-red-500/30 hover:bg-red-900/20" : "text-red-500 border-red-200 hover:bg-red-50"
                        }`}
                    >
                        {isSpooky ? "Reset & restart ritual" : "Reset progress & restart"}
                    </button>
                    <button
                        onClick={handleSave}
                        className={`px-8 py-3 text-white font-semibold rounded-xl transition-colors text-sm ${
                            isSpooky ? "bg-purple-600 hover:bg-purple-500" : "bg-[#171d2b] hover:bg-[#2a3347]"
                        }`}
                    >
                        {isSpooky ? "Seal settings" : "Save options"}
                    </button>
                </div>
            </div>
        </div>
    );
}
