"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Check, Lock, Sparkles, Trophy, Gift, ArrowRight } from "lucide-react";

export function RewardCard({
  milestone,
  currentLevel = 0,
  isClaimed = false,
  onClaim,
  isClaiming = false,
}) {
  const isUnlocked = currentLevel >= milestone.levelReq;
  const progressPct = Math.min(
    100,
    Math.round((currentLevel / Math.max(1, milestone.levelReq)) * 100)
  );

  return (
    <GlassCard
      glow={isUnlocked && !isClaimed}
      className={`py-4 px-4 space-y-3.5 relative overflow-hidden transition-all duration-300 ${
        isClaimed
          ? "border-emerald-500/30 bg-dark-card/90"
          : isUnlocked
          ? "border-accent-cyan/50 shadow-glow-cyan bg-dark-card/95"
          : "border-white/5 opacity-80"
      }`}
    >
      {/* Background Accent Glow */}
      {isUnlocked && !isClaimed && (
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-accent-cyan/15 blur-2xl pointer-events-none" />
      )}

      {/* Card Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Icon Badge */}
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border flex-shrink-0 shadow-neu-pressed ${
              isClaimed
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : isUnlocked
                ? "bg-accent-cyan/20 border-accent-cyan/40 text-accent-cyan"
                : "bg-dark-bg/80 border-white/5 text-gray-500"
            }`}
          >
            {isClaimed ? (
              <Check className="w-5 h-5" />
            ) : isUnlocked ? (
              <Trophy className="w-5 h-5 text-accent-cyan" />
            ) : (
              <Lock className="w-4 h-4 text-gray-500" />
            )}
          </div>

          {/* Title & Subtitle */}
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                  milestone.badgeClass || "bg-gray-800 text-gray-300 border-gray-700"
                }`}
              >
                {milestone.rank || "RANK"}
              </span>
              <span className="text-[10px] font-mono text-dark-muted">
                REQ: LVL {milestone.levelReq}
              </span>
            </div>

            <h3 className="text-sm font-black text-white font-mono mt-0.5">
              {milestone.title}
            </h3>
          </div>
        </div>

        {/* Reward Bonus Pill */}
        <div className="text-right">
          <span
            className={`text-xs font-mono font-black px-2.5 py-1 rounded-xl border block shadow-neu-raised ${
              isClaimed
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-accent-cyan/15 border-accent-cyan/40 text-accent-cyan"
            }`}
          >
            {milestone.rewardText}
          </span>
        </div>
      </div>

      {/* Description / Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-gray-400">{milestone.description}</span>
          {!isUnlocked && (
            <span className="text-dark-muted">
              {currentLevel} / {milestone.levelReq} ({progressPct}%)
            </span>
          )}
        </div>

        {!isUnlocked && (
          <div className="w-full h-1.5 rounded-full bg-dark-bg border border-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-accent-cyan transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>

      {/* Claim Action Button */}
      <div className="pt-1">
        {isClaimed ? (
          <div className="w-full py-2.5 rounded-xl bg-dark-bg/60 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-neu-pressed">
            <Check className="w-3.5 h-3.5" />
            <span>Reward Claimed</span>
          </div>
        ) : isUnlocked ? (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onClaim && onClaim(milestone)}
            disabled={isClaiming}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-blue-600 shadow-glow-cyan text-white text-xs font-mono font-bold flex items-center justify-center gap-2 hover:opacity-95 active:opacity-90 transition-all cursor-pointer"
          >
            {isClaiming ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Gift className="w-4 h-4" />
                <span>Claim {milestone.rewardText}</span>
              </>
            )}
          </motion.button>
        ) : (
          <div className="w-full py-2.5 rounded-xl bg-dark-bg/40 border border-white/5 text-gray-500 text-xs font-mono flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Unlocks at Level {milestone.levelReq}</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export default RewardCard;
