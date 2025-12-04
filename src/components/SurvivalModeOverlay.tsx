"use client";

import { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";

interface SurvivalModeOverlayProps {
  enabled: boolean;
  timeLeft: number;
  maxTime: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

export default function SurvivalModeOverlay({
  enabled,
  timeLeft,
  maxTime,
  onTimeUp,
  isPaused = false,
}: SurvivalModeOverlayProps) {
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);
  const timeUpCalledRef = useRef(false);

  // Calculate urgency (0-1) based on time remaining
  const urgency = enabled ? Math.max(0, 1 - timeLeft / maxTime) : 0;
  const isCritical = timeLeft <= 3 && timeLeft > 0;
  const isDanger = timeLeft <= Math.floor(maxTime / 2);

  // Memoize screen shake state based on critical
  const screenShake = useMemo(() => isCritical, [isCritical]);

  // Reset timeUp flag when time changes
  useEffect(() => {
    if (timeLeft > 0) {
      timeUpCalledRef.current = false;
    }
  }, [timeLeft]);

  // Handle time up
  useEffect(() => {
    if (enabled && timeLeft <= 0 && !timeUpCalledRef.current && !isPaused) {
      timeUpCalledRef.current = true;
      onTimeUp();
    }
  }, [enabled, timeLeft, onTimeUp, isPaused]);

  // Warning sound for countdown
  useEffect(() => {
    if (!enabled || isPaused || typeof window === "undefined") return;

    if (!tickAudioRef.current) {
      tickAudioRef.current = new Audio("/sounds/notification.mp3");
      tickAudioRef.current.volume = 0.3;
    }

    // Play on specific seconds
    if ([5, 3, 2, 1].includes(timeLeft)) {
      tickAudioRef.current.currentTime = 0;
      tickAudioRef.current.play().catch(() => {});
    }
  }, [enabled, timeLeft, isPaused]);

  if (!enabled) return null;

  // Calculate colors based on urgency - from dark purple to blood red
  const bgHue = Math.max(0, 280 - urgency * 280); // Purple (280) to Red (0)
  const bgSaturation = 30 + urgency * 40;
  const bgLightness = Math.max(5, 10 - urgency * 5);
  
  // Blood drip effect intensity
  const bloodOpacity = Math.min(0.4, urgency * 0.5);
  
  // Vignette intensity
  const vignetteOpacity = 0.2 + urgency * 0.4;

  return (
    <>
      {/* Dynamic horror background - gets redder and darker - BEHIND content */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -10 }}
        animate={{
          backgroundColor: `hsl(${bgHue}, ${bgSaturation}%, ${bgLightness}%)`,
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Blood/horror gradient overlay - BEHIND content */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: -9,
          background: `linear-gradient(180deg, 
            rgba(80, 0, 0, ${bloodOpacity * 0.3}) 0%, 
            transparent 30%,
            transparent 70%,
            rgba(60, 0, 0, ${bloodOpacity * 0.5}) 100%)`,
        }}
      />

      {/* Pulsing red edges - heartbeat effect - ON TOP but pointer-events-none */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-[39]"
        animate={{
          boxShadow: isCritical
            ? [
                `inset 0 0 100px 40px rgba(180, 0, 0, 0.5)`,
                `inset 0 0 150px 60px rgba(200, 0, 0, 0.7)`,
                `inset 0 0 100px 40px rgba(180, 0, 0, 0.5)`,
              ]
            : isDanger
            ? [
                `inset 0 0 ${60 + urgency * 80}px ${20 + urgency * 30}px rgba(139, 0, 0, ${0.15 + urgency * 0.3})`,
                `inset 0 0 ${40 + urgency * 60}px ${10 + urgency * 20}px rgba(139, 0, 0, ${0.1 + urgency * 0.2})`,
              ]
            : `inset 0 0 60px 20px rgba(80, 0, 80, 0.15)`,
        }}
        transition={{
          duration: isCritical ? 0.4 : 0.8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />

      {/* Vignette - darkens edges progressively */}
      <div
        className="fixed inset-0 pointer-events-none z-[38]"
        style={{
          background: `radial-gradient(ellipse at center, 
            transparent 30%, 
            rgba(0, 0, 0, ${vignetteOpacity * 0.4}) 70%,
            rgba(0, 0, 0, ${vignetteOpacity * 0.8}) 100%)`,
        }}
      />

      {/* Creepy corner shadows */}
      {urgency > 0.5 && (
        <>
          <div
            className="fixed top-0 left-0 w-48 h-48 pointer-events-none z-[37]"
            style={{
              background: `radial-gradient(ellipse at top left, rgba(0, 0, 0, ${urgency * 0.5}) 0%, transparent 70%)`,
            }}
          />
          <div
            className="fixed top-0 right-0 w-48 h-48 pointer-events-none z-[37]"
            style={{
              background: `radial-gradient(ellipse at top right, rgba(0, 0, 0, ${urgency * 0.5}) 0%, transparent 70%)`,
            }}
          />
          <div
            className="fixed bottom-0 left-0 w-48 h-48 pointer-events-none z-[37]"
            style={{
              background: `radial-gradient(ellipse at bottom left, rgba(0, 0, 0, ${urgency * 0.5}) 0%, transparent 70%)`,
            }}
          />
          <div
            className="fixed bottom-0 right-0 w-48 h-48 pointer-events-none z-[37]"
            style={{
              background: `radial-gradient(ellipse at bottom right, rgba(0, 0, 0, ${urgency * 0.5}) 0%, transparent 70%)`,
            }}
          />
        </>
      )}

      {/* Screen shake CSS - always include */}
      <style jsx global>{`
        .survival-shake {
          animation: ${screenShake ? "survival-shake 0.15s ease-in-out" : "none"};
        }
        @keyframes survival-shake {
          0%, 100% { transform: translateX(0) translateY(0); }
          20% { transform: translateX(-3px) translateY(1px); }
          40% { transform: translateX(3px) translateY(-1px); }
          60% { transform: translateX(-2px) translateY(2px); }
          80% { transform: translateX(2px) translateY(-2px); }
        }
      `}</style>

      {/* Flicker effect on critical */}
      {isCritical && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-[38] bg-red-900/15"
          animate={{ opacity: [0, 0.25, 0, 0.15, 0] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
      )}
    </>
  );
}

// Redesigned Survival Timer - circular with horror styling
interface SurvivalTimerProps {
  timeLeft: number;
  maxTime: number;
  className?: string;
}

export function SurvivalTimer({ timeLeft, maxTime, className = "" }: SurvivalTimerProps) {
  const percentage = (timeLeft / maxTime) * 100;
  const urgency = 1 - timeLeft / maxTime;
  const isCritical = timeLeft <= 3;
  const isWarning = timeLeft <= 5;

  // Circle properties
  const size = 56;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  // Dynamic colors
  const getStrokeColor = () => {
    if (isCritical) return "#dc2626"; // Red
    if (isWarning) return "#f97316"; // Orange
    if (urgency > 0.5) return "#eab308"; // Yellow
    return "#a855f7"; // Purple
  };

  const getGlowColor = () => {
    if (isCritical) return "rgba(220, 38, 38, 0.6)";
    if (isWarning) return "rgba(249, 115, 22, 0.4)";
    return "rgba(168, 85, 247, 0.3)";
  };

  return (
    <div className={`relative ${className}`}>
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-md transition-all duration-300"
        style={{
          backgroundColor: getGlowColor(),
          transform: isCritical ? "scale(1.2)" : "scale(1)",
        }}
      />
      
      {/* Timer circle */}
      <motion.div
        className="relative"
        animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.5, repeat: isCritical ? Infinity : 0 }}
      >
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="rgba(0, 0, 0, 0.5)"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              filter: `drop-shadow(0 0 ${isCritical ? 8 : 4}px ${getStrokeColor()})`,
            }}
          />
        </svg>
        
        {/* Time text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="font-mono font-bold text-lg"
            style={{ color: getStrokeColor() }}
            animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3, repeat: isCritical ? Infinity : 0 }}
          >
            {timeLeft}
          </motion.span>
        </div>
      </motion.div>

      {/* Critical warning pulse ring */}
      {isCritical && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-red-500"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      )}
    </div>
  );
}
