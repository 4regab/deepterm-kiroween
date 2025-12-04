import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type QuestionType = 'mcq' | 'truefalse' | 'written' | 'flashcard';
export type PracticeQuestionType = 'multipleChoice' | 'trueFalse' | 'fillBlank';

export interface StudySettings {
    cardsPerRound: number;
    frontSide: 'term' | 'definition';
    enabledQuestionTypes: QuestionType[];
    shuffleTerms: boolean;
    studyStarred: boolean;
    smartGrading: boolean;
    retypeAnswers: boolean;
    overrideWrong: boolean;
    autoNextAfterAnswer: boolean;
    autoNextDuration: number;
}

export interface SurvivalModeSettings {
    enabled: boolean;
    timePerQuestion: number; // seconds (default 10)
}

export interface PracticeSettings {
    cardCount: number | 'max';
    enabledQuestionTypes: PracticeQuestionType[];
    shuffleTerms: boolean;
    autoNextAfterAnswer: boolean;
    autoNextDuration: number;
    survivalMode: SurvivalModeSettings;
}

interface StudySettingsState {
    // Learn mode settings
    studySettings: StudySettings;
    // Practice mode settings
    practiceSettings: PracticeSettings;
    // Version counter to trigger re-renders when settings change
    settingsVersion: number;
    
    // Actions
    updateStudySettings: (settings: Partial<StudySettings>) => void;
    updatePracticeSettings: (settings: Partial<PracticeSettings>) => void;
    resetStudySettings: () => void;
    resetPracticeSettings: () => void;
}

const DEFAULT_STUDY_SETTINGS: StudySettings = {
    cardsPerRound: 7,
    frontSide: 'definition',
    enabledQuestionTypes: ['mcq', 'truefalse', 'written', 'flashcard'],
    shuffleTerms: false,
    studyStarred: false,
    smartGrading: true,
    retypeAnswers: true,
    overrideWrong: true,
    autoNextAfterAnswer: true,
    autoNextDuration: 2,
};

const DEFAULT_PRACTICE_SETTINGS: PracticeSettings = {
    cardCount: 'max',
    enabledQuestionTypes: ['multipleChoice', 'trueFalse', 'fillBlank'],
    shuffleTerms: true,
    autoNextAfterAnswer: true,
    autoNextDuration: 2,
    survivalMode: {
        enabled: false,
        timePerQuestion: 10,
    },
};

export const useStudySettingsStore = create<StudySettingsState>()(
    persist(
        (set) => ({
            studySettings: DEFAULT_STUDY_SETTINGS,
            practiceSettings: DEFAULT_PRACTICE_SETTINGS,
            settingsVersion: 0,

            updateStudySettings: (newSettings) => set((state) => ({
                studySettings: { ...state.studySettings, ...newSettings },
                settingsVersion: state.settingsVersion + 1,
            })),

            updatePracticeSettings: (newSettings) => set((state) => ({
                practiceSettings: { ...state.practiceSettings, ...newSettings },
                settingsVersion: state.settingsVersion + 1,
            })),

            resetStudySettings: () => set((state) => ({
                studySettings: DEFAULT_STUDY_SETTINGS,
                settingsVersion: state.settingsVersion + 1,
            })),

            resetPracticeSettings: () => set((state) => ({
                practiceSettings: DEFAULT_PRACTICE_SETTINGS,
                settingsVersion: state.settingsVersion + 1,
            })),
        }),
        {
            name: 'deepterm-study-settings',
            version: 1, // Increment when schema changes
            migrate: (persistedState, version) => {
                const state = persistedState as StudySettingsState;
                
                // Migration from version 0 (no survivalMode) to version 1
                if (version === 0 || !state.practiceSettings?.survivalMode) {
                    return {
                        ...state,
                        practiceSettings: {
                            ...DEFAULT_PRACTICE_SETTINGS,
                            ...state.practiceSettings,
                            survivalMode: DEFAULT_PRACTICE_SETTINGS.survivalMode,
                        },
                    };
                }
                
                return state;
            },
        }
    )
);

// Helper to get question type for stage (moved from utils)
export function getQuestionTypeForStage(
    stage: 'new' | 'learning' | 'almost_done' | 'mastered',
    enabledTypes: QuestionType[]
): QuestionType {
    const stageDefaults: Record<string, QuestionType> = {
        new: 'mcq',
        learning: 'truefalse',
        almost_done: 'written',
        mastered: 'flashcard',
    };

    const preferred = stageDefaults[stage];
    if (enabledTypes.includes(preferred)) return preferred;
    return enabledTypes[0] || 'mcq';
}
