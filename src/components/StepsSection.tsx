"use client";

import { useRef } from "react";
import { useThemeStore } from "@/lib/stores";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FileText, Brain, Gamepad2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function StepsSection() {
  const theme = useThemeStore((state) => state.theme);
  const isSpooky = theme === "spooky";
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Fade in animation for mobile cards only
  useGSAP(() => {
    if (!cardsContainerRef.current) return;
    
    const mobileCards = cardsContainerRef.current.querySelectorAll('.step-card-mobile');
    
    gsap.fromTo(mobileCards,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardsContainerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        }
      }
    );
  }, { scope: sectionRef });

  const steps = [
    {
      number: "01",
      title: isSpooky ? "Drop Your Notes" : "Start Editing",
      description: isSpooky 
        ? "Toss in PDFs, docs, or just paste your stuff. We accept all forms of academic chaos."
        : "Jump straight into the editor. Upload your PDFs or paste text directly. No account required to start.",
      bgClass: isSpooky ? "bg-[#1a0a2e]" : "bg-[#171d2b]",
      numberClass: isSpooky ? "text-purple-500/50" : "text-white/20",
      visual: (
        <div className={`rounded-2xl p-4 sm:p-6 ${isSpooky ? "bg-purple-900/60 border border-purple-500/30" : "bg-white/10 border border-white/20"}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isSpooky ? "bg-purple-500" : "bg-white/30"}`}>
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className={`h-3 rounded-full mb-3 ${isSpooky ? "bg-purple-400/70" : "bg-white/30"}`} style={{ width: '80%' }} />
          <div className={`h-3 rounded-full ${isSpooky ? "bg-purple-400/50" : "bg-white/20"}`} style={{ width: '60%' }} />
        </div>
      ),
    },
    {
      number: "02",
      title: isSpooky ? "AI Does Its Thing" : "AI Magic",
      description: isSpooky 
        ? "We pull out the key stuff, make quizzes, and build flashcards. Magic, basically."
        : "Use AI to generate flashcards and reviewers. Just tell it what to do.",
      bgClass: isSpooky ? "bg-[#2d1b4e]" : "bg-[#2a3347]",
      numberClass: isSpooky ? "text-purple-400/50" : "text-white/20",
      visual: (
        <div className="rounded-2xl p-4 sm:p-6 shadow-lg bg-white">
          <div className="flex items-center gap-1.5 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className={`flex items-center gap-2 mb-3 ${isSpooky ? "text-purple-600" : "text-[#171d2b]"}`}>
            <Brain className="w-5 h-5" />
            <span className="text-[13px] font-medium">AI Generating...</span>
          </div>
          <div className={`h-2 rounded-full ${isSpooky ? "bg-purple-100" : "bg-gray-100"}`}>
            <div className={`h-full rounded-full ${isSpooky ? "bg-purple-500" : "bg-[#171d2b]"}`} style={{ width: '70%' }} />
          </div>
        </div>
      ),
    },
    {
      number: "03",
      title: isSpooky ? "Grind & Level Up" : "Study & Succeed",
      description: isSpooky 
        ? "Practice, track your stats, and watch your XP grow. Become unstoppable."
        : "Create a free account to save your work and track your progress with gamified learning.",
      bgClass: isSpooky ? "bg-[#4a2c7a]" : "bg-[#3d4a5f]",
      numberClass: isSpooky ? "text-purple-300/50" : "text-white/20",
      visual: (
        <div className="flex flex-col items-center gap-3">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isSpooky ? "bg-purple-400 text-purple-900" : "bg-white text-[#171d2b]"}`}>
            <Gamepad2 className="w-7 h-7" />
          </div>
          <div className={`px-4 py-2 rounded-full text-[13px] font-medium flex items-center gap-2 ${isSpooky ? "bg-white text-purple-700" : "bg-white text-[#171d2b] shadow-md"}`}>
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Ready to Study
          </div>
        </div>
      ),
    },
  ];

  return (
    <section ref={sectionRef} className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
      {/* Section Header */}
      <div className="text-center mb-10 sm:mb-12 lg:mb-16">
        <h2 className={`font-serif text-[28px] sm:text-[36px] lg:text-[44px] leading-[1.1] mb-3 sm:mb-4 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
          {isSpooky ? "Start Your Ritual" : "Simple Process"}
        </h2>
        <p className={`font-sans text-[14px] sm:text-[16px] max-w-[500px] mx-auto ${isSpooky ? "text-purple-300/70" : "text-[#171d2b]/60"}`}>
          {isSpooky ? "Three steps to unlock your potential" : "Three steps to your perfect study materials. It's really that easy."}
        </p>
      </div>

      {/* Mobile: Simple stacked cards */}
      <div ref={cardsContainerRef} className="lg:hidden max-w-[900px] mx-auto flex flex-col gap-5 sm:gap-6">
        {steps.map((step, index) => (
            <div
              key={index}
              className={`step-card-mobile rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 relative overflow-hidden ${step.bgClass}`}
            >
              <div className="flex flex-col gap-6">
                <div className="flex-1">
                  <span className={`font-serif text-[60px] sm:text-[80px] font-light leading-none block ${step.numberClass}`}>
                    {step.number}
                  </span>
                  <h3 className="font-serif font-semibold text-[24px] sm:text-[28px] mt-2 mb-3 text-white">
                    {step.title}
                  </h3>
                  <p className="font-sans text-[14px] sm:text-[15px] leading-relaxed max-w-[400px] text-white/80">
                    {step.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {step.visual}
                </div>
              </div>
            </div>
        ))}
      </div>

      {/* Desktop: Sticky stacking cards */}
      <div className="hidden lg:block max-w-[900px] mx-auto relative" style={{ height: `${steps.length * 280 + 100}px` }}>
        {steps.map((step, index) => (
            <div
              key={index}
              className="sticky"
              style={{ 
                top: `${100 + index * 20}px`,
                zIndex: 10 + index,
              }}
            >
              <div
                className={`rounded-[32px] p-10 relative overflow-hidden shadow-2xl ${step.bgClass}`}
              >
                <div className="flex flex-row items-center justify-between gap-10">
                  <div className="flex-1">
                    <span className={`font-serif text-[100px] font-light leading-none block ${step.numberClass}`}>
                      {step.number}
                    </span>
                    <h3 className="font-serif font-semibold text-[32px] mt-2 mb-3 text-white">
                      {step.title}
                    </h3>
                    <p className="font-sans text-[15px] leading-relaxed max-w-[400px] text-white/80">
                      {step.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-[320px]">
                    {step.visual}
                  </div>
                </div>
              </div>
            </div>
        ))}
      </div>
    </section>
  );
}
