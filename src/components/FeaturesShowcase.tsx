"use client";

import { useThemeStore } from "@/lib/stores";
import {
  Library,
  BrainCircuit,
  Copy,
  FileText,
  Ghost,
  Zap,
  ScanLine,
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Skull,
  Calendar
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

interface Feature {
  id: string;
  title: string;
  description: string;
  visual: React.ReactNode;
}

export default function FeaturesShowcase() {
  const theme = useThemeStore((state) => state.theme);
  const isSpooky = theme === "spooky";
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(true); // Default to mobile for SSR

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useGSAP(() => {
    // Skip GSAP horizontal scroll on mobile/tablet - use native vertical scroll instead
    if (isMobile) return;

    const scrollContainer = scrollContainerRef.current;
    const container = containerRef.current;
    if (!scrollContainer || !container) return;

    // Calculate scroll distance based on content - limit to reasonable amount
    const getScrollAmount = () => {
      const containerWidth = scrollContainer.parentElement?.clientWidth || window.innerWidth;
      const totalScroll = scrollContainer.scrollWidth - containerWidth;
      return -totalScroll;
    };

    // Get the actual scroll amount for end calculation
    const scrollAmount = Math.abs(getScrollAmount());
    
    const tween = gsap.to(scrollContainer, {
      x: getScrollAmount,
      ease: "none",
      scrollTrigger: {
        trigger: container,
        pin: true,
        scrub: 1,
        start: "top 10%",
        end: () => `+=${scrollAmount}`,
        invalidateOnRefresh: true,
      },
    });

    // Refresh on resize for zoom handling
    const handleResize = () => {
      // Kill animation if resized to mobile
      if (window.innerWidth < 1024) {
        tween.scrollTrigger?.kill();
        gsap.set(scrollContainer, { x: 0 });
        setIsMobile(true);
      } else {
        setIsMobile(false);
        ScrollTrigger.refresh();
      }
    };
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      tween.scrollTrigger?.kill();
    };
  }, { scope: containerRef, dependencies: [isMobile] });

  const features: Feature[] = [
    {
      id: "03",
      title: "Immersive Study Modes",
      description: "Engage with your materials through diverse modes. Use 'Spooky Mode' to focus with a flashlight interface, or challenge yourself with 'Match Mode' for speed.",
      visual: <SpookyLearnVisual isSpooky={isSpooky} />
    },
    {
      id: "00",
      title: "Materials Hub",
      description: "Complete control over your study assets. Edit terms directly, organize reviewers into color-coded categories, and reorder flashcards with simple drag & drop. Manage your knowledge base with precision.",
      visual: <MaterialsVisual isSpooky={isSpooky} />
    },
    {
      id: "01",
      title: "Intelligent Content Summarization",
      description: "Transform dense lecture notes into structured reviewers. Our AI extracts key concepts and definitions, creating concise summaries tailored to your learning needs.",
      visual: <ReviewerVisual isSpooky={isSpooky} />
    },
    {
      id: "04",
      title: "Persistent Focus Timer",
      description: "Stay in the zone with a timer that follows you. Whether you're reviewing notes or taking a practice test, your Pomodoro session persists across pages.",
      visual: <TimerVisual isSpooky={isSpooky} />
    },
    {
      id: "05",
      title: "Gamified Achievements",
      description: "Level up your learning. Earn 'Soul Trophies' and XP for every study session, streak, and mastered deck. Make progress addictive.",
      visual: <AchievementsVisual isSpooky={isSpooky} />
    },
    {
      id: "06",
      title: "Study Progress Calendar",
      description: "Visualize your consistency. Track your daily study activity with a contribution graph and maintain your streak to build lasting habits.",
      visual: <CalendarVisual isSpooky={isSpooky} />
    },
    {
      id: "07",
      title: "Seamless Sharing",
      description: "Collaborate with peers. Share your flashcard decks and reviewers instantly via link. Study together, even when you're apart.",
      visual: <ShareVisual isSpooky={isSpooky} />
    },
  ];

  // Refs for fade-in animations
  const mobileSectionRef = useRef<HTMLElement>(null);
  const mobileHeaderRef = useRef<HTMLDivElement>(null);
  const mobileCardsRef = useRef<HTMLDivElement>(null);
  const desktopTitleRef = useRef<HTMLDivElement>(null);

  // Fade-in animation for mobile section
  useGSAP(() => {
    if (!isMobile) return;
    
    // Animate header
    if (mobileHeaderRef.current) {
      gsap.fromTo(mobileHeaderRef.current, 
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: mobileHeaderRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          }
        }
      );
    }

    // Animate cards with stagger
    if (mobileCardsRef.current) {
      const cards = mobileCardsRef.current.querySelectorAll('.feature-card');
      gsap.fromTo(cards, 
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: mobileCardsRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          }
        }
      );
    }
  }, { dependencies: [isMobile] });

  // Fade-in animation for desktop section
  useGSAP(() => {
    if (isMobile || !desktopTitleRef.current) return;
    
    gsap.fromTo(desktopTitleRef.current,
      { opacity: 0, x: -40 },
      {
        opacity: 1,
        x: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: desktopTitleRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        }
      }
    );
  }, { dependencies: [isMobile] });

  return (
    <>
      {/* Mobile/Tablet: Vertical scroll layout - shown below lg breakpoint */}
      <section ref={mobileSectionRef} className="lg:hidden relative pt-4 pb-12 sm:pt-6 sm:pb-16 px-4 sm:px-6">
        {/* Section Header */}
        <div ref={mobileHeaderRef} className="text-center mb-8 sm:mb-12">
          <h2 className={`font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.1] mb-4 ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>
            What you&apos;ll unlock <br />
            <span className={isSpooky ? "text-purple-400" : "text-[#171d2b]"} style={{ fontStyle: 'italic' }}>with Deepterm</span>
          </h2>
          <p className={`font-sans text-base sm:text-lg max-w-md mx-auto ${isSpooky ? "text-gray-400" : "text-[#171d2b]/60"}`}>
            A complete ecosystem of tools designed to transform your study workflow from chaotic to structured.
          </p>
        </div>

        {/* Vertical Feature Cards */}
        <div ref={mobileCardsRef} className="flex flex-col gap-8 sm:gap-10 max-w-2xl mx-auto">
          {features.map((feature) => (
            <div key={feature.id} className="feature-card">
              <div className="flex flex-col gap-3">
                {/* Header */}
                <h3 className={`font-sans font-bold text-lg sm:text-xl ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>
                  {feature.title}
                </h3>

                {/* Visual Container */}
                <div className={`w-full aspect-[16/10] rounded-lg overflow-hidden border relative ${
                  isSpooky 
                    ? "bg-[#0d0f14] border-white/10" 
                    : "bg-gray-50 border-gray-200"
                }`}>
                  {feature.visual}
                </div>

                {/* Description */}
                <p className={`font-sans text-sm leading-relaxed ${
                  isSpooky ? "text-gray-400" : "text-gray-600"
                }`}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Desktop: Horizontal scroll layout with GSAP - shown at lg breakpoint and above */}
      <section ref={containerRef} className="hidden lg:flex relative min-h-[600px] h-[80vh] max-h-[900px] items-center overflow-hidden">
        {/* Left Side: Sticky Title */}
        <div ref={desktopTitleRef} className="w-[320px] xl:w-[380px] flex-shrink-0 pl-8 xl:pl-16 pr-4 z-10">
          <h2 className={`font-serif text-4xl xl:text-5xl leading-[1.1] mb-4 ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>
            What you&apos;ll unlock with<br />
            <span className={isSpooky ? "text-purple-400" : "text-[#171d2b]"} style={{ fontStyle: 'italic' }}>Deepterm</span>
          </h2>
          <p className={`font-sans text-base xl:text-lg max-w-sm ${isSpooky ? "text-gray-400" : "text-[#171d2b]/60"}`}>
            A complete ecosystem of tools designed to transform your study workflow from chaotic to structured.
          </p>
        </div>

        {/* Right Side: Horizontal Scroll Track */}
        <div className="flex-1 h-full flex items-center overflow-hidden">
          <div ref={scrollContainerRef} className="flex gap-8 py-12">
            {features.map((feature) => (
              <div key={feature.id} className="feature-card w-[700px] flex-shrink-0">
                <div className="flex flex-col gap-4">
                  {/* Header - Title always visible */}
                  <div className="flex-shrink-0 py-2">
                    <h3 className={`font-sans font-bold text-2xl ${isSpooky ? "text-white" : "text-[#171d2b]"}`}>
                      {feature.title}
                    </h3>
                  </div>

                  {/* Visual Container */}
                  <div className={`w-full aspect-[16/10] rounded-lg overflow-hidden border relative ${
                    isSpooky 
                      ? "bg-[#0d0f14] border-white/10" 
                      : "bg-gray-50 border-gray-200"
                  }`}>
                    {feature.visual}
                  </div>

                  {/* Description */}
                  <p className={`font-sans text-base leading-relaxed max-w-2xl ${
                    isSpooky ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function MaterialsVisual({ isSpooky }: { isSpooky: boolean }) {
  return (
    <div className="w-full h-full p-6 flex items-center justify-center">
      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
        {[
          { title: "Biology 101: Cell Structure", type: "Reviewer", count: 12, date: "2h ago" },
          { title: "Chemistry Finals Deck", type: "Flashcards", count: 45, date: "5h ago" },
          { title: "History: World War II", type: "Reviewer", count: 8, date: "1d ago" },
          { title: "Physics Formulas", type: "Flashcards", count: 24, date: "2d ago" },
        ].map((item, i) => (
          <div key={i} className={`rounded-xl p-4 border transition-all cursor-pointer group relative ${
            isSpooky 
              ? "bg-[#151821] border-purple-500/10 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10" 
              : "bg-white border-[#171d2b]/5 hover:border-[#171d2b]/20 hover:shadow-lg"
          }`}>
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider flex items-center gap-1 ${
                item.type === "Reviewer"
                  ? (isSpooky ? "bg-purple-600 text-white" : "bg-[#171d2b] text-white")
                  : (isSpooky ? "bg-purple-500/20 text-purple-300" : "bg-[#171d2b]/10 text-[#171d2b]")
              }`}>
                {item.type === "Reviewer" ? <FileText size={10} /> : <Copy size={10} />}
                {item.type === "Flashcards" ? (isSpooky ? "Spells" : "Cards") : (isSpooky ? "Grimoire" : "Reviewer")} · {item.count}
              </span>
              <div className={`p-1 rounded-full ${isSpooky ? "text-purple-300/30" : "text-[#171d2b]/30"}`}>
                <GripVertical size={14} />
              </div>
            </div>
            <div className="mb-3">
              <h3 className={`font-sans font-semibold text-sm line-clamp-2 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
                {item.title}
              </h3>
            </div>
            <div className={`flex items-center text-xs ${isSpooky ? "text-purple-300/40" : "text-[#171d2b]/40"}`}>
              <div className="flex items-center gap-1">
                <ScanLine size={12} />
                <span>{item.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewerVisual({ isSpooky }: { isSpooky: boolean }) {
  return (
    <div className="w-full h-full p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-4">
        {[
          { name: "Cell Biology", count: 12, color: "#22c55e", expanded: true },
          { name: "Genetics", count: 8, color: "#3b82f6", expanded: false },
        ].map((category, i) => (
          <div
            key={i}
            className={`rounded-xl border overflow-hidden shadow-sm ${
              isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-[#171d2b]/10"
            }`}
          >
            <div
              className={`p-4 flex items-center justify-between cursor-pointer ${
                isSpooky ? "hover:bg-purple-500/5" : "hover:bg-gray-50"
              }`}
              style={{ borderLeft: `4px solid ${isSpooky ? "#a855f7" : category.color}` }}
            >
              <div className="flex items-center gap-4">
                <h3 className={`font-sora font-semibold ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{category.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  isSpooky ? "bg-purple-500/20 text-purple-300" : "bg-[#171d2b]/5 text-[#171d2b]/60"
                }`}>
                  {category.count} {isSpooky ? "incantations" : "terms"}
                </span>
              </div>
              <div className={`flex items-center gap-2 ${isSpooky ? "text-purple-400" : "text-[#171d2b]/40"}`}>
                <Plus size={16} />
                <Trash2 size={16} />
              </div>
            </div>
            {category.expanded && (
              <div className={`border-t ${isSpooky ? "border-purple-500/10" : "border-[#171d2b]/5"}`}>
                <div className="p-4 grid gap-3">
                  {[
                    { term: "Mitosis", def: "Process of nuclear division in eukaryotic cells." },
                    { term: "Meiosis", def: "Type of cell division that reduces chromosome number." }
                  ].map((term, j) => (
                    <div key={j} className={`p-3 rounded-lg border flex justify-between items-start ${
                      isSpooky ? "bg-[#0d0f14] border-purple-500/10" : "bg-[#f8f9fa] border-[#171d2b]/5"
                    }`}>
                      <div>
                        <h4 className={`font-bold text-sm mb-1 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>{term.term}</h4>
                        <p className={`text-xs ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>{term.def}</p>
                      </div>
                      <div className={`opacity-50 ${isSpooky ? "text-purple-400" : "text-[#171d2b]"}`}>
                        <Edit2 size={12} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SpookyLearnVisual({ isSpooky }: { isSpooky: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`w-full h-full relative overflow-hidden cursor-none flex items-center justify-center p-8 ${isSpooky ? "bg-black" : "bg-gray-900"}`}
    >
      <div 
        className="absolute inset-0 flex items-center justify-center p-8"
        style={{
          maskImage: `radial-gradient(circle 250px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle 250px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
        }}
      >
        <div className={`w-full max-w-2xl rounded-3xl border p-8 flex flex-col gap-6 ${
          isSpooky ? "bg-[#1a1b26] border-purple-500/20" : "bg-white border-gray-200"
        }`}>
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${isSpooky ? "text-purple-400/70" : "text-gray-500"}`}>
              {isSpooky ? "Dark Knowledge" : "Definition"}
            </span>
            <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${
              isSpooky ? "bg-purple-900/50 text-purple-300" : "bg-pink-100 text-pink-600"
            }`}>
              <div className={`w-2 h-2 rounded-full border-2 ${isSpooky ? "border-purple-400" : "border-pink-600"}`} />
              {isSpooky ? "New spell" : "New cards"}
            </span>
          </div>

          <p className={`text-xl font-sora font-medium leading-relaxed ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
            Process of nuclear division in eukaryotic cells that occurs when a parent cell divides to produce two identical daughter cells.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {["Meiosis", "Mitosis", "Cytokinesis", "Interphase"].map((opt, i) => (
              <div key={i} className={`p-4 border rounded-2xl flex items-center gap-4 ${
                isSpooky 
                  ? "bg-[#1a1b26] border-purple-500/30 text-purple-100" 
                  : "bg-white border-gray-200 text-[#171d2b]"
              }`}>
                <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm ${
                  isSpooky ? "bg-purple-900/50 text-purple-300" : "bg-blue-100 text-blue-600"
                }`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="font-medium">{opt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <p className="text-white/20 font-mono text-sm uppercase tracking-[0.2em]">Move cursor to reveal</p>
      </div>

      <div 
        className="absolute w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
        style={{ left: mousePos.x, top: mousePos.y }}
      />
    </div>
  );
}

function TimerVisual({ isSpooky }: { isSpooky: boolean }) {
  return (
    <div className="w-full h-full p-8 flex items-center justify-center">
      <div className={`relative w-full max-w-[320px] aspect-square rounded-[32px] p-6 text-center text-white overflow-hidden flex flex-col items-center justify-between ${
        isSpooky ? "bg-gradient-to-br from-purple-900 to-purple-950" : "bg-[#171d2b]"
      }`}>
        {/* Phase Indicators */}
        <div className="flex gap-2 relative z-10 w-full justify-center">
          {["Summoning", "Respite", "Slumber"].map((label, i) => (
             <div key={i} className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all ${
               i === 0 ? "bg-white/20 scale-105" : "bg-white/5 opacity-70"
             }`}>
               {isSpooky ? label : ["Focus", "Short", "Long"][i]}
             </div>
          ))}
        </div>

        {/* Timer Display */}
        <div className="relative w-40 h-40 flex-shrink-0 my-2">
          <svg className="w-full h-full -rotate-90">
            <circle cx="50%" cy="50%" r="45%" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
            <circle cx="50%" cy="50%" r="45%" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 45}%`} strokeDashoffset={`${2 * Math.PI * 45 * 0.25}%`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-mono text-4xl font-light tracking-wider ${isSpooky ? "text-purple-100" : "text-white"}`}>18:45</span>
            <span className="text-[10px] text-white/70 uppercase tracking-widest mt-1">{isSpooky ? "Summoning" : "Focus"}</span>
          </div>
        </div>

        {/* Session Dots */}
        <div className="flex gap-2 mb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i <= 2 ? "bg-white" : "bg-white/20"}`} />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full justify-center">
          <div className={`h-10 px-6 rounded-full flex items-center justify-center font-medium text-sm shadow-lg cursor-pointer transition-transform hover:scale-105 ${
            isSpooky ? "bg-purple-500 text-white" : "bg-white text-[#171d2b]"
          }`}>
            {isSpooky ? "Suspend" : "Pause"}
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function AchievementsVisual({ isSpooky }: { isSpooky: boolean }) {
  return (
    <div className="w-full h-full p-8 flex items-center justify-center">
      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
        {[
          { title: "First Blood", desc: "Complete your first session", icon: Ghost, progress: 100, unlocked: true, color: "bg-purple-500" },
          { title: "Night Owl", desc: "Study after midnight", icon: Zap, progress: 60, unlocked: false, color: "bg-yellow-500" },
          { title: "Grimoire Master", desc: "Create 5 reviewers", icon: Library, progress: 40, unlocked: false, color: "bg-blue-500" },
          { title: "Soul Collector", desc: "Earn 1000 XP", icon: BrainCircuit, progress: 85, unlocked: false, color: "bg-green-500" },
        ].map((achievement, i) => (
          <div key={i} className={`relative p-4 rounded-xl border transition-all ${
            achievement.unlocked
              ? (isSpooky 
                  ? "bg-[#151821] border-purple-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]" 
                  : "bg-white border-[#171d2b]/10 shadow-sm")
              : (isSpooky
                  ? "bg-[#0d0f14] border-purple-500/10 opacity-60 grayscale"
                  : "bg-[#f9f9f7] border-[#171d2b]/5 opacity-60 grayscale")
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
              isSpooky ? "bg-purple-500/20 text-purple-400" : "bg-[#171d2b]/5 text-[#171d2b]"
            }`}>
              <achievement.icon size={20} />
            </div>
            <h3 className={`font-sans font-medium text-sm mb-1 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
              {achievement.title}
            </h3>
            <p className={`font-sans text-xs mb-3 leading-tight ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>
              {achievement.desc}
            </p>
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSpooky ? "bg-purple-900/30" : "bg-[#171d2b]/5"}`}>
              <div
                className={`h-full rounded-full ${isSpooky ? "bg-purple-500" : "bg-[#171d2b]"}`}
                style={{ width: `${achievement.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarVisual({ isSpooky }: { isSpooky: boolean }) {
  // Mock data for a month view (e.g., October)
  // Mock data for a month view (e.g., October)
  // Use deterministic data to prevent hydration mismatches
  const days = Array.from({ length: 35 }).map((_, i) => {
    const day = i - 2; // Start from -2 to have some empty cells at start
    if (day < 1 || day > 31) return { day: null, level: 0 };
    
    // Deterministic activity levels 0-4 based on index
    // Use simple math to simulate randomness without Math.random()
    const pseudoRandom = ((i * 13 + 7) % 23) / 23; 
    const level = pseudoRandom > 0.6 ? Math.ceil(pseudoRandom * 4) : 0;
    return { day, level };
  });

  const levelColors = isSpooky ? [
    "bg-[#1a1525]",
    "bg-purple-900/40",
    "bg-purple-700/50",
    "bg-purple-600/60",
    "bg-purple-500/70",
  ] : [
    "bg-[#f5f5f0]",
    "bg-[#f5e6c8]",
    "bg-[#e8c896]",
    "bg-[#d4a574]",
    "bg-[#c4875a]",
  ];

  return (
    <div className="w-full h-full p-4 sm:p-6 flex items-center justify-center">
        <div className={`w-full h-full rounded-xl border shadow-sm overflow-hidden flex flex-col ${
            isSpooky 
                ? "bg-[#151821] border-purple-500/20"
                : "bg-white border-[#171d2b]/5"
        }`}>
            {/* Header */}
            <div className={`px-4 py-3 border-b flex-shrink-0 ${
                isSpooky 
                    ? "bg-purple-900/30 border-purple-500/20"
                    : "bg-[#f5e6c8] border-[#171d2b]/5"
            }`}>
                <div className="flex items-center gap-2">
                    {isSpooky ? (
                        <Skull size={16} className="text-purple-400" />
                    ) : (
                        <Calendar size={16} className="text-[#171d2b]/70" />
                    )}
                    <h2 className={`font-serif text-sm ${
                        isSpooky ? "text-purple-200" : "text-[#171d2b]"
                    }`}>
                        {isSpooky ? "Grimoire of Studies" : "Study History"}
                    </h2>
                </div>
            </div>

            {/* Month Nav */}
             <div className={`flex items-center justify-between px-3 py-2 border-b flex-shrink-0 ${
                isSpooky 
                    ? "border-purple-500/10 bg-[#151821]"
                    : "border-[#171d2b]/10 bg-white"
            }`}>
                <div className={`w-6 h-6 flex items-center justify-center border rounded ${
                        isSpooky
                            ? "border-purple-500/30 text-purple-300"
                            : "border-[#171d2b]/20 text-[#171d2b]"
                    }`}>
                    <ChevronLeft size={14} />
                </div>
                <span className={`font-serif text-sm font-semibold ${
                    isSpooky ? "text-purple-200" : "text-[#171d2b]"
                }`}>
                    {isSpooky ? "Harvest Moon" : "October"} 2025
                </span>
                <div className={`w-6 h-6 flex items-center justify-center border rounded ${
                        isSpooky
                            ? "border-purple-500/30 text-purple-300"
                            : "border-[#171d2b]/20 text-[#171d2b]"
                    }`}>
                    <ChevronRight size={14} />
                </div>
            </div>

            {/* Days Header */}
            <div className={`grid grid-cols-7 flex-shrink-0 ${
                isSpooky ? "bg-[#1a1525]" : "bg-[#f5f0e0]"
            }`}>
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, i) => (
                    <div key={i} className={`py-2 text-center text-[10px] font-semibold border-b border-r last:border-r-0 ${
                        isSpooky
                            ? "text-purple-300/70 border-purple-500/10"
                            : "text-[#171d2b]/70 border-[#171d2b]/10"
                    }`}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 flex-1">
                {days.map((d, i) => (
                    <div key={i} className={`
                        flex items-center justify-center text-xs font-medium
                        border-b border-r last:border-r-0
                        ${d.day ? levelColors[d.level] : (isSpooky ? "bg-[#151821]" : "bg-white")}
                        ${isSpooky 
                            ? "border-purple-500/10 text-[#e8e4dc]"
                            : "border-[#171d2b]/10 text-[#171d2b]"
                        }
                    `}>
                        {d.day}
                    </div>
                ))}
            </div>
            
            {/* Legend */}
             <div className={`flex justify-center items-center gap-2 py-3 border-t flex-shrink-0 ${
                isSpooky ? "border-purple-500/10" : "border-[#171d2b]/10"
            }`}>
                <span className={`text-[10px] ${
                    isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"
                }`}>
                    {isSpooky ? "Dormant" : "Less"}
                </span>
                <div className="flex gap-1">
                    {levelColors.map((color, i) => (
                        <div key={i} className={`w-3 h-3 rounded-sm ${color} border ${
                            isSpooky ? "border-purple-500/20" : "border-[#171d2b]/10"
                        }`} />
                    ))}
                </div>
                <span className={`text-[10px] ${
                    isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"
                }`}>
                    {isSpooky ? "Possessed" : "More"}
                </span>
            </div>
        </div>
    </div>
  );
}

function ShareVisual({ isSpooky }: { isSpooky: boolean }) {
  return (
    <div className="w-full h-full p-8 flex items-center justify-center overflow-hidden">
      <div className={`relative w-full max-w-sm rounded-xl border p-4 transform scale-125 origin-center ${
        isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-[#171d2b]/10"
      }`}>
        <div className="flex justify-between items-start mb-4">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider flex items-center gap-1 ${
            isSpooky ? "bg-purple-600 text-white" : "bg-[#171d2b] text-white"
          }`}>
            <FileText size={10} />
            {isSpooky ? "Grimoire" : "Reviewer"}
          </span>
          <div className={`p-1 rounded-full bg-black/5 ${isSpooky ? "text-purple-300" : "text-[#171d2b]"}`}>
            <GripVertical size={14} />
          </div>
        </div>
        
        <h3 className={`font-sans font-semibold text-sm mb-4 ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
          Advanced Potions & Spells
        </h3>

        {/* Dropdown */}
        <div className={`absolute -right-12 -bottom-12 w-48 rounded-lg shadow-xl border py-1 z-50 ${
          isSpooky ? "bg-[#151821] border-purple-500/20" : "bg-white border-[#171d2b]/10"
        }`}>
          <button className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
            isSpooky ? "text-purple-200 bg-purple-500/10" : "text-[#171d2b] bg-[#171d2b]/5"
          }`}>
            <ScanLine size={14} />
            {isSpooky ? "Share Curse" : "Share"}
          </button>
          <button className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
            isSpooky ? "text-purple-200 hover:bg-purple-500/10" : "text-[#171d2b] hover:bg-[#171d2b]/5"
          }`}>
            <Trash2 size={14} />
            {isSpooky ? "Banish" : "Delete"}
          </button>
        </div>

        {/* Cursor */}
        <div className="absolute -right-4 -bottom-4 pointer-events-none">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19179L23.0216 12.3673H5.65376Z" fill={isSpooky ? "#a855f7" : "#171d2b"} stroke="white"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
