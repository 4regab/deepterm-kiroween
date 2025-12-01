"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Skull } from "lucide-react";
import Image from "next/image";
import { useThemeStore } from "@/lib/stores";
import { GhostIcon } from "./SpookyTheme/FlashlightEffect";

interface ExitPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onExit: () => void;
  xpToLose?: number;
  currentLevel?: number;
  currentXp?: number;
  maxXp?: number;
  nextLevel?: number;
}

export default function ExitPopup({
  isOpen,
  onClose,
  onExit,
  xpToLose = 10,
  currentLevel = 1,
  currentXp = 0,
  maxXp = 100,
  nextLevel = 2,
}: ExitPopupProps) {
  const theme = useThemeStore((state) => state.theme);
  const isSpooky = theme === "spooky";
  const progressPercent = Math.min((currentXp / maxXp) * 100, 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 backdrop-blur-sm ${isSpooky ? "bg-black/70" : "bg-[#171d2b]/40"}`}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative rounded-[32px] w-full max-w-[480px] overflow-visible shadow-2xl ${
              isSpooky ? "bg-[#151821] border border-purple-500/20" : "bg-white"
            }`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-10 ${
                isSpooky ? "text-purple-400/40 hover:text-purple-300 hover:bg-purple-500/10" : "text-[#171d2b]/40 hover:text-[#171d2b] hover:bg-[#171d2b]/5"
              }`}
            >
              <X size={24} />
            </button>

            {/* Mascot peeking over */}
            <div className="absolute -top-[80px] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {isSpooky ? (
                  <GhostIcon className="w-28 h-28 text-purple-300" />
                ) : (
                  <Image src="/assets/sad.webp" alt="Sad mascot" width={160} height={140} />
                )}
              </motion.div>
            </div>

            {/* Content */}
            <div className="pt-16 pb-8 px-8">
              {/* Level progress card */}
              <div className={`rounded-[20px] p-5 mb-8 border ${
                isSpooky ? "bg-[#0d0f14] border-purple-500/20" : "bg-[#f8f9fa] border-[#171d2b]/5"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-sora font-semibold text-lg ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
                    {isSpooky ? "Dark Level" : "Level"} {currentLevel}
                  </span>
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${
                    isSpooky ? "bg-purple-500/20 border-purple-500/30" : "bg-purple-100 border-purple-200"
                  }`}>
                    <span className={`font-sora font-bold text-sm ${isSpooky ? "text-purple-300" : "text-purple-600"}`}>{nextLevel}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className={`relative h-3 rounded-full overflow-hidden mb-2 ${isSpooky ? "bg-purple-900/30" : "bg-[#171d2b]/5"}`}>
                  <motion.div
                    initial={{ width: `${progressPercent}%` }}
                    animate={{ width: `${Math.max(progressPercent - (xpToLose / maxXp) * 100, 0)}%` }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                  />
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full opacity-30"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className={`font-sans font-medium ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>{currentXp}/{maxXp} XP</span>
                  <span className="text-red-500 font-sans font-bold">- {xpToLose} XP</span>
                </div>
              </div>

              {/* Warning text */}
              <div className="text-center mb-8">
                <h3 className={`font-sora font-bold text-xl mb-3 leading-tight ${isSpooky ? "text-purple-100" : "text-[#171d2b]"}`}>
                  {isSpooky ? "The spirits warn you..." : "Wait! You'll lose progress"}
                </h3>
                <p className={`font-sans text-[15px] leading-relaxed ${isSpooky ? "text-purple-300/60" : "text-[#171d2b]/60"}`}>
                  {isSpooky ? (
                    <>Abandoning the ritual will cost you <strong className="text-purple-300">{xpToLose} dark essence</strong>. Your progress will be lost to the void.</>
                  ) : (
                    <>If you leave now, you&apos;ll lose <strong className="text-[#171d2b]">{xpToLose} XP</strong> and your study session won&apos;t be saved.</>
                  )}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={onExit}
                  className={`flex-1 px-6 py-3.5 border-2 rounded-2xl font-sora font-semibold transition-all flex items-center justify-center gap-2 ${
                    isSpooky 
                      ? "bg-transparent border-purple-500/20 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/40" 
                      : "bg-white border-[#171d2b]/10 text-[#171d2b] hover:bg-gray-50 hover:border-[#171d2b]/20"
                  }`}
                >
                  {isSpooky && <Skull size={18} />}
                  {isSpooky ? "Abandon" : "Exit"}
                </button>
                <button
                  onClick={onClose}
                  className={`flex-1 px-6 py-3.5 text-white rounded-2xl font-sora font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${
                    isSpooky ? "bg-purple-600 hover:bg-purple-500" : "bg-[#171d2b] hover:bg-[#2a3347]"
                  }`}
                >
                  {isSpooky ? "Continue ritual" : "Keep going"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
