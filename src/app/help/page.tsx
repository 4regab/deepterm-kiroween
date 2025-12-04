"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Rocket,
  FileText,
  BrainCircuit,
  Zap,
  Timer,
  Mail,
  ArrowRight,
  ChevronDown,
  Settings,
  Trophy,
  Calendar,
  TrendingUp,
  GraduationCap,
  Palette,
  Keyboard,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PublicPageWrapper } from "@/components/SpookyTheme";
import { useThemeStore } from "@/lib/stores";

interface FAQItem {
  question: string;
  answer: string;
}

interface CategoryContent {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  content: string;
  features?: string[];
  steps?: { title: string; description: string }[];
  faqs: FAQItem[];
}

const categories: CategoryContent[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Rocket,
    description: "Learn the basics of DeepTerm and set up your account.",
    content:
      "Getting started with DeepTerm is simple. You can begin using most features immediately without creating an account. For the best experience, we recommend signing in to save your progress and access your materials across devices.",
    steps: [
      {
        title: "Visit the Dashboard",
        description:
          "Click 'Log in' or 'Start Learning Free' to access your personal dashboard where all tools are available.",
      },
      {
        title: "Create Materials",
        description:
          "Go to Materials and click the + button to create new flashcards or reviewers. Choose between manual entry, bulk import, or AI generation.",
      },
      {
        title: "Choose Your Study Mode",
        description:
          "Open any material and select from 4 study modes: Flashcards, Learn, Match, or Practice to study in different ways.",
      },
      {
        title: "Track Your Progress",
        description:
          "View your study calendar, XP progress, achievements, and streaks on your dashboard.",
      },
    ],
    faqs: [
      {
        question: "Do I need an account to use DeepTerm?",
        answer:
          "No, you can use basic features without an account. However, signing in allows you to save your materials, track progress, and sync across devices.",
      },
      {
        question: "What file formats are supported?",
        answer:
          "DeepTerm supports PDF files for AI generation. You can also paste text directly or manually enter terms and definitions.",
      },
      {
        question: "How do I sign in?",
        answer:
          "Click the 'Log in' button in the header and sign in with your Google account. It's quick and secure.",
      },
      {
        question: "What are the 4 study modes?",
        answer:
          "Flashcards (flip cards to test recall), Learn (adaptive questions with MCQ/True-False/Written), Match (memory matching game), and Practice (customizable quiz).",
      },
    ],
  },

  {
    id: "reviewer",
    title: "Reviewer Maker",
    icon: FileText,
    description: "Transform documents into organized, categorized notes.",
    content:
      "The Reviewer Maker uses AI to extract key terms, definitions, and concepts from your study materials. It organizes information into categories with expandable sections. Choose from three extraction modes to customize how your content is processed.",
    features: [
      "AI-powered term and definition extraction",
      "Three modes: Full, Sentence, and Keywords",
      "Automatic category grouping with colors",
      "Expandable/collapsible category sections",
      "Search/filter terms within reviewer",
      "Export to PDF or DOCX format",
      "Edit, add, and delete terms and categories",
      "Share reviewers with shareable links",
    ],
    steps: [
      {
        title: "Create a Reviewer",
        description:
          "Go to Materials → Create. Choose 'Reviewer' type and upload a PDF file.",
      },
      {
        title: "Select Extraction Mode",
        description:
          "Choose Full mode for comprehensive definitions, Sentence mode for concise summaries, or Keywords mode for key phrases only.",
      },
      {
        title: "Review and Edit",
        description:
          "Expand categories to see terms. Click edit icons to modify terms, or use + to add new terms to any category.",
      },
      {
        title: "Export or Share",
        description:
          "Click the download icon to export as PDF/DOCX, or use the share button to generate a shareable link.",
      },
    ],
    faqs: [
      {
        question: "What's the difference between the three modes?",
        answer:
          "Full mode extracts comprehensive definitions with examples. Sentence mode pulls concise one-sentence summaries. Keywords mode focuses on essential terms and brief key phrases only.",
      },
      {
        question: "Can I edit the extracted content?",
        answer:
          "Yes! Click the edit icon on any term to modify it. You can also add new terms to categories, delete terms, or delete entire categories.",
      },
      {
        question: "How do I search within a reviewer?",
        answer:
          "Use the search/filter bar at the top of the reviewer. It filters terms across all categories in real-time as you type.",
      },
      {
        question: "What's the maximum file size?",
        answer:
          "We support PDF files up to 20MB. For larger documents, consider splitting them into smaller sections for better processing.",
      },
    ],
  },
  {
    id: "quiz",
    title: "Practice Test",
    icon: BrainCircuit,
    description: "Test yourself with customizable quizzes.",
    content:
      "Practice mode creates quizzes from your flashcard sets with multiple question types. Configure the number of questions and enable specific question types to test your knowledge.",
    features: [
      "Multiple choice questions (4 options)",
      "True/False questions with term-definition matching",
      "Fill-in-the-blank questions",
      "Configurable question count (5-50 or max)",
      "Auto-next after answering (configurable delay)",
      "Keyboard shortcuts (1-4 for MCQ, A/B for T/F)",
      "Results page showing incorrect answers",
      "XP rewards for correct answers",
    ],
    steps: [
      {
        title: "Open Practice Mode",
        description:
          "Open any flashcard set and click the Practice button to start.",
      },
      {
        title: "Configure Settings",
        description:
          "A settings modal appears. Choose question types and number of cards for your test.",
      },
      {
        title: "Take the Test",
        description:
          "Answer questions using mouse clicks or keyboard shortcuts. Feedback shows after each answer.",
      },
      {
        title: "Review Results",
        description:
          "After completing the test, see your score and review any questions you got wrong.",
      },
    ],
    faqs: [
      {
        question: "How do True/False questions work?",
        answer:
          "You're shown a definition and a term. You must decide if the term correctly matches the definition (True) or if it's a different term (False).",
      },
      {
        question: "What keyboard shortcuts can I use?",
        answer:
          "MCQ: Press 1-4 for options A-D. True/False: Press A (or 1) for True, B (or 2) for False. Fill-blank: Type answer and press Enter.",
      },
      {
        question: "Can I retry the test?",
        answer:
          "Yes! On the results page, click 'Try Again' to retake the test with newly shuffled questions, or 'Exit' to return to the material.",
      },
      {
        question: "How many questions can I have?",
        answer:
          "You can choose between 5, 10, 15, 20, 25, or 50 questions, or select 'max' to use all available cards from your set.",
      },
    ],
  },
  {
    id: "flashcards",
    title: "Flashcard Maker",
    icon: Zap,
    description: "Master any subject with active recall using flashcards.",
    content:
      "The Flashcard Maker extracts key terms and definitions to create flashcard sets for spaced repetition learning. This proven study technique helps you retain information longer by testing yourself at optimal intervals. Cards progress through stages: New, Learning, Review, and Mastered.",
    features: [
      "AI-powered term and definition extraction from PDFs",
      "Manual entry or bulk import (term - definition format)",
      "4 study modes: Flashcards, Learn, Match, Practice",
      "Card progress tracking (New → Learning → Review → Mastered)",
      "Customizable settings (cards per round, front side, auto-next)",
      "Keyboard shortcuts for faster studying",
      "Share materials with shareable links",
      "Rename, edit, and delete cards anytime",
    ],
    steps: [
      {
        title: "Create a New Set",
        description:
          "Go to Materials → Create. Choose 'Cards' type and enter a title for your set.",
      },
      {
        title: "Add Cards",
        description:
          "Use Manual Entry to add cards one by one, Bulk Add to paste multiple (term - definition format), or AI Generate to extract from a PDF.",
      },
      {
        title: "Study Your Cards",
        description:
          "Open your set and choose a study mode. Flashcards mode lets you flip cards and rate yourself.",
      },
      {
        title: "Track Mastery",
        description:
          "Cards move through stages as you study. View your progress on the material detail page.",
      },
    ],
    faqs: [
      {
        question: "How does card progression work?",
        answer:
          "Cards start as 'New'. Correct answers move them to 'Learning', then 'Review' (Almost Done), then 'Mastered'. Incorrect answers move cards back to 'Learning'.",
      },
      {
        question: "What's the bulk import format?",
        answer:
          "Use 'term - definition' format, one per line. Supported separators: dash (-), colon (:), semicolon (;), or tab. Example: 'Photosynthesis - Process plants use to convert sunlight to energy'.",
      },
      {
        question: "Can I customize study settings?",
        answer:
          "Yes! Click the settings/options button during study to adjust cards per round (5-50), front side (term or definition), question types, and auto-next timing.",
      },
      {
        question: "What keyboard shortcuts are available?",
        answer:
          "Flashcards: Space to flip, 1 for 'didn't know', 2 for 'knew it'. MCQ: 1-4 for options A-D. True/False: A/1 for True, B/2 for False. Any key to continue after answering.",
      },
    ],
  },

  {
    id: "study-modes",
    title: "Study Modes",
    icon: GraduationCap,
    description: "Four different ways to study your materials effectively.",
    content:
      "DeepTerm offers four distinct study modes for every material: Flashcards for simple flip-and-review, Learn for adaptive questioning, Match for memory games, and Practice for customizable quizzes. Each mode tracks your progress and awards XP.",
    features: [
      "Flashcards: Classic flip cards with self-rating",
      "Learn: Adaptive MCQ, True/False, and Written questions",
      "Match: Memory matching game with timer",
      "Practice: Customizable quiz with multiple question types",
      "Progress tracking across all modes",
      "Keyboard shortcuts for faster studying",
      "XP rewards for correct answers",
      "Session results with detailed breakdown",
    ],
    steps: [
      {
        title: "Open a Material",
        description:
          "Go to Materials and click on any flashcard set or reviewer to open it.",
      },
      {
        title: "Choose a Study Mode",
        description:
          "Click one of the four study mode buttons: Flashcards, Learn, Match, or Practice.",
      },
      {
        title: "Configure Settings",
        description:
          "Click Options/Settings to customize cards per round, question types, front side, and more.",
      },
      {
        title: "Study and Earn XP",
        description:
          "Answer questions correctly to earn XP and progress cards through mastery stages.",
      },
    ],
    faqs: [
      {
        question: "What's the difference between Learn and Practice?",
        answer:
          "Learn mode adapts question types based on card mastery (new cards get MCQ, mastered cards get written). Practice mode lets you configure everything upfront including question types and count.",
      },
      {
        question: "How does the Match game work?",
        answer:
          "Match shows 12 cards (6 pairs of terms and definitions). Click cards to flip them and find matching pairs. A timer tracks how fast you complete the game.",
      },
      {
        question: "Do all modes track the same progress?",
        answer:
          "Yes! All modes update the same card mastery status (New → Learning → Review → Mastered) and contribute to your XP and achievements.",
      },
      {
        question: "Can I customize study settings?",
        answer:
          "Yes! Each mode has an Options/Settings button where you can adjust cards per round, front side (term or definition), enabled question types, and auto-next timing.",
      },
    ],
  },

  {
    id: "keyboard-shortcuts",
    title: "Keyboard Shortcuts",
    icon: Keyboard,
    description: "Speed up your studying with keyboard controls.",
    content:
      "DeepTerm supports keyboard shortcuts across all study modes to help you study faster without reaching for your mouse. Learn these shortcuts to maximize your study efficiency.",
    features: [
      "Number keys (1-4) for MCQ options A-D",
      "A/B or 1/2 for True/False questions",
      "Space to flip flashcards",
      "1/2 for flashcard self-rating",
      "Enter to submit written answers",
      "Any key to continue after feedback",
    ],
    steps: [
      {
        title: "Start a Study Session",
        description:
          "Open any material and choose a study mode to begin.",
      },
      {
        title: "Use Number Keys for MCQ",
        description:
          "Press 1, 2, 3, or 4 to select options A, B, C, or D in multiple choice questions.",
      },
      {
        title: "Use A/B for True/False",
        description:
          "Press A (or 1) for True, B (or 2) for False in true/false questions.",
      },
      {
        title: "Continue with Any Key",
        description:
          "After seeing feedback, press any key to move to the next question.",
      },
    ],
    faqs: [
      {
        question: "What shortcuts work in Flashcards mode?",
        answer:
          "Space to flip the card. After flipping: 1 for 'didn't know it' (incorrect), 2 for 'knew it' (correct).",
      },
      {
        question: "What shortcuts work in Learn mode?",
        answer:
          "MCQ: 1-4 for options. True/False: A/1 for True, B/2 for False. Written: Enter to submit. Any key to continue after feedback.",
      },
      {
        question: "What shortcuts work in Practice mode?",
        answer:
          "Same as Learn mode: 1-4 for MCQ, A/B for True/False, Enter for fill-in-blank. Any key to continue.",
      },
      {
        question: "Can I disable keyboard shortcuts?",
        answer:
          "Keyboard shortcuts are always enabled but won't interfere with text input fields. They only activate when not typing in an input.",
      },
    ],
  },
  {
    id: "themes",
    title: "Themes & Customization",
    icon: Palette,
    description: "Switch between normal and spooky dark mode themes.",
    content:
      "DeepTerm features two distinct themes: the default light theme and a spooky dark theme with purple accents. The spooky theme transforms the entire UI with themed text, icons, and atmospheric effects.",
    features: [
      "Light theme: Clean, minimal design",
      "Spooky theme: Dark purple aesthetic",
      "Themed UI text and labels",
      "Ambient visual effects in spooky mode",
      "Optional ambient sounds",
      "Theme persists across sessions",
      "Flashlight effect in study modes (spooky)",
    ],
    steps: [
      {
        title: "Access Theme Toggle",
        description:
          "Look for the theme toggle in the sidebar or settings area.",
      },
      {
        title: "Switch Themes",
        description:
          "Click to toggle between normal and spooky themes. The change applies immediately.",
      },
      {
        title: "Enjoy Themed Content",
        description:
          "In spooky mode, UI labels change (e.g., 'Materials' becomes 'Forbidden Archives', 'Cards' becomes 'Dark Spells').",
      },
      {
        title: "Experience Study Effects",
        description:
          "Spooky mode adds a flashlight effect in study modes, creating an immersive dark atmosphere.",
      },
    ],
    faqs: [
      {
        question: "What changes in spooky mode?",
        answer:
          "Colors shift to dark purple, UI text gets themed (e.g., 'Achievements' → 'Soul Trophies'), ambient effects appear, and study modes get a flashlight spotlight effect.",
      },
      {
        question: "Does the theme affect functionality?",
        answer:
          "No, themes are purely visual. All features work identically in both themes.",
      },
      {
        question: "Is my theme preference saved?",
        answer:
          "Yes, your theme choice is saved and will persist when you return to DeepTerm.",
      },
      {
        question: "What is the flashlight effect?",
        answer:
          "In spooky mode during study sessions, the screen darkens except for a spotlight that follows your cursor, creating an atmospheric studying experience.",
      },
    ],
  },
  {
    id: "pomodoro",
    title: "Pomodoro Timer",
    icon: Timer,
    description: "Boost productivity with focused work sessions.",
    content:
      "The Pomodoro Timer helps you maintain focus using the proven Pomodoro Technique. Work in focused intervals with short breaks to maximize productivity and prevent burnout. Features include custom backgrounds, fullscreen mode, ambient sounds, and task management with reminders.",
    features: [
      "Customizable focus and break durations (1-60 minutes)",
      "Default 25/5/15 minute intervals",
      "Custom background images with compression",
      "Fullscreen distraction-free mode",
      "Ambient background sounds (rain, cafe, nature, etc.)",
      "Task list with scheduled reminders",
      "Session counter (4 sessions = long break)",
      "Audio notifications with volume control",
    ],
    steps: [
      {
        title: "Set Your Timer",
        description:
          "Click the settings gear to customize focus duration (default 25 min), short break (5 min), and long break (15 min).",
      },
      {
        title: "Add Tasks (Optional)",
        description:
          "Add tasks in the sidebar. Click the bell icon to set a reminder time for each task.",
      },
      {
        title: "Customize Your Environment",
        description:
          "Upload a custom background image, enable fullscreen mode, and choose ambient sounds to help you focus.",
      },
      {
        title: "Start Focusing",
        description:
          "Hit Start and focus on your work. After 4 work sessions, you'll get a longer break.",
      },
    ],
    faqs: [
      {
        question: "What is the Pomodoro Technique?",
        answer:
          "The Pomodoro Technique is a time management method that uses focused work intervals (typically 25 minutes) followed by short breaks. It helps maintain concentration and prevents mental fatigue.",
      },
      {
        question: "How do I use fullscreen mode?",
        answer:
          "Click the fullscreen icon in the top-right corner of the timer. In fullscreen, you can access settings and tasks via the floating buttons. Press Escape or click X to exit.",
      },
      {
        question: "What background sounds are available?",
        answer:
          "Choose from various ambient sounds including rain, coffee shop, nature sounds, and more. Adjust the volume separately from notification sounds.",
      },
      {
        question: "How do task reminders work?",
        answer:
          "When adding a task, click the bell icon to set a reminder time. You'll receive a browser notification at the scheduled time. Make sure to allow notifications when prompted.",
      },
      {
        question: "Can I upload custom backgrounds?",
        answer:
          "Yes! Click the image icon in the timer to upload your own background. Images are automatically compressed to fit within storage limits.",
      },
    ],
  },
  {
    id: "account",
    title: "Account & Settings",
    icon: Settings,
    description: "Manage your profile and preferences.",
    content:
      "Manage your DeepTerm account settings, preferences, and saved materials. Sign in with Google for a seamless experience across all your devices.",
    features: [
      "Google sign-in integration",
      "Sync across devices",
      "Manage saved materials",
      "View study history",
      "Delete account option",
      "Privacy controls",
    ],
    steps: [
      {
        title: "Sign In",
        description:
          "Click 'Log in' and authenticate with your Google account.",
      },
      {
        title: "Access Dashboard",
        description:
          "Your dashboard shows all saved reviewers, tests, flashcards, and study progress.",
      },
      {
        title: "Manage Materials",
        description:
          "View, edit, or delete your saved study materials from the dashboard.",
      },
      {
        title: "Adjust Settings",
        description:
          "Customize your experience through the settings menu in your profile.",
      },
    ],
    faqs: [
      {
        question: "How do I delete my account?",
        answer:
          "Go to Settings in your dashboard and select 'Delete Account'. This will permanently remove all your data from our servers.",
      },
      {
        question: "Can I use DeepTerm without signing in?",
        answer:
          "Yes, basic features work without an account. However, your materials won't be saved between sessions.",
      },
      {
        question: "Is my Google data shared?",
        answer:
          "We only access your basic profile information (name and email) for authentication. We never access your Google Drive, contacts, or other data.",
      },
    ],
  },
  {
    id: "achievements",
    title: "Achievements",
    icon: Trophy,
    description: "Track your progress and unlock rewards as you study.",
    content:
      "DeepTerm features 50 achievements across 5 categories to motivate your learning journey. Achievements are automatically unlocked as you reach milestones in your study activities.",
    features: [
      "50 total achievements to unlock",
      "5 achievement categories",
      "Automatic progress tracking",
      "Visual progress indicators",
      "Achievement notifications",
      "Dashboard achievement display",
    ],
    steps: [
      {
        title: "Study Regularly",
        description:
          "Complete study sessions, quizzes, flashcards, and pomodoros to make progress toward achievements.",
      },
      {
        title: "Track Progress",
        description:
          "View your achievement progress on the dashboard - each achievement shows how close you are to unlocking it.",
      },
      {
        title: "Unlock Achievements",
        description:
          "When you meet the requirements, achievements unlock automatically and appear in your recent activity.",
      },
      {
        title: "View All Achievements",
        description:
          "Click 'View All' on the achievements section to see all 50 achievements and your progress toward each.",
      },
    ],
    faqs: [
      {
        question: "What are the achievement categories?",
        answer:
          "There are 5 categories: Study Time (10 achievements for total hours studied), Streaks (10 for consecutive study days), Pomodoro (10 for focus sessions), Flashcards (10 for creating sets and mastering cards), and Quizzes (10 for completing quizzes and perfect scores).",
      },
      {
        question: "How do Study Time achievements work?",
        answer:
          "Study Time achievements track your total study minutes. They range from 'First Hour' (1 hour) to 'Legend' (2000 hours). Milestones include: 1hr, 5hr, 10hr, 25hr, 50hr, 100hr, 250hr, 500hr, 1000hr, and 2000hr.",
      },
      {
        question: "What are Streak achievements?",
        answer:
          "Streak achievements reward consecutive days of studying. They range from '3 Day Streak' to 'Unstoppable' (500 days). Key milestones: 3, 7, 14, 21, 30, 60, 90, 180, 365, and 500 consecutive days.",
      },
      {
        question: "How do Pomodoro achievements work?",
        answer:
          "Complete pomodoro work sessions to unlock these. Starting with 'Focus Beginner' (1 session) up to 'Time Lord' (5000 sessions). Milestones: 1, 10, 25, 50, 100, 250, 500, 1000, 2500, and 5000 sessions.",
      },
      {
        question: "What Flashcard achievements are available?",
        answer:
          "Two types: creating flashcard sets (1, 5, 10, 25 sets) and mastering flashcards (10, 50, 100, 250, 500, 1000 cards mastered). 'First Steps' is your first set, 'Memory Legend' requires mastering 1000 cards.",
      },
      {
        question: "How do Quiz achievements work?",
        answer:
          "Quiz achievements track completed quizzes (1, 10, 25, 50, 100) and perfect scores (1, 5, 10, 25, 50 perfect quizzes). 'Quiz Starter' is your first quiz, 'Quiz Legend' requires 50 perfect scores.",
      },
    ],
  },
  {
    id: "calendar",
    title: "Study Calendar",
    icon: Calendar,
    description: "Visualize your study habits with the activity tracker.",
    content:
      "The Study Calendar provides a visual heatmap of your daily study activity. Each day is color-coded based on how many minutes you studied, helping you identify patterns and maintain consistency.",
    features: [
      "Monthly calendar view",
      "Color-coded intensity levels",
      "Daily study time tracking",
      "Current streak display",
      "Month navigation",
      "Today indicator",
    ],
    steps: [
      {
        title: "View Your Calendar",
        description:
          "Access the Study Calendar from your dashboard to see your monthly activity overview.",
      },
      {
        title: "Understand Intensity Levels",
        description:
          "Days are shaded based on study time: lighter colors for less time, darker for more intensive study days.",
      },
      {
        title: "Navigate Months",
        description:
          "Use the arrow buttons to view previous months and track your long-term study patterns.",
      },
      {
        title: "Maintain Streaks",
        description:
          "Study at least a few minutes each day to keep your streak going - visible at the top of the calendar.",
      },
    ],
    faqs: [
      {
        question: "What do the color intensity levels mean?",
        answer:
          "Level 0 (no color): 0 minutes. Level 1 (lightest): 1-29 minutes. Level 2: 30-59 minutes. Level 3: 60-119 minutes. Level 4 (darkest): 120+ minutes of study time.",
      },
      {
        question: "How is study time tracked?",
        answer:
          "Study time is automatically recorded when you complete pomodoro sessions, review flashcards, or take quizzes. Each activity contributes to your daily total.",
      },
      {
        question: "What counts toward my streak?",
        answer:
          "Any recorded study activity on a day counts toward maintaining your streak. This includes pomodoro sessions, flashcard reviews, and quiz completions.",
      },
      {
        question: "Can I see past months?",
        answer:
          "Yes, use the navigation arrows on the calendar to browse through previous months and see your historical study patterns.",
      },
      {
        question: "Why is today highlighted?",
        answer:
          "The current day has a special indicator (usually a ring or border) so you can quickly see today's activity status and whether you've studied yet.",
      },
    ],
  },
  {
    id: "leveling",
    title: "Leveling & XP",
    icon: TrendingUp,
    description: "Earn XP and level up as you learn.",
    content:
      "DeepTerm features a gamified leveling system where you earn XP (experience points) for study activities. As you accumulate XP, you level up and progress through ranks from Novice to Grandmaster.",
    features: [
      "XP rewards for all activities",
      "Progressive leveling system",
      "6 rank titles to achieve",
      "Level-up notifications",
      "XP progress bar",
      "Lifetime XP tracking",
    ],
    steps: [
      {
        title: "Earn XP",
        description:
          "Complete study activities to earn XP. Different activities award different amounts based on difficulty and effort.",
      },
      {
        title: "Level Up",
        description:
          "When your XP reaches the threshold for the next level, you'll level up and see a notification.",
      },
      {
        title: "Track Progress",
        description:
          "View your current level, XP progress bar, and rank title on your dashboard header.",
      },
      {
        title: "Achieve Higher Ranks",
        description:
          "As you reach higher levels, your rank title changes to reflect your dedication and expertise.",
      },
    ],
    faqs: [
      {
        question: "How much XP do I earn for each activity?",
        answer:
          "XP rewards: Correct flashcard answer = 10 XP. Mastering a flashcard = 25 XP. Completing a quiz = 20 XP. Perfect quiz score = 50 XP. Completing a pomodoro work session = 15 XP. Each minute of study = 1 XP.",
      },
      {
        question: "How does the leveling formula work?",
        answer:
          "Level 1 requires 100 XP. Each subsequent level requires 50 more XP than the previous. Level 2 = 150 XP, Level 3 = 200 XP, Level 4 = 250 XP, and so on. The formula is: XP needed = 100 + (level - 1) × 50.",
      },
      {
        question: "What are the rank titles and their levels?",
        answer:
          "Novice: Levels 1-4. Apprentice: Levels 5-9. Scholar: Levels 10-19. Expert: Levels 20-34. Master: Levels 35-49. Grandmaster: Level 50+.",
      },
      {
        question: "Is there a maximum level?",
        answer:
          "There's no maximum level - you can continue leveling up indefinitely. Once you reach level 50, you achieve the Grandmaster rank and continue progressing.",
      },
      {
        question: "What happens when I level up?",
        answer:
          "When you level up, you'll see a notification celebrating your achievement. Your new level and any rank changes are immediately reflected on your dashboard.",
      },
      {
        question: "How much total XP do I need for each rank?",
        answer:
          "Approximate totals: Novice (start) = 0 XP. Apprentice (Level 5) = ~400 XP. Scholar (Level 10) = ~1,150 XP. Expert (Level 20) = ~4,650 XP. Master (Level 35) = ~14,025 XP. Grandmaster (Level 50) = ~30,650 XP.",
      },
    ],
  },
];

