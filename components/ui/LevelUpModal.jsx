"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Zap, Trophy } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeumorphicButton } from "@/components/ui/NeumorphicButton";

/**
 * LevelUpModal: Full-screen mobile overlay alert for level-up moments.
 * Backed by bg-black/70 backdrop-blur-md and a centered w-[90%] max-h-[80vh] GlassCard.
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md select-none"
        role="dialog"
        aria-modal="true"
      >
        <GlassCard
          glow={true}
          className="w-[90%] max-h-[80vh] p-6 rounded-3xl border-accent-cyan/40 shadow-glow-cyan text-center flex flex-col items-center justify-center space-y-5 relative overflow-y-auto"
        >
          {/* Subtle ambient aura */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-44 h-44 rounded-full bg-accent-cyan/25 blur-3xl pointer-events-none" />

          {/* System Notification Header */}
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-[11px] font-mono font-bold uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5" />
            SYSTEM NOTIFICATION
          </div>

          {/* Giant Level Up Heading */}
          <div className="space-y-1">
            <motion.h2
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-accent-cyan tracking-tight uppercase drop-shadow-[0_0_15px_rgba(79,172,254,0.6)]"
            >
              ⬆ LEVEL UP!
            </motion.h2>
            <p className="text-xs text-gray-300">
              Combat limits breached. The System has granted new power.
            </p>
          </div>

          {/* Level Transition Indicator */}
          <div className="w-full p-4 rounded-2xl bg-dark-bg/90 shadow-neu-pressed border border-white/5 flex items-center justify-around">
            <div className="text-center">
              <span className="text-[10px] font-mono text-dark-muted block uppercase">
                Previous
              </span>
              <span className="text-xl font-mono font-bold text-gray-400">
                LVL {oldLevel}
              </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-dark-card shadow-neu-raised flex items-center justify-center text-accent-cyan">
              <ArrowRight className="w-4 h-4" />
            </div>

            <div className="text-center">
              <span className="text-[10px] font-mono text-accent-cyan block uppercase font-bold">
                Ascended
              </span>
              <span className="text-2xl font-mono font-black text-accent-cyan drop-shadow-[0_0_10px_rgba(79,172,254,0.6)]">
                LVL {newLevel}
              </span>
            </div>
          </div>

          {/* Rewards Badge */}
          <div className="w-full p-3 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5 text-accent-cyan font-bold">
              <Trophy className="w-4 h-4" />
              Stat Points Earned:
            </span>
            <span className="px-2 py-0.5 rounded-md bg-accent-cyan text-dark-bg font-black">
              +{statPointsEarned}
            </span>
          </div>

          {/* Navigation Actions */}
          <div className="w-full pt-1 space-y-2">
            <NeumorphicButton
              title="Allocate Stat Points"
              subtitle="Open Hunter Status Screen"
              icon={<Sparkles className="w-5 h-5 text-accent-cyan" />}
              badge="→"
              onClick={handleNavigateStatus}
              className="bg-dark-card border-accent-cyan/30 text-white shadow-neu-raised hover:border-accent-cyan/60"
            />

            <button
              onClick={() => {
                if (onClose) onClose();
                router.push("/rewards");
              }}
              className="text-xs font-mono text-gray-400 hover:text-accent-cyan transition-colors py-1 flex items-center justify-center gap-1 mx-auto"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>View System Rewards & Arsenal →</span>
            </button>
          </div>
        </GlassCard>
      </div>
    </AnimatePresence>
  );
}

export default LevelUpModal;
