"use client";

import { useThemeStore } from "@/lib/stores";
import {
  Library,
  BrainCircuit,
  Copy,
  FileText,
  Gamepad2,
  Upload,
  Sparkles,
  Clock,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Feature {
  title: string;
  description: string;
  steps: string[];
  icon: React.ReactNode;
  cardTitle: string;
}

const features: Feature[] = [
  {
    title: "Materials Hub",
    description: "Centralize your knowledge. Upload lectures, essays, or notes, and watch them transform into organized study sets ready for action.",
    steps: [
      "Upload PDF, DOCX, or TXT files",
      "Smart auto-organization",
      "One-click study aid generation",
      "Cloud synchronization",
    ],
    icon: <Library className="w-4 h-4 text-white" />,
    cardTitle: "Smart Library",
  },
  {
    title: "Learn Mode",
    description: "Your personal AI tutor. It breaks down complex topics into bite-sized concepts, quizzes you as you go, and adapts to your pace.",
    steps: [
      "Smart concept breakdown",
      "Interactive checkpoints",
      "Confidence tracking",
      "Personalized pacing",
    ],
    icon: <BrainCircuit className="w-4 h-4 text-white" />,
    cardTitle: "Adaptive Learning",
  },
  {
    title: "Flashcards",
    description: "Master definitions with ease. Flip through AI-generated cards, track your confidence, and let spaced repetition handle the rest.",
    steps: [
      "Auto-generated decks",
      "Spaced repetition system",
      "Performance analytics",
      "Edit and customize",
    ],
    icon: <Copy className="w-4 h-4 text-white" />,
    cardTitle: "Active Recall",
  },
  {
    title: "Practice Tests",
    description: "Simulate the real exam. Generate custom tests with multiple choice, true/false, or identification questions to prove you're ready.",
    steps: [
      "Multiple question types",
      "Instant grading & feedback",
      "Detailed explanations",
      "Score history tracking",
    ],
    icon: <FileText className="w-4 h-4 text-white" />,
    cardTitle: "Exam Simulation",
  },
  {
    title: "Match Mode",
    description: "Gamify your grind. Race against the clock to link terms and definitions. High scores mean high retention.",
    steps: [
      "High-speed matching",
      "Score tracking",
      "Visual feedback",
      "Competitive focus",
    ],
    icon: <Gamepad2 className="w-4 h-4 text-white" />,
    cardTitle: "Speed Challenge",
  },
];

function FeatureCard({ feature, isSpooky }: { feature: Feature; isSpooky: boolean }) {
  return (
    <div
      className={`flex flex-col lg:flex-row items-center gap-5 lg:gap-8 p-4 rounded-2xl transition-colors duration-300 ${isSpooky ? "hover:bg-purple-500/10" : "hover:bg-white/50"
        }`}
    >
      <div className="flex-1 order-2 lg:order-1">
        <h3 className={`font-sans font-semibold text-[17px] sm:text-[19px] mb-2 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"
          }`}>
          {feature.title}
        </h3>
        <p className={`font-sans text-[13px] sm:text-[14px] leading-[1.5] mb-3 ${isSpooky ? "text-purple-300/70" : "text-[#171d2b]/70"
          }`}>
          {feature.description}
        </p>
        <ul className="space-y-1">
          {feature.steps.map((step, i) => (
            <li
              key={i}
              className={`flex items-center gap-2 text-[12px] sm:text-[13px] ${isSpooky ? "text-purple-300/70" : "text-[#171d2b]/70"
                }`}
            >
              <span className={isSpooky ? "text-purple-400" : "text-[#171d2b]"}>→</span> {step}
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`w-full lg:w-[340px] flex-shrink-0 rounded-[18px] p-4 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] order-1 lg:order-2 ${isSpooky ? "bg-purple-500/15 border border-purple-500/20" : "bg-[rgba(210,210,200,0.55)]"
          }`}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSpooky ? "bg-purple-600" : "bg-[#171d2b]"
            }`}>
            {feature.icon}
          </div>
          <span className={`font-sans font-medium text-[14px] sm:text-[15px] ${isSpooky ? "text-purple-100" : "text-[#171d2b]"
            }`}>
            {feature.cardTitle}
          </span>
        </div>
        <FeatureCardContent feature={feature} isSpooky={isSpooky} />
      </div>
    </div>
  );
}

function FeatureCardContent({ feature, isSpooky }: { feature: Feature; isSpooky: boolean }) {
  const borderClass = isSpooky ? "border-purple-500/20" : "border-[#171d2b]/10";
  const textClass = isSpooky ? "text-purple-300/80" : "text-[#171d2b]/80";
  const bgClass = isSpooky ? "bg-purple-600" : "bg-[#171d2b]";
  const bgLightClass = isSpooky ? "bg-purple-600/70" : "bg-[#171d2b]/70";
  const buttonClass = isSpooky
    ? "bg-purple-600 hover:bg-purple-500 text-white"
    : "bg-[#171d2b] hover:bg-[#2a3347] text-white";

  // Materials Hub State
  const [files, setFiles] = useState([
    { name: "Lecture_Notes.pdf", status: "Processed" },
    { name: "History_Essay.docx", status: "Ready" }
  ]);
  const handleProcess = (index: number) => {
    const newFiles = [...files];
    if (newFiles[index].status === "Ready") {
      newFiles[index].status = "Processing...";
      setTimeout(() => {
        setFiles(prev => {
          const updated = [...prev];
          updated[index].status = "Processed";
          return updated;
        });
      }, 1000);
    }
    setFiles(newFiles);
  };

  // Learn Mode State
  const [progress, setProgress] = useState(65);
  const handleLearnNext = () => {
    setProgress(prev => prev >= 100 ? 0 : prev + 15);
  };

  // Flashcards State
  const [showAnswer, setShowAnswer] = useState(false);
  const cards = [
    { q: "Powerhouse of the cell?", a: "Mitochondria" },
    { q: "Capital of France?", a: "Paris" }
  ];

  // Practice Test State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const correctOption = 2; // Index 2 is correct

  // Match Mode State
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const matchItems = [
    { id: "t1", text: "Mitochondria", pair: "p1" },
    { id: "d1", text: "Powerhouse", pair: "p1" },
    { id: "t2", text: "DNA", pair: "p2" },
    { id: "d2", text: "Genetic Code", pair: "p2" },
  ];
  const handleMatchClick = (id: string, pair: string) => {
    if (matchedPairs.includes(id)) return;

    if (!selectedItem) {
      setSelectedItem(id);
    } else {
      const prevItem = matchItems.find(i => i.id === selectedItem);
      if (prevItem && prevItem.pair === pair && prevItem.id !== id) {
        setMatchedPairs(prev => [...prev, selectedItem, id]);
      }
      setSelectedItem(null);
    }
  };
  const resetMatch = () => {
    setMatchedPairs([]);
    setSelectedItem(null);
  };


  if (feature.title === "Materials Hub") {
    return (
      <div className="space-y-2">
        {files.map((file, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between py-2 border-b ${borderClass} cursor-pointer hover:opacity-80 transition-opacity`}
            onClick={() => handleProcess(idx)}
          >
            <div className="flex items-center gap-2">
              {file.name.endsWith('pdf') ?
                <Upload className={`w-3 h-3 ${isSpooky ? "text-purple-400" : "text-[#171d2b]"}`} /> :
                <FileText className={`w-3 h-3 ${isSpooky ? "text-purple-400" : "text-[#171d2b]"}`} />
              }
              <span className={`font-sans text-[12px] sm:text-[13px] ${textClass}`}>{file.name}</span>
            </div>
            <div className={`px-1.5 py-0.5 text-[9px] rounded transition-colors duration-300 ${file.status === "Processed" ? bgClass + " text-white" :
              file.status === "Processing..." ? "bg-yellow-500 text-white" :
                bgLightClass + " text-white"
              }`}>
              {file.status}
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between py-2">
          <span className={`font-sans text-[11px] ${textClass}`}>Storage Used</span>
          <div className={`w-24 h-1.5 ${isSpooky ? "bg-purple-900/50" : "bg-gray-200"} rounded-full overflow-hidden`}>
            <div className={`h-full w-[45%] ${bgClass} rounded-full`} />
          </div>
        </div>
      </div>
    );
  }

  if (feature.title === "Learn Mode") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`font-sans text-[11px] ${textClass}`}>Concept Mastery</span>
          <span className={`font-sans text-[11px] ${isSpooky ? "text-purple-400" : "text-[#171d2b]"}`}>{progress}%</span>
        </div>
        <div className={`w-full h-2 ${isSpooky ? "bg-purple-900/50" : "bg-gray-200"} rounded-full overflow-hidden`}>
          <motion.div
            className={`h-full ${bgClass} rounded-full`}
            initial={{ width: "65%" }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        <div className={`p-2 rounded-lg ${isSpooky ? "bg-purple-500/10" : "bg-white/50"} border ${borderClass}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-start gap-2">
              <Sparkles className={`w-3 h-3 mt-0.5 ${isSpooky ? "text-purple-400" : "text-[#171d2b]"}`} />
              <div className="space-y-1">
                <div className={`h-1.5 w-20 ${bgClass} rounded-full opacity-40`} />
                <div className={`h-1.5 w-12 ${bgClass} rounded-full opacity-20`} />
              </div>
            </div>
            <button
              onClick={handleLearnNext}
              className={`p-1 rounded-full ${buttonClass} transition-transform active:scale-95`}
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (feature.title === "Flashcards") {
    return (
      <div className="space-y-2">
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className={`relative w-full p-3 rounded-lg border ${borderClass} ${isSpooky ? "bg-[#1a1525]" : "bg-white"} min-h-[80px] flex flex-col items-center justify-center text-center cursor-pointer hover:opacity-90 transition-opacity`}
        >
          <AnimatePresence mode="wait">
            {showAnswer ? (
              <motion.div
                key="answer"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`font-sans font-medium text-[13px] ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}
              >
                {cards[0].a}
              </motion.div>
            ) : (
              <motion.div
                key="question"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`font-sans text-[12px] ${textClass}`}
              >
                {cards[0].q}
              </motion.div>
            )}
          </AnimatePresence>
        </button>
        <div className="flex justify-between gap-2">
          <div className={`h-1 flex-1 ${bgClass} rounded-full`} />
          <div className={`h-1 flex-1 ${bgClass} rounded-full opacity-30`} />
        </div>
      </div>
    );
  }

  if (feature.title === "Practice Tests") {
    return (
      <div className="space-y-2">
        <div className={`flex items-center justify-between py-1.5 border-b ${borderClass}`}>
          <span className={`font-sans text-[11px] ${textClass}`}>Question 1/20</span>
          <span className={`font-sans text-[10px] ${isSpooky ? "text-purple-400" : "text-[#171d2b]"}`}>Multiple Choice</span>
        </div>
        <div className="space-y-1.5">
          {[1, 2, 3].map((i) => {
            const isSelected = selectedOption === i;
            const isCorrect = i === correctOption;
            let itemBg = "";
            let borderColor = isSpooky ? "border-purple-400/30" : "border-[#171d2b]/20";

            if (isSelected) {
              if (isCorrect) {
                itemBg = isSpooky ? "bg-green-500/20" : "bg-green-100";
                borderColor = "border-green-500";
              } else {
                itemBg = isSpooky ? "bg-red-500/20" : "bg-red-100";
                borderColor = "border-red-500";
              }
            }

            return (
              <div
                key={i}
                onClick={() => setSelectedOption(i)}
                className={`flex items-center gap-2 p-1.5 rounded border ${borderColor} ${itemBg} cursor-pointer transition-colors`}
              >
                <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${isSpooky ? "border-purple-400" : "border-[#171d2b]"}`}>
                  {isSelected && <div className={`w-1.5 h-1.5 rounded-full ${isSpooky ? "bg-purple-400" : "bg-[#171d2b]"}`} />}
                </div>
                <div className={`h-1.5 w-24 ${bgClass} rounded-full opacity-20`} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (feature.title === "Match Mode") {
    return (
      <div className="relative">
        <div className="grid grid-cols-2 gap-2">
          {matchItems.map((item) => {
            const isMatched = matchedPairs.includes(item.id);
            const isSelected = selectedItem === item.id;

            if (isMatched) return <div key={item.id} className="h-8" />; // Placeholder for matched items

            return (
              <button
                key={item.id}
                onClick={() => handleMatchClick(item.id, item.pair)}
                className={`h-8 rounded border flex items-center justify-center transition-all active:scale-95
                  ${isSelected
                    ? (isSpooky ? "bg-purple-500/40 border-purple-400" : "bg-[#171d2b]/20 border-[#171d2b]")
                    : (isSpooky ? "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20" : "bg-white border-[#171d2b]/10 hover:bg-gray-50")
                  }
                `}
              >
                <span className={`text-[10px] ${textClass}`}>{item.text}</span>
              </button>
            );
          })}
        </div>
        {matchedPairs.length === matchItems.length && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded backdrop-blur-sm">
            <button onClick={resetMatch} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] ${buttonClass}`}>
              <RefreshCw className="w-3 h-3" /> Play Again
            </button>
          </div>
        )}
        <div className="col-span-2 flex items-center justify-center gap-1 mt-2">
          <Clock className={`w-3 h-3 ${textClass}`} />
          <span className={`text-[10px] ${textClass}`}>00:45</span>
        </div>
      </div>
    );
  }

  return null;
}

export default function FeaturesShowcase() {
  const theme = useThemeStore((state) => state.theme);
  const isSpooky = theme === "spooky";

  return (
    <section
      className="relative z-10 px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20"
    >
      <div>
        <h2 className={`font-serif text-[24px] sm:text-[32px] lg:text-[38px] text-center mb-2 sm:mb-3 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"
          }`}>
          Powerful Study Tools
        </h2>
        <p className={`font-sans text-[13px] sm:text-[15px] lg:text-[16px] text-center mb-10 sm:mb-14 lg:mb-16 max-w-[600px] mx-auto px-2 ${isSpooky ? "text-purple-300/70" : "text-[#171d2b]/70"
          }`}>
          AI-powered features to transform your study materials into effective
          learning resources, all tracked on your personal dashboard.
        </p>
      </div>

      <div className="max-w-[900px] mx-auto space-y-8 sm:space-y-10">
        {features.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} isSpooky={isSpooky} />
        ))}
      </div>
    </section>
  );
}
