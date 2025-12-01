"use client";

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useThemeStore } from "@/lib/stores";

gsap.registerPlugin(ScrollTrigger);

interface Feature {
  title: string;
  description: string;
  steps: string[];
  icon: React.ReactNode;
  cardTitle: string;
}

const features: Feature[] = [
  {
    title: "Reviewer Maker",
    description: "Transform documents into organized notes with AI-extracted key terms and definitions.",
    steps: [
      "Upload PDF, DOCX, or paste text",
      "AI extracts key terms and definitions",
      "Choose mode: Full, Sentence, Keywords",
      "Export to PDF or DOCX",
    ],
    icon: (
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    cardTitle: "Reviewer Features",
  },
  {
    title: "Practice Test Maker",
    description: "Create relevant questions from your study materials to reinforce knowledge through active recall.",
    steps: [
      "Upload materials or paste text",
      "Choose question types or let AI decide",
      "Fine-tune with manual creation",
      "Save practice tests for later sessions",
    ],
    icon: (
      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    cardTitle: "Practice Test Features",
  },
  {
    title: "Flashcard Maker",
    description: "Extract key terms and definitions to create flashcard sets for spaced repetition.",
    steps: [
      "Process text, PDF, or DOCX files",
      "AI identifies terms and definitions",
      "Create custom flashcards manually",
      "Save and organize flashcard sets",
    ],
    icon: (
      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    cardTitle: "Flashcard Features",
  },
  {
    title: "Pomodoro Focus Timer",
    description: "Customizable timers with streak tracking and task integration for deep focus.",
    steps: [
      "Set custom focus and break lengths",
      "Track daily streaks for consistency",
      "Link sessions to specific tasks",
      "Review session history",
    ],
    icon: (
      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    cardTitle: "Pomodoro Features",
  },
];


function FeatureCard({ feature, isSpooky }: { feature: Feature; isSpooky: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
          end: "top 20%",
          toggleActions: "play none none reverse",
        },
      });

      tl.from(textRef.current, {
        x: -60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      tl.from(
        visualRef.current,
        {
          x: 60,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.5"
      );

      tl.from(
        textRef.current?.querySelectorAll("li") || [],
        {
          x: -20,
          opacity: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.4"
      );
    }, cardRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`flex flex-col lg:flex-row items-center gap-5 lg:gap-8 p-4 rounded-2xl transition-colors duration-300 ${
        isSpooky ? "hover:bg-purple-500/10" : "hover:bg-white/50"
      }`}
    >
      <div ref={textRef} className="flex-1 order-2 lg:order-1">
        <h3 className={`font-sans font-semibold text-[17px] sm:text-[19px] mb-2 ${
          isSpooky ? "text-purple-100" : "text-[#171d2b]"
        }`}>
          {feature.title}
        </h3>
        <p className={`font-sans text-[13px] sm:text-[14px] leading-[1.5] mb-3 ${
          isSpooky ? "text-purple-300/70" : "text-[#171d2b]/70"
        }`}>
          {feature.description}
        </p>
        <ul className="space-y-1">
          {feature.steps.map((step, i) => (
            <li
              key={i}
              className={`flex items-center gap-2 text-[12px] sm:text-[13px] ${
                isSpooky ? "text-purple-300/70" : "text-[#171d2b]/70"
              }`}
            >
              <span className={isSpooky ? "text-purple-400" : "text-[#171d2b]"}>→</span> {step}
            </li>
          ))}
        </ul>
      </div>

      <div
        ref={visualRef}
        className={`w-full lg:w-[340px] flex-shrink-0 rounded-[18px] p-4 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] order-1 lg:order-2 ${
          isSpooky ? "bg-purple-500/15 border border-purple-500/20" : "bg-[rgba(210,210,200,0.55)]"
        }`}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isSpooky ? "bg-purple-600" : "bg-[#171d2b]"
          }`}>
            {feature.icon}
          </div>
          <span className={`font-sans font-medium text-[14px] sm:text-[15px] ${
            isSpooky ? "text-purple-100" : "text-[#171d2b]"
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
  const bgLighterClass = isSpooky ? "bg-purple-600/50" : "bg-[#171d2b]/50";

  if (feature.title === "Reviewer Maker") {
    return (
      <div className="space-y-3">
        <div className={`flex items-center justify-between py-2 border-b ${borderClass}`}>
          <span className={`font-sans text-[12px] sm:text-[13px] ${textClass}`}>AI Term Extraction</span>
          <div className={`w-9 h-5 ${bgClass} rounded-full relative`}><div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" /></div>
        </div>
        <div className={`flex items-center justify-between py-2 border-b ${borderClass}`}>
          <span className={`font-sans text-[12px] sm:text-[13px] ${textClass}`}>Category Grouping</span>
          <div className={`w-9 h-5 ${bgClass} rounded-full relative`}><div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" /></div>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className={`font-sans text-[12px] sm:text-[13px] ${textClass}`}>Mode:</span>
          <div className="flex gap-1">
            <span className={`px-2 py-0.5 ${bgClass} text-white text-[10px] sm:text-[11px] rounded`}>Full</span>
            <span className={`px-2 py-0.5 ${bgLightClass} text-white text-[10px] sm:text-[11px] rounded`}>Sentence</span>
            <span className={`px-2 py-0.5 ${bgLighterClass} text-white text-[10px] sm:text-[11px] rounded`}>Keywords</span>
          </div>
        </div>
      </div>
    );
  }

  if (feature.title === "Practice Test Maker") {
    return (
      <div className="space-y-2">
        <div className={`flex items-center justify-between py-1.5 border-b ${borderClass}`}>
          <span className={`font-sans text-[11px] sm:text-[12px] ${textClass}`}>Auto Question Count</span>
          <div className={`w-8 h-4 ${bgClass} rounded-full relative`}><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" /></div>
        </div>
        <div className={`flex items-center justify-between py-1.5 border-b ${borderClass}`}>
          <span className={`font-sans text-[11px] sm:text-[12px] ${textClass}`}>Verbatim Mode</span>
          <div className={`w-8 h-4 ${bgClass} rounded-full relative`}><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" /></div>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className={`font-sans text-[11px] sm:text-[12px] ${textClass}`}>Input:</span>
          <div className="flex gap-1">
            <span className={`px-1.5 py-0.5 ${bgClass} text-white text-[9px] sm:text-[10px] rounded`}>Auto</span>
            <span className={`px-1.5 py-0.5 ${bgLightClass} text-white text-[9px] sm:text-[10px] rounded`}>Manual</span>
          </div>
        </div>
      </div>
    );
  }

  if (feature.title === "Flashcard Maker") {
    return (
      <div className="space-y-2">
        <div className={`flex items-center justify-between py-1.5 border-b ${borderClass}`}>
          <span className={`font-sans text-[11px] sm:text-[12px] ${textClass}`}>AI Term Extraction</span>
          <div className={`w-8 h-4 ${bgClass} rounded-full relative`}><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" /></div>
        </div>
        <div className={`flex items-center justify-between py-1.5 border-b ${borderClass}`}>
          <span className={`font-sans text-[11px] sm:text-[12px] ${textClass}`}>Manual Card Creation</span>
          <div className={`w-8 h-4 ${bgClass} rounded-full relative`}><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" /></div>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className={`font-sans text-[11px] sm:text-[12px] ${textClass}`}>Input:</span>
          <div className="flex gap-1">
            <span className={`px-1.5 py-0.5 ${bgClass} text-white text-[9px] sm:text-[10px] rounded`}>TXT</span>
            <span className={`px-1.5 py-0.5 ${bgClass} text-white text-[9px] sm:text-[10px] rounded`}>PDF</span>
            <span className={`px-1.5 py-0.5 ${bgClass} text-white text-[9px] sm:text-[10px] rounded`}>DOCX</span>
          </div>
        </div>
      </div>
    );
  }

  // Pomodoro Focus Timer
  return (
    <div className="space-y-2">
      <div className={`flex items-center gap-2 py-1.5 border-b ${borderClass}`}>
        <span className={`font-sans text-[11px] sm:text-[12px] ${textClass}`}>3-day streak</span>
        <div className={`ml-auto w-12 h-1 ${bgClass} rounded-full`} />
      </div>
      <div className={`flex items-center justify-between py-1.5 border-b ${borderClass}`}>
        <span className={`font-sans text-[11px] sm:text-[12px] ${textClass}`}>Timers</span>
        <div className="flex gap-1">
          <span className={`px-1.5 py-0.5 ${bgClass} text-white text-[9px] sm:text-[10px] rounded`}>25:00</span>
          <span className={`px-1.5 py-0.5 ${bgLightClass} text-white text-[9px] sm:text-[10px] rounded`}>5:00</span>
          <span className={`px-1.5 py-0.5 ${bgLighterClass} text-white text-[9px] sm:text-[10px] rounded`}>15:00</span>
        </div>
      </div>
      <div className="flex items-center gap-2 py-1.5">
        <svg className={`w-3.5 h-3.5 ${isSpooky ? "text-purple-400" : "text-[#171d2b]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className={`font-sans text-[11px] sm:text-[12px] ${textClass}`}>Todo & Task Integration</span>
      </div>
    </div>
  );
}

export default function FeaturesShowcase() {
  const theme = useThemeStore((state) => state.theme);
  const isSpooky = theme === "spooky";
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current?.children || [], {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20"
    >
      <div ref={headerRef}>
        <h2 className={`font-serif text-[24px] sm:text-[32px] lg:text-[38px] text-center mb-2 sm:mb-3 ${
          isSpooky ? "text-purple-100" : "text-[#171d2b]"
        }`}>
          Powerful Study Tools
        </h2>
        <p className={`font-sans text-[13px] sm:text-[15px] lg:text-[16px] text-center mb-10 sm:mb-14 lg:mb-16 max-w-[600px] mx-auto px-2 ${
          isSpooky ? "text-purple-300/70" : "text-[#171d2b]/70"
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
