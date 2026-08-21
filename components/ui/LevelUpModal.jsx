"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Zap, Trophy } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeumorphicButton } from "@/components/ui/NeumorphicButton";

/**
 * LevelUpModal: Full-screen mobile overlay alert for level-up moments.
 * Light & Indigo celebration card with particle glow and stat reward highlight.
 */
export function LevelUpModal({
  isOpen = false,
  onClose,
  oldLevel = 0,
  newLevel = 1,
  statPointsEarned = 3,
}) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleNavigateStatus = () => {
    if (onClose) onClose();
    router.push("/status");
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm select-none"
        role="dialog"
        aria-modal="true"
      >
        <GlassCard
          glow={true}
          className="w-[90%] max-h-[85vh] p-6 rounded-3xl border-primary/30 shadow-2xl text-center flex flex-col items-center justify-center space-y-4 relative overflow-y-auto bg-white"
        >
          {/* Subtle ambient aura */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-44 h-44 rounded-full bg-primary/15 blur-3xl pointer-events-none" />

          {/* System Notification Header */}
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-primary text-[10px] font-mono font-bold uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5 text-primary" />
            SYSTEM NOTIFICATION
          </div>

          {/* Giant Level Up Heading */}
          <div className="space-y-1">
            <motion.h2
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-600 to-secondary tracking-tight uppercase"
            >
              ⬆ LEVEL UP!
            </motion.h2>
            <p className="text-xs text-text-secondary">
              Combat limits breached. The System has granted new power.
            </p>
          </div>

          {/* Level Transition Indicator */}
          <div className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-around shadow-inner">
            <div className="text-center">
              <span className="text-[10px] font-mono text-text-muted block uppercase">
                Previous
              </span>
              <span className="text-xl font-mono font-bold text-slate-400">
                LVL {oldLevel}
              </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-primary">
              <ArrowRight className="w-4 h-4" />
            </div>

            <div className="text-center">
              <span className="text-[10px] font-mono text-primary block uppercase font-bold">
                Ascended
              </span>
              <span className="text-2xl font-mono font-black text-primary">
                LVL {newLevel}
              </span>
            </div>
          </div>

          {/* Rewards Badge */}
          <div className="w-full p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5 text-primary font-bold">
              <Trophy className="w-4 h-4 text-amber-500" />
              Stat Points Earned:
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-primary text-white font-black">
              +{statPointsEarned}
            </span>
          </div>

          {/* Navigation Actions */}
          <div className="w-full pt-1 space-y-2">
            <NeumorphicButton
              title="Allocate Stat Points"
              subtitle="Open Hunter Status Screen"
              icon={<Sparkles className="w-5 h-5 text-primary" />}
              badge="→"
              onClick={handleNavigateStatus}
              className="bg-white border-primary/30 text-text-primary shadow-sm hover:border-primary"
            />

            <button
              onClick={() => {
                if (onClose) onClose();
                router.push("/rewards");
              }}
              className="text-xs font-mono text-text-muted hover:text-primary transition-colors py-1 flex items-center justify-center gap-1 mx-auto"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>View System Rewards & Arsenal →</span>
            </button>
          </div>
        </GlassCard>
      </div>
    </AnimatePresence>
  );
}

export default LevelUpModal;
