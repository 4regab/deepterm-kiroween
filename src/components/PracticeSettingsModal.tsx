"use client";

import { useState } from "react";
import { X, HelpCircle, Skull, Clock } from "lucide-react";
import { useThemeStore, useStudySettingsStore } from "@/lib/stores";
import type { PracticeSettings, PracticeQuestionType } from "@/lib/stores";

export type { PracticeQuestionType, PracticeSettings };

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: PracticeSettings) => void;
    totalCards: number;
    currentSettings?: PracticeSettings; // Optional - store is source of truth
}

const QUESTION_TYPE_LABELS: Record<PracticeQuestionType, string> = {
    multipleChoice: "Multiple Choice",
    trueFalse: "True / False",
    fillBlank: "Fill in Blank",
};

const Toggle = ({ checked, onChange, isSpooky }: { checked: boolean; onChange: () => void; isSpooky?: boolean }) => (
    <button
        onClick={onChange}
        className={`w-12 h-6 rounded-full transition-colors relative ${checked ? (isSpooky ? "bg-purple-600" : "bg-[#171d2b]") : (isSpooky ? "bg-purple-900/50" : "bg-gray-300")}`}
    >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? "left-7" : "left-1"}`} />
    </button>
);

const SectionHeader = ({ title, helpText, isSpooky }: { title: string; helpText?: string; isSpooky?: boolean }) => (
    <div className="flex items-center gap-2 mb-4">
        <h3 className={`font-sora font-semibold text-sm ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{title}</h3>
        {helpText && <HelpCircle size={14} className={isSpooky ? "text-purple-400/50" : "text-gray-400"} />}
    </div>
);

// Default survival mode settings for migration
const DEFAULT_SURVIVAL_MODE = { enabled: false, timePerQuestion: 10 };

