"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Award,
  Swords,
  Skull,
  Flame,
  Clock,
  RotateCcw,
  Sliders,
  ShieldAlert,
  Calendar,
  Lock,
} from "lucide-react";
import { useSystemData } from "@/hooks/useSystemData";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeumorphicButton } from "@/components/ui/NeumorphicButton";
import { ExpBar } from "@/components/ui/ExpBar";
import { LevelUpModal } from "@/components/ui/LevelUpModal";
import { getRequiredExp, getTodayDateString, getDaysDifference } from "@/lib/helpers";

export default function HomePage() {
  const {
    data,
    tier,
    requiredExp,
    penaltyInfo,
    isLoaded,
    updateData,
    simulateDateJump,
    resetData,
  } = useSystemData();

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ oldLevel: 0, newLevel: 0, statPointsEarned: 3 });
  const [huntFeedback, setHuntFeedback] = useState(null);
  const [showDevTools, setShowDevTools] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-3 select-none">
        <div className="w-8 h-8 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-gray-400 tracking-widest uppercase">
          INITIALIZING SYSTEM...
        </p>
      </div>
    );
  }

  // Calculate completed daily quests count
  const completedCount = Object.values(data.dailyProgress || {}).filter(Boolean).length;
  const expPerQuest = tier.expReward / 4;

  /**
   * Toggle a specific quest in dailyProgress immediately
   */
  const handleToggleQuest = (exerciseKey) => {
    if (data.huntClaimedToday) {
      setHuntFeedback({
        type: "warning",
        text: "Today's hunt is already recorded. Rest, Hunter!",
      });
      setTimeout(() => setHuntFeedback(null), 3000);
      return;
    }

    updateData((prev) => ({
      ...prev,
      dailyProgress: {
        ...prev.dailyProgress,
        [exerciseKey]: !prev.dailyProgress?.[exerciseKey],
      },
    }));
  };

  /**
   * Complete Hunt action:
   * - Guard 1: Anti-Spam (huntClaimedToday lock)
   * - Guard 2: Minimum 1 exercise required
   * - Multi-level loop calculation with +3 stat points per level
   * - Streak continuity handling
   * - Locks huntClaimedToday: true until next day
   */
  const handleCompleteHunt = () => {
    // --- GUARD 1: Prevent spam on the same day ---
    if (data.huntClaimedToday) {
      setHuntFeedback({
        type: "warning",
        text: "Hunt already claimed today. Rest, Hunter. The System resets tomorrow.",
      });
      setTimeout(() => setHuntFeedback(null), 4000);
      return;
    }

    // --- GUARD 2: Must complete at least 1 exercise ---
    if (completedCount === 0) {
      setHuntFeedback({
        type: "warning",
        text: "Complete at least one exercise to claim your Hunt.",
      });
      setTimeout(() => setHuntFeedback(null), 3000);
      return;
    }

    const gainedExp = Math.round(expPerQuest * completedCount * 10) / 10;
    const currentLevel = data.level || 0;
    let newExp = Math.max(0, (data.exp || 0) + gainedExp);
    let newLevel = currentLevel;
    let newStatPoints = data.statPoints || 0;
    let levelsGained = 0;

    // --- Level-up loop ---
    let required = getRequiredExp(newLevel);
    while (newExp >= required) {
      newExp -= required;
      newLevel += 1;
      newStatPoints += 3;
      levelsGained += 1;
      required = getRequiredExp(newLevel);
    }

    // --- Streak Logic ---
    const today = getTodayDateString();
    let newStreak = data.streak || 0;

    if (data.lastWorkoutDate) {
      const daysElapsed = getDaysDifference(data.lastWorkoutDate, today);
      if (daysElapsed === 1) {
        newStreak = (data.streak || 0) + 1; // Worked out yesterday
      } else if (daysElapsed === 0) {
        newStreak = Math.max(1, data.streak || 1); // Same day
      } else {
        newStreak = 1; // Brand new start or after penalty
      }
    } else {
      newStreak = 1;
    }

    // --- Update final state with huntClaimedToday lock ---
    updateData((prev) => ({
      ...prev,
      level: newLevel,
      exp: Math.round(newExp * 10) / 10,
      statPoints: newStatPoints,
      streak: newStreak,
      lastWorkoutDate: today,
      lastActiveDate: today,
      huntClaimedToday: true, // <-- CRITICAL: Lock the hunt for today
      dailyProgress: {
        pushups: false,
        squats: false,
        crunches: false,
        running: false,
      },
    }));

    if (levelsGained > 0) {
      setLevelUpData({
        oldLevel: currentLevel,
        newLevel: newLevel,
        statPointsEarned: levelsGained * 3,
      });
      setShowLevelUp(true);
    } else {
      setHuntFeedback({
        type: "success",
        text: `+${gainedExp} EXP Added! Hunt Completed for Today.`,
      });
      setTimeout(() => setHuntFeedback(null), 3500);
    }
  };

  const nextDelta = Math.max(0, Math.round((requiredExp - data.exp) * 10) / 10);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="w-full flex-1 flex flex-col justify-between select-none space-y-4"
    >
      {/* Penalty Notice Banner (if triggered) */}
      <AnimatePresence>
        {penaltyInfo && penaltyInfo.applied && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <GlassCard className="bg-rose-950/40 border-rose-500/30 text-rose-200 py-3 px-4">
              <div className="flex items-center space-x-2.5">
                <Skull className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <p className="text-[11px] leading-tight">
                  <span className="font-bold text-rose-300">⚠️ SYSTEM PENALTY: </span>
                  50% EXP drained. ({penaltyInfo.daysMissed} days idle, streak reset to 0).
                </p>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dev / Penalty Simulator Drawer (Conditional) */}
      <AnimatePresence>
        {showDevTools && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GlassCard className="bg-dark-card/95 border-accent-cyan/30 shadow-neu-pressed space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-accent-cyan uppercase font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  System Day Simulator
                </span>
                <span className="text-[10px] text-dark-muted font-mono">
                  Claimed: {data.huntClaimedToday ? "Yes (Locked)" : "No (Open)"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => simulateDateJump(1)}
                  className="py-2 px-1.5 rounded-xl bg-dark-bg text-emerald-400 text-[11px] font-mono border border-emerald-500/20 shadow-neu-raised hover:border-emerald-400/50 flex items-center justify-center gap-1 active:shadow-neu-pressed text-center"
                >
                  <Calendar className="w-3 h-3" />
                  +1d (Reset)
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => simulateDateJump(2)}
                  className="py-2 px-1.5 rounded-xl bg-dark-bg text-rose-400 text-[11px] font-mono border border-rose-500/20 shadow-neu-raised hover:border-rose-400/50 flex items-center justify-center gap-1 active:shadow-neu-pressed text-center"
                >
                  <ShieldAlert className="w-3 h-3" />
                  +2d (Penalty)
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={resetData}
                  className="py-2 px-1.5 rounded-xl bg-dark-bg text-gray-300 text-[11px] font-mono border border-white/5 shadow-neu-raised hover:text-white flex items-center justify-center gap-1 active:shadow-neu-pressed text-center"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 4-Card Vertical Stack */}
      <div className="flex flex-col gap-4">
        {/* CARD 1: PROFILE & RANK */}
        <GlassCard glow={true} className="py-4 px-5">
          <div className="flex items-center justify-between">
            {/* Left: Rank & Level */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${tier.badgeClass}`}
                >
                  Rank: {tier.rankLetter}
                </span>
                <span className="text-xs text-gray-400 font-medium tracking-wide">
                  {tier.title}
                </span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
                Level {data.level}
                <Sparkles className="w-4 h-4 text-accent-cyan" />
              </h1>
            </div>

            {/* Right: Circular w-14 h-14 Neumorphic Badge & Tools */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowDevTools(!showDevTools)}
                className="p-2 rounded-xl bg-dark-bg/80 shadow-neu-raised hover:text-accent-cyan text-dark-muted border border-white/5 transition-all active:shadow-neu-pressed"
                title="System Date & Penalty Simulator"
                aria-label="Toggle Simulator"
              >
                <Clock className="w-3.5 h-3.5" />
              </button>

              <Link
                href="/status"
                className="p-2 rounded-xl bg-dark-bg/80 shadow-neu-raised hover:text-accent-cyan text-gray-300 border border-white/5 transition-all active:shadow-neu-pressed"
                title="View Hunter Status & Stats"
              >
                <Sliders className="w-3.5 h-3.5 text-accent-cyan" />
              </Link>

              {data.streak > 0 && (
                <div className="flex items-center space-x-1 px-2 py-1 rounded-xl bg-dark-bg/80 shadow-neu-pressed border border-white/5 text-[11px] font-mono text-amber-400">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{data.streak}d</span>
                </div>
              )}

              <div className="w-14 h-14 rounded-full bg-dark-bg shadow-neu-pressed border border-accent-cyan/30 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-accent-cyan/5 rounded-full blur-[2px]" />
                <span className="text-[9px] font-mono uppercase text-dark-muted font-bold tracking-wider">
                  LVL
                </span>
                <span className="text-lg font-mono font-black text-accent-cyan leading-none drop-shadow-[0_0_8px_rgba(79,172,254,0.5)]">
                  {data.level}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* CARD 2: EXP PROGRESS */}
        <GlassCard className="py-4 px-5 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-300 font-semibold tracking-wide">
              EXP {data.exp} / {requiredExp}
            </span>
            <span className="text-accent-cyan font-bold">
              Next: +{nextDelta}
            </span>
          </div>

          <ExpBar
            current={data.exp || 0}
            max={requiredExp || 10}
            showLabels={false}
          />
        </GlassCard>

        {/* CARD 3: DAILY QUESTS LIST */}
        <GlassCard className="py-4 px-5 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-white/5">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-accent-cyan" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Daily Quests
              </span>
            </div>
            <span className="text-[11px] font-mono text-dark-muted">
              {data.huntClaimedToday ? "Claimed for Today" : `${completedCount} / 4 Completed`}
            </span>
          </div>

          {/* Space-y-3 of 4 NeumorphicButtons */}
          <div className="space-y-3">
            {tier.exercises.map((exercise) => {
              const isCompleted = !!data.dailyProgress?.[exercise.key];
              const expLabel = `+${expPerQuest.toFixed(1).replace(/\.0$/, "")} EXP`;

              return (
                <NeumorphicButton
                  key={exercise.key}
                  title={exercise.name}
                  subtitle={`Target: ${exercise.target} ${exercise.unit} • ${exercise.category}`}
                  badge={expLabel}
                  isCompleted={isCompleted}
                  disabled={data.huntClaimedToday}
                  onClick={() => handleToggleQuest(exercise.key)}
                />
              );
            })}
          </div>
        </GlassCard>

        {/* CARD 4: COMPLETE HUNT ACTION (WITH ANTI-SPAM GUARD) */}
        <div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={handleCompleteHunt}
            className={`w-full py-5 rounded-2xl font-black text-base tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-200 border ${
              data.huntClaimedToday
                ? "bg-dark-card/80 text-gray-400 border-white/5 shadow-neu-pressed cursor-not-allowed opacity-80"
                : "bg-gradient-to-r from-blue-600 via-accent-cyan to-blue-500 shadow-glow-cyan text-white border-white/20 active:opacity-90 cursor-pointer"
            }`}
          >
            {data.huntClaimedToday ? (
              <>
                <Lock className="w-5 h-5 text-accent-cyan" />
                Hunt Claimed (Resets Tomorrow)
              </>
            ) : (
              <>
                <Swords className="w-5 h-5" />
                Complete Hunt
              </>
            )}
          </motion.button>

          {/* Feedback Toast */}
          <AnimatePresence>
            {huntFeedback && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className={`text-center text-xs font-mono mt-2 font-semibold ${
                  huntFeedback.type === "warning" ? "text-amber-400" : "text-accent-cyan"
                }`}
              >
                {huntFeedback.text}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* FULL-SCREEN LEVEL UP MODAL */}
      <LevelUpModal
        isOpen={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        oldLevel={levelUpData.oldLevel}
        newLevel={levelUpData.newLevel}
        statPointsEarned={levelUpData.statPointsEarned}
      />
    </motion.div>
  );
}
