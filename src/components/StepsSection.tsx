"use client";

import { useRef, useState, useEffect } from "react";
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
  const headerRef = useRef<HTMLDivElement>(null);
  const desktopCardsRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(true);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fade in animation for header (both mobile and desktop)
  useGSAP(() => {
    if (!headerRef.current) return;
    
    gsap.fromTo(headerRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 90%",
          toggleActions: "play none none none",
        }
      }
    );
  }, { scope: sectionRef });

  // Mobile horizontal scroll refs
  const mobileScrollContainerRef = useRef<HTMLDivElement>(null);
  const mobileWrapperRef = useRef<HTMLDivElement>(null);

  // GSAP horizontal scroll for mobile
  useGSAP(() => {
    if (!isMobile) return;

    const scrollContainer = mobileScrollContainerRef.current;
    const wrapper = mobileWrapperRef.current;
    if (!scrollContainer || !wrapper) return;

    // Calculate scroll distance
    const getScrollAmount = () => {
      const containerWidth = wrapper.clientWidth || window.innerWidth;
      const totalScroll = scrollContainer.scrollWidth - containerWidth;
      return -totalScroll;
    };

    const scrollAmount = Math.abs(getScrollAmount());

    const tween = gsap.to(scrollContainer, {
      x: getScrollAmount,
      ease: "none",
      scrollTrigger: {
        trigger: wrapper,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        start: "top 15%",
        end: () => `+=${scrollAmount}`,
        invalidateOnRefresh: true,
      },
    });

    // Set z-index on pinned element immediately after creation
    if (tween.scrollTrigger?.pin) {
      (tween.scrollTrigger.pin as HTMLElement).style.zIndex = "10";
    }

    return () => {
      tween.scrollTrigger?.kill();
    };
  }, { scope: sectionRef, dependencies: [isMobile] });

  // Fade in animation for desktop cards
  useGSAP(() => {
    if (isMobile || !desktopCardsRef.current) return;
    
    const desktopCards = desktopCardsRef.current.querySelectorAll('.step-card-desktop');
    
    gsap.fromTo(desktopCards,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: desktopCardsRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        }
      }
    );
  }, { scope: sectionRef, dependencies: [isMobile] });

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
        <div className={`rounded-2xl p-5 ${isSpooky ? "bg-purple-900/40 border border-purple-500/30" : "bg-white/10 border border-white/20"}`}>
          {/* File upload mockup */}
          <div className={`border-2 border-dashed rounded-xl p-6 text-center ${isSpooky ? "border-purple-500/40" : "border-white/30"}`}>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 ${isSpooky ? "bg-purple-500" : "bg-white/20"}`}>
              <FileText className="w-7 h-7 text-white" />
            </div>
            <p className={`text-sm font-medium mb-1 ${isSpooky ? "text-purple-200" : "text-white/90"}`}>
              {isSpooky ? "Drop your scrolls here" : "Drop files here"}
            </p>
            <p className={`text-xs ${isSpooky ? "text-purple-300/60" : "text-white/50"}`}>
              PDF, DOCX, or paste text
            </p>
          </div>
          {/* Recent file indicator */}
          <div className={`mt-4 flex items-center gap-3 p-3 rounded-lg ${isSpooky ? "bg-purple-800/40" : "bg-white/10"}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSpooky ? "bg-purple-500/50" : "bg-white/20"}`}>
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`h-2.5 rounded-full mb-1.5 ${isSpooky ? "bg-purple-400/60" : "bg-white/40"}`} style={{ width: '75%' }} />
              <div className={`h-2 rounded-full ${isSpooky ? "bg-purple-400/30" : "bg-white/20"}`} style={{ width: '50%' }} />
            </div>
          </div>
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
        <div className={`rounded-2xl p-5 shadow-lg ${isSpooky ? "bg-purple-900/40 border border-purple-500/30" : "bg-white"}`}>
          {/* Window chrome */}
          <div className="flex items-center gap-1.5 mb-4">
            <div className={`w-3 h-3 rounded-full ${isSpooky ? "bg-purple-400" : "bg-red-400"}`} />
            <div className={`w-3 h-3 rounded-full ${isSpooky ? "bg-purple-300" : "bg-yellow-400"}`} />
            <div className={`w-3 h-3 rounded-full ${isSpooky ? "bg-purple-200" : "bg-green-400"}`} />
          </div>
          {/* AI status */}
          <div className={`flex items-center gap-2 mb-4 ${isSpooky ? "text-purple-200" : "text-[#171d2b]"}`}>
            <Brain className="w-5 h-5" />
            <span className="text-[13px] font-medium">{isSpooky ? "Conjuring knowledge..." : "AI Generating..."}</span>
          </div>
          {/* Progress bar */}
          <div className={`h-2 rounded-full mb-4 ${isSpooky ? "bg-purple-800/50" : "bg-gray-100"}`}>
            <div className={`h-full rounded-full ${isSpooky ? "bg-purple-400" : "bg-[#171d2b]"}`} style={{ width: '70%' }} />
          </div>
          {/* Generated items preview */}
          <div className="space-y-2">
            <div className={`flex items-center gap-2 p-2 rounded-lg ${isSpooky ? "bg-purple-800/50" : "bg-gray-50"}`}>
              <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${isSpooky ? "bg-purple-500 text-white" : "bg-[#171d2b] text-white"}`}>12</div>
              <span className={`text-xs ${isSpooky ? "text-purple-200" : "text-[#171d2b]"}`}>{isSpooky ? "Spells created" : "Flashcards created"}</span>
            </div>
            <div className={`flex items-center gap-2 p-2 rounded-lg ${isSpooky ? "bg-purple-800/50" : "bg-gray-50"}`}>
              <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${isSpooky ? "bg-purple-400 text-white" : "bg-gray-600 text-white"}`}>5</div>
              <span className={`text-xs ${isSpooky ? "text-purple-200" : "text-[#171d2b]"}`}>{isSpooky ? "Grimoire sections" : "Review sections"}</span>
            </div>
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
        <div className={`rounded-2xl p-5 ${isSpooky ? "bg-purple-800/40 border border-purple-500/30" : "bg-white/10 border border-white/20"}`}>
          {/* XP Progress */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSpooky ? "bg-purple-400 text-purple-900" : "bg-white text-[#171d2b]"}`}>
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isSpooky ? "text-purple-100" : "text-white"}`}>Level 7</p>
                <p className={`text-xs ${isSpooky ? "text-purple-300/70" : "text-white/60"}`}>1,250 XP</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${isSpooky ? "bg-purple-500 text-white" : "bg-white/20 text-white"}`}>
              +50 XP
            </div>
          </div>
          {/* XP bar */}
          <div className={`h-2 rounded-full mb-4 ${isSpooky ? "bg-purple-900/50" : "bg-white/20"}`}>
            <div className={`h-full rounded-full ${isSpooky ? "bg-purple-400" : "bg-white/70"}`} style={{ width: '65%' }} />
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: isSpooky ? "Streak" : "Streak", value: "7 days" },
              { label: isSpooky ? "Mastered" : "Mastered", value: "24" },
              { label: isSpooky ? "Sessions" : "Sessions", value: "42" },
            ].map((stat, i) => (
              <div key={i} className={`text-center p-2 rounded-lg ${isSpooky ? "bg-purple-900/40" : "bg-white/10"}`}>
                <p className={`text-sm font-bold ${isSpooky ? "text-purple-200" : "text-white"}`}>{stat.value}</p>
                <p className={`text-[10px] ${isSpooky ? "text-purple-300/60" : "text-white/50"}`}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <section ref={sectionRef} className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
      {/* Section Header */}
      <div ref={headerRef} className="text-center mb-10 sm:mb-12 lg:mb-16">
        <h2 className={`font-serif text-[28px] sm:text-[36px] lg:text-[44px] leading-[1.1] mb-3 sm:mb-4 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
          {isSpooky ? "Start Your Ritual" : "Simple Process"}
        </h2>
        <p className={`font-sans text-[14px] sm:text-[16px] max-w-[500px] mx-auto ${isSpooky ? "text-purple-300/70" : "text-[#171d2b]/60"}`}>
          {isSpooky ? "Three steps to unlock your potential" : "Three steps to your perfect study materials. It's really that easy."}
        </p>
      </div>

      {/* Mobile: Horizontal scroll cards */}
      <div ref={mobileWrapperRef} className="lg:hidden min-h-[420px] sm:min-h-[480px] flex items-center overflow-hidden -mx-4 sm:-mx-6">
        <div ref={mobileScrollContainerRef} className="flex gap-4 sm:gap-6 pl-4 sm:pl-6 pr-4 sm:pr-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step-card-mobile w-[85vw] sm:w-[70vw] md:w-[60vw] max-w-[500px] flex-shrink-0 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 relative overflow-hidden ${step.bgClass}`}
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
      </div>

      {/* Desktop: Sticky stacking cards */}
      <div ref={desktopCardsRef} className="hidden lg:block max-w-[900px] mx-auto relative" style={{ height: `${steps.length * 320 + 150}px` }}>
        {steps.map((step, index) => (
            <div
              key={index}
              className="step-card-desktop sticky mb-6"
              style={{ 
                top: `${100 + index * 24}px`,
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