export default function PracticeSettingsModal({ isOpen, onClose, onSave, totalCards }: Props) {
    const storeSettings = useStudySettingsStore((state) => state.practiceSettings);
    const updatePracticeSettings = useStudySettingsStore((state) => state.updatePracticeSettings);
    
    // Ensure survivalMode has defaults (handles migration from old persisted state)
    const safeStoreSettings: PracticeSettings = {
        ...storeSettings,
        survivalMode: storeSettings.survivalMode ?? DEFAULT_SURVIVAL_MODE,
    };
    
    const [settings, setSettings] = useState<PracticeSettings>(safeStoreSettings);
    const [wasOpen, setWasOpen] = useState(false);
    const theme = useThemeStore((state) => state.theme);
    const isSpooky = theme === "spooky";

    // Sync local state when modal opens (not continuously during render)
    if (isOpen && !wasOpen) {
        setWasOpen(true);
        setSettings({
            ...storeSettings,
            survivalMode: storeSettings.survivalMode ?? DEFAULT_SURVIVAL_MODE,
        });
    } else if (!isOpen && wasOpen) {
        setWasOpen(false);
    }

    if (!isOpen) return null;

    // Theme colors
    const modalBg = isSpooky ? "bg-[#1a1b26] border border-purple-500/30" : "bg-white";
    const headerBorder = isSpooky ? "border-purple-500/20" : "border-gray-100";
    const textColor = isSpooky ? "text-purple-100" : "text-[#171d2b]";
    const textMuted = isSpooky ? "text-purple-300/80" : "text-[#171d2b]/80";
    const inputBg = isSpooky ? "bg-[#0d0e14] border-purple-500/30 text-purple-100" : "border-gray-200";
    const buttonBg = isSpooky ? "bg-purple-600 hover:bg-purple-500" : "bg-[#171d2b] hover:bg-[#2a3347]";

    const handleToggleType = (type: PracticeQuestionType) => {
        const current = settings.enabledQuestionTypes;
        const updated = current.includes(type)
            ? current.filter(t => t !== type)
            : [...current, type];

        if (updated.length === 0) return;
        setSettings(prev => ({ ...prev, enabledQuestionTypes: updated }));
    };

    const handleSave = () => {
        updatePracticeSettings(settings);
        onSave(settings);
        // Don't call onClose here - parent handles closing after processing save
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className={`rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden ${modalBg}`}>
                <div className={`flex items-center justify-between p-6 border-b ${headerBorder}`}>
                    <h2 className={`font-sora font-bold text-xl ${textColor}`}>{isSpooky ? "Dark Ritual Settings" : "Practice Options"}</h2>
                    <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isSpooky ? "hover:bg-purple-900/30 text-purple-300" : "hover:bg-gray-100"}`}>
                        <X size={20} className={textColor} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* General Section */}
                    <div>
                        <SectionHeader title={isSpooky ? "Ritual Parameters" : "General"} isSpooky={isSpooky} />
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium flex items-center gap-2 ${textMuted}`}>
                                    {isSpooky ? "Number of Spells" : "Number of Questions"} <HelpCircle size={14} className={isSpooky ? "text-purple-400/50" : "text-gray-400"} />
                                </span>
                                <select
                                    value={settings.cardCount}
                                    onChange={(e) => setSettings(prev => ({ 
                                        ...prev, 
                                        cardCount: e.target.value === "max" ? "max" : Number(e.target.value) 
                                    }))}
                                    className={`p-2 border rounded-lg text-sm focus:outline-none ${inputBg} ${isSpooky ? "focus:border-purple-400" : "focus:border-[#171d2b]"}`}
                                >
                                    <option value="max">All ({totalCards})</option>
                                    {[5, 10, 15, 20, 25, 30].filter(n => n <= totalCards).map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Question Types */}
                    <div>
                        <SectionHeader title={isSpooky ? "Spell Types" : "Question Types"} isSpooky={isSpooky} />
                        <div className="space-y-3">
                            {(Object.keys(QUESTION_TYPE_LABELS) as PracticeQuestionType[]).map(type => (
                                <div key={type} className="flex items-center justify-between">
                                    <span className={`text-sm font-medium ${textMuted}`}>{QUESTION_TYPE_LABELS[type]}</span>
                                    <Toggle
                                        checked={settings.enabledQuestionTypes.includes(type)}
                                        onChange={() => handleToggleType(type)}
                                        isSpooky={isSpooky}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Practice Options */}
                    <div>
                        <SectionHeader title={isSpooky ? "Ritual Options" : "Practice Options"} isSpooky={isSpooky} />
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium ${textMuted}`}>{isSpooky ? "Shuffle incantations" : "Shuffle terms"}</span>
                                <Toggle
                                    checked={settings.shuffleTerms}
                                    onChange={() => setSettings(prev => ({ ...prev, shuffleTerms: !prev.shuffleTerms }))}
                                    isSpooky={isSpooky}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium flex items-center gap-2 ${textMuted}`}>
                                    {isSpooky ? "Auto continue ritual" : "Auto next after answer"} <HelpCircle size={14} className={isSpooky ? "text-purple-400/50" : "text-gray-400"} />
                                </span>
                                <Toggle
                                    checked={settings.autoNextAfterAnswer}
                                    onChange={() => setSettings(prev => ({ ...prev, autoNextAfterAnswer: !prev.autoNextAfterAnswer }))}
                                    isSpooky={isSpooky}
                                />
                            </div>
                            {settings.autoNextAfterAnswer && (
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm font-medium ${textMuted}`}>{isSpooky ? "Delay (seconds)" : "Duration (seconds)"}</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={settings.autoNextDuration}
                                        onChange={(e) => {
                                            const val = Math.max(1, Math.min(5, Number(e.target.value) || 1));
                                            setSettings(prev => ({ ...prev, autoNextDuration: val }));
                                        }}
                                        className={`w-20 px-3 py-2 border rounded-lg text-sm focus:outline-none ${inputBg} ${isSpooky ? "focus:border-purple-400" : "focus:border-[#171d2b]"}`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Survival Mode */}
                    <div>
                        <SectionHeader title="Survival Mode" isSpooky={isSpooky} />
                        <div className={`rounded-xl p-4 mb-4 ${isSpooky ? "bg-red-950/30 border border-red-500/30" : "bg-red-50 border border-red-200"}`}>
                            <div className="flex items-start gap-3">
                                <Skull size={20} className={isSpooky ? "text-red-400 mt-0.5" : "text-red-500 mt-0.5"} />
                                <div>
                                    <p className={`text-sm font-medium ${isSpooky ? "text-red-300" : "text-red-700"}`}>
                                        Race against time
                                    </p>
                                    <p className={`text-xs mt-1 ${isSpooky ? "text-red-400/70" : "text-red-600/70"}`}>
                                        Answer before time runs out or your session ends. The pressure is real.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium flex items-center gap-2 ${textMuted}`}>
                                    <Skull size={14} className={settings.survivalMode.enabled ? (isSpooky ? "text-red-400" : "text-red-500") : ""} />
                                    Enable Survival Mode
                                </span>
                                <Toggle
                                    checked={settings.survivalMode.enabled}
                                    onChange={() => setSettings(prev => ({ 
                                        ...prev, 
                                        survivalMode: { ...prev.survivalMode, enabled: !prev.survivalMode.enabled }
                                    }))}
                                    isSpooky={isSpooky}
                                />
                            </div>
                            {settings.survivalMode.enabled && (
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm font-medium flex items-center gap-2 ${textMuted}`}>
                                        <Clock size={14} />
                                        Time per question
                                    </span>
                                    <select
                                        value={settings.survivalMode.timePerQuestion}
                                        onChange={(e) => setSettings(prev => ({ 
                                            ...prev, 
                                            survivalMode: { ...prev.survivalMode, timePerQuestion: Number(e.target.value) }
                                        }))}
                                        className={`p-2 border rounded-lg text-sm focus:outline-none ${inputBg} ${isSpooky ? "focus:border-purple-400" : "focus:border-[#171d2b]"}`}
                                    >
                                        <option value={5}>5 seconds</option>
                                        <option value={10}>10 seconds</option>
                                        <option value={15}>15 seconds</option>
                                        <option value={20}>20 seconds</option>
                                        <option value={30}>30 seconds</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={`p-6 border-t flex items-center justify-end ${headerBorder} ${isSpooky ? "bg-[#1a1b26]" : "bg-white"}`}>
                    <button
                        onClick={handleSave}
                        className={`px-8 py-3 text-white font-semibold rounded-xl transition-colors text-sm ${buttonBg}`}
                    >
                        {isSpooky ? "Begin Ritual" : "Save options"}
                    </button>
                </div>
            </div>
        </div>
    );
}
