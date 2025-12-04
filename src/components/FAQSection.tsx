"use client";

import { useState, useRef } from "react";
import { useThemeStore } from "@/lib/stores";
import { Plus, X, HelpCircle } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

interface FAQItem {
  question: string;
  questionSpooky: string;
  answer: string;
  answerSpooky: string;
}

function AccordionItem({ 
  item, 
  isOpen, 
  onToggle, 
  isSpooky 
}: { 
  item: FAQItem; 
  isOpen: boolean; 
  onToggle: () => void;
  isSpooky: boolean;
}) {
  return (
    <div className={`border-b transition-colors ${
      isSpooky ? "border-purple-500/20" : "border-[#171d2b]/10"
    }`}>
      <button
        onClick={onToggle}
        className={`w-full py-5 sm:py-6 flex items-center justify-between gap-4 text-left transition-colors group`}
      >
        <span className={`font-sans font-medium text-[15px] sm:text-[17px] lg:text-[18px] pr-4 transition-colors ${
          isSpooky 
            ? (isOpen ? "text-purple-400" : "text-purple-100 group-hover:text-purple-300") 
            : (isOpen ? "text-[#171d2b]" : "text-[#171d2b]/80 group-hover:text-[#171d2b]")
        }`}>
          {isSpooky ? item.questionSpooky : item.question}
        </span>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
          isOpen 
            ? (isSpooky ? "bg-purple-600 text-white" : "bg-[#171d2b] text-white")
            : (isSpooky ? "bg-purple-500/20 text-purple-400" : "bg-[#171d2b]/10 text-[#171d2b]/40")
        }`}>
          {isOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-out ${
        isOpen ? "max-h-[500px] opacity-100 pb-5 sm:pb-6" : "max-h-0 opacity-0"
      }`}>
        <p className={`font-sans text-[14px] sm:text-[15px] leading-[1.7] pr-12 ${
          isSpooky ? "text-purple-300/70" : "text-[#171d2b]/60"
        }`}>
          {isSpooky ? item.answerSpooky : item.answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const theme = useThemeStore((state) => state.theme);
  const isSpooky = theme === "spooky";
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement>(null);

  const faqs: FAQItem[] = [
    {
      question: "How does DeepTerm generate flashcards?",
      questionSpooky: "How does the AI sorcery work?",
      answer: "DeepTerm uses Google's Gemini AI to analyze your uploaded PDFs or pasted text. It identifies key concepts, definitions, and important terms, then automatically generates flashcards and reviewer notes tailored to your content.",
      answerSpooky: "We summon the power of Google's Gemini AI to analyze your scrolls and tomes. It extracts the forbidden knowledge, identifies key incantations, and conjures flashcards from the academic void.",
    },
    {
      question: "Is DeepTerm really free?",
      questionSpooky: "Is this actually free or is there a catch?",
      answer: "Yes! DeepTerm is completely free to use. You get 10 AI generations per day, which resets daily. There's no credit card required, no hidden fees, and no premium tier that locks essential features.",
      answerSpooky: "No cap, it's actually free. You get 10 AI summons per day. No soul contracts, no hidden curses, no premium tier gatekeeping the good stuff. We're built different.",
    },
    {
      question: "What file formats are supported?",
      questionSpooky: "What kind of notes can I upload?",
      answer: "DeepTerm supports PDF files and plain text. You can either upload a PDF document or paste text directly into the editor. We're working on adding support for more formats like DOCX and images.",
      answerSpooky: "PDFs and raw text are your weapons of choice. Drop a PDF or paste your notes directly. We're cooking up support for more formats - DOCX and images are coming to the ritual soon.",
    },
    {
      question: "How does the gamification system work?",
      questionSpooky: "How do I level up and earn XP?",
      answer: "Every study action earns you XP - completing flashcard sessions, taking practice tests, maintaining study streaks, and more. As you accumulate XP, you level up and unlock achievements that track your learning milestones.",
      answerSpooky: "Every grind session earns XP - flip cards, crush tests, maintain your streak. Stack enough XP and you level up, unlocking Soul Trophies that flex your dedication. It's basically a game, but you actually learn stuff.",
    },
    {
      question: "Can I share my study materials?",
      questionSpooky: "Can I share my decks with friends?",
      answer: "Absolutely! You can generate shareable links for any of your flashcard decks or reviewers. Anyone with the link can view and study from your materials without needing an account.",
      answerSpooky: "For sure. Generate a curse link for any deck or grimoire. Anyone with the link can access your knowledge without selling their soul (no account needed). Study together, dominate together.",
    },
  ];

  // Fade in animation
  useGSAP(() => {
    if (!sectionRef.current) return;

    const leftCol = sectionRef.current.querySelector('.faq-left');
    const rightCol = sectionRef.current.querySelector('.faq-right');

    if (leftCol) {
      gsap.fromTo(leftCol,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          }
        }
      );
    }

    if (rightCol) {
      gsap.fromTo(rightCol,
        { opacity: 0, x: 30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          delay: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          }
        }
      );
    }
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          
          {/* Left Column - Title & Support */}
          <div className="faq-left lg:w-[320px] flex-shrink-0">
            {/* Support Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium mb-6 ${
              isSpooky ? "bg-purple-500/20 text-purple-300" : "bg-[#171d2b]/5 text-[#171d2b]/60"
            }`}>
              <HelpCircle className="w-3.5 h-3.5" />
              {isSpooky ? "Dark Knowledge" : "Support"}
            </div>

            {/* Title */}
            <h2 className={`font-serif text-[32px] sm:text-[40px] lg:text-[48px] leading-[1.1] mb-4 ${
              isSpooky ? "text-purple-100" : "text-[#171d2b]"
            }`}>
              {isSpooky ? "Frequently" : "Frequently"}<br />
              <span className={isSpooky ? "text-purple-400" : "text-[#171d2b]/60"}>
                {isSpooky ? "Summoned." : "Asked."}
              </span>
            </h2>

            {/* Description */}
            <p className={`font-sans text-[14px] sm:text-[15px] leading-relaxed ${
              isSpooky ? "text-purple-300/70" : "text-[#171d2b]/60"
            }`}>
              {isSpooky 
                ? "Everything you need to know about wielding DeepTerm."
                : "Everything you need to know about using DeepTerm."}
            </p>
          </div>

          {/* Right Column - Accordion */}
          <div className="faq-right flex-1">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                item={faq}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                isSpooky={isSpooky}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