function FAQAccordion({ faqs, isSpooky }: { faqs: FAQItem[]; isSpooky: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className={`rounded-xl border overflow-hidden ${isSpooky ? "bg-[#1a1525] border-purple-500/20" : "bg-white border-[#171d2b]/10"}`}
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className={`w-full flex items-center justify-between p-4 text-left transition-colors ${isSpooky ? "hover:bg-purple-500/10" : "hover:bg-[#f0f0ea]/50"}`}
          >
            <span className={`font-sans font-medium text-[14px] sm:text-[15px] ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>
              {faq.question}
            </span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${isSpooky ? "text-purple-400/50" : "text-[#171d2b]/50"} ${openIndex === index ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`px-4 pb-4 text-[13px] sm:text-[14px] leading-relaxed ${isSpooky ? "text-white/80" : "text-[#171d2b]/70"}`}>
                  {faq.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}


function CategoryDetail({ category, isSpooky }: { category: CategoryContent; isSpooky: boolean }) {
  const IconComponent = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl border p-6 sm:p-8 ${isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-[#171d2b]/10"}`}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSpooky ? "bg-purple-600" : "bg-[#171d2b]"}`}>
          <IconComponent className="h-6 w-6 text-white" />
        </div>
        <h2 className={`font-serif text-2xl sm:text-3xl ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>
          {category.title}
        </h2>
      </div>

      <p className={`font-sans text-[15px] leading-relaxed mb-8 ${isSpooky ? "text-white/80" : "text-[#171d2b]/70"}`}>
        {category.content}
      </p>

      {category.features && (
        <div className="mb-8">
          <h3 className={`font-serif text-lg mb-4 ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>
            Key Features
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {category.features.map((feature, index) => (
              <li
                key={index}
                className={`flex items-start gap-2 text-[14px] ${isSpooky ? "text-white/80" : "text-[#171d2b]/70"}`}
              >
                <span className={`mt-0.5 ${isSpooky ? "text-purple-400" : "text-[#171d2b]"}`}>→</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {category.steps && (
        <div className="mb-8">
          <h3 className={`font-serif text-lg mb-4 ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>
            How to Use
          </h3>
          <div className="space-y-4">
            {category.steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isSpooky ? "bg-purple-600" : "bg-[#171d2b]"}`}>
                  <span className="text-white text-sm font-medium">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h4 className={`font-sans font-medium text-[15px] mb-1 ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>
                    {step.title}
                  </h4>
                  <p className={`font-sans text-[14px] ${isSpooky ? "text-white/70" : "text-[#171d2b]/60"}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className={`font-serif text-lg mb-4 ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>
          Frequently Asked Questions
        </h3>
        <FAQAccordion faqs={category.faqs} isSpooky={isSpooky} />
      </div>
    </motion.div>
  );
}

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedCategoryData = categories.find(
    (c) => c.id === selectedCategory
  );

  const filteredCategories = searchQuery
    ? categories.filter(
      (c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : categories;

  const theme = useThemeStore((state) => state.theme);
  const isSpooky = theme === "spooky";

  return (
    <PublicPageWrapper>
      <div className={`min-h-screen flex flex-col ${isSpooky ? "bg-[#0d0f14]" : "bg-[#f0f0ea]"}`}>
        <Header />

        <main className="flex-grow">
          {/* Hero Section */}
          <section className="px-4 sm:px-6 py-12 sm:py-20 text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className={`font-serif text-[36px] sm:text-[48px] mb-4 leading-tight ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>
                {isSpooky ? "Knowledge Base" : "Help Center"}
              </h1>
              <p className={`font-sans text-[15px] sm:text-[16px] mb-8 max-w-lg mx-auto ${isSpooky ? "text-white/70" : "text-[#171d2b]/60"}`}>
                {isSpooky ? "Everything you need to master the dark arts of studying." : "Everything you need to know about DeepTerm and how to make the most of your study sessions."}
              </p>

              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className={`h-5 w-5 transition-colors ${isSpooky ? "text-purple-400/40 group-focus-within:text-purple-400" : "text-[#171d2b]/40 group-focus-within:text-[#171d2b]"}`} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedCategory(null);
                  }}
                  placeholder={isSpooky ? "Search the archives..." : "Search for help..."}
                  className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm hover:shadow-md font-sans ${isSpooky ? "bg-[#151821] border-purple-500/20 text-white placeholder-white/40 focus:ring-purple-500/20 focus:border-purple-500/40" : "bg-white border-[#171d2b]/10 text-[#171d2b] placeholder-[#171d2b]/40 focus:ring-[#171d2b]/10 focus:border-[#171d2b]/30"}`}
                />
              </div>
            </motion.div>
          </section>

          {/* Main Content */}
          <section className="px-4 sm:px-6 pb-20 max-w-6xl mx-auto">
            {selectedCategory ? (
              <div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`flex items-center gap-2 transition-colors mb-6 font-sans text-[14px] ${isSpooky ? "text-white/70 hover:text-white" : "text-[#171d2b]/60 hover:text-[#171d2b]"}`}
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Back to all topics
                </button>
                {selectedCategoryData && (
                  <CategoryDetail category={selectedCategoryData} isSpooky={isSpooky} />
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category, index) => (
                  <motion.button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className={`group p-6 rounded-2xl border transition-all duration-300 flex flex-col h-full text-left ${isSpooky ? "bg-[#151821] border-purple-500/20 hover:border-purple-500/40 hover:shadow-purple-500/10" : "bg-white border-[#171d2b]/10 hover:border-[#171d2b]/20"} hover:shadow-lg`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 ${isSpooky ? "bg-purple-500/20 group-hover:bg-purple-600" : "bg-[#f0f0ea] group-hover:bg-[#171d2b]"}`}>
                      <category.icon className={`h-6 w-6 transition-colors duration-300 ${isSpooky ? "text-purple-400 group-hover:text-white" : "text-[#171d2b] group-hover:text-white"}`} />
                    </div>
                    <h3 className={`font-serif text-xl mb-2 ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>
                      {category.title}
                    </h3>
                    <p className={`font-sans text-sm leading-relaxed mb-4 flex-grow ${isSpooky ? "text-white/70" : "text-[#171d2b]/60"}`}>
                      {category.description}
                    </p>
                    <div className={`flex items-center font-medium text-sm mt-auto opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>
                      Learn more <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <p className={`font-sans ${isSpooky ? "text-white/70" : "text-[#171d2b]/60"}`}>
                  No results found for &quot;{searchQuery}&quot;
                </p>
              </div>
            )}
          </section>

          {/* Contact Section */}
          <section className="px-4 sm:px-6 pb-20 max-w-4xl mx-auto text-center">
            <div className={`rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden ${isSpooky ? "bg-gradient-to-br from-purple-900 to-purple-950" : "bg-[#171d2b]"}`}>
              <div className="relative z-10">
                <h2 className="font-serif text-2xl sm:text-3xl mb-4">
                  {isSpooky ? "Still stuck?" : "Still need help?"}
                </h2>
                <p className="font-sans text-white/70 mb-8 max-w-lg mx-auto">
                  {isSpooky ? "Can't figure it out? Hit us up." : "Can't find what you're looking for? Reach out to us directly."}
                </p>
                <a
                  href="mailto:deeptermai@gmail.com"
                  className={`inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-colors ${isSpooky ? "bg-purple-100 text-purple-900 hover:bg-white" : "bg-white text-[#171d2b] hover:bg-gray-100"}`}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  {isSpooky ? "Send Message" : "Contact Support"}
                </a>
              </div>

              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className={`absolute top-[-50%] left-[-20%] w-[500px] h-[500px] rounded-full blur-[100px] ${isSpooky ? "bg-purple-500" : "bg-white"}`} />
                <div className={`absolute bottom-[-50%] right-[-20%] w-[500px] h-[500px] rounded-full blur-[100px] ${isSpooky ? "bg-purple-500" : "bg-white"}`} />
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PublicPageWrapper>
  );
}
