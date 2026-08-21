"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  LogOut,
  RefreshCw,
  BookOpen,
  BarChart3,
  Trophy,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import { useHunterData } from "@/hooks/useHunterData";
import { useNotification } from "@/context/NotificationContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeumorphicButton } from "@/components/ui/NeumorphicButton";
import { ExpBar } from "@/components/ui/ExpBar";
import { LevelUpModal } from "@/components/ui/LevelUpModal";
import { WorkoutTimer } from "@/components/ui/WorkoutTimer";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  const {
    data,
    tier,
    requiredExp,
    penaltyInfo,
    isLoading: hunterLoading,
    isLoaded,
    error,
    refreshHunter,
    retry,
    toggleQuest,
    completeHunt,
    updateHunterProgress,
  } = useHunterData();

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ oldLevel: 0, newLevel: 0, statPointsEarned: 0 });
  const [activeTimerQuest, setActiveTimerQuest] = useState(null);
  const [huntFeedback, setHuntFeedback] = useState(null);
  const [showDevTools, setShowDevTools] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const initialBriefingShownRef = useRef(false);

  // Auto-redirect unauthenticated users to /login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // First Load Daily Briefing Notification
  useEffect(() => {
    if (isLoaded && data?.email && !initialBriefingShownRef.current) {
      initialBriefingShownRef.current = true;
      const completed = Object.values(data.dailyProgress || {}).filter(Boolean).length;
      const pct = Math.round((completed / 4) * 100);

      if (data.huntClaimedToday) {
        showNotification({
          type: "summary",
          title: "Today's Training Complete",
          message: "Daily hunt claimed! Rest well for tomorrow's awakening.",
          duration: 5000,
        });
      } else {
        showNotification({
          type: "summary",
          title: "Today's Training",
          message: `${completed} of 4 quests completed (${pct}%). Keep pushing, Hunter!`,
          duration: 5000,
        });
      }
    }
  }, [isLoaded, data?.email, data?.dailyProgress, data?.huntClaimedToday, showNotification]);

  // Handler for completing quest via WorkoutTimer
  const handleCompleteTimerQuest = (exerciseKey, seconds) => {
    const updatedDaily = {
      ...(data?.dailyProgress || {}),
      [exerciseKey]: true,
    };
    const updatedDurations = {
      ...(data?.dailyDurations || {}),
      [exerciseKey]: seconds,
    };

    updateHunterProgress({
      dailyProgress: updatedDaily,
      dailyDurations: updatedDurations,
    });

    const expStr = expPerQuest.toFixed(1).replace(/\.0$/, "");
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeFormatted = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    showNotification({
      type: "complete",
      title: "Task Complete!",
      message: `+${expStr} EXP earned! Logged ${timeFormatted} of high-focus training.`,
      duration: 3000,
    });
  };

  // --- LOADING STATE ---
  if (authLoading || (hunterLoading && !data?.email)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] space-y-3 select-none">
        <div className="w-10 h-10 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-gray-400 tracking-widest uppercase">
          INITIALIZING SYSTEM...
        </p>
      </div>
    );
  }

  // --- UNAUTHENTICATED GUARD ---
  if (!isAuthenticated) {
    return null;
  }

  // --- ERROR STATE ---
  if (error && !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] space-y-4 select-none px-4">
        <GlassCard className="text-center space-y-4 w-full">
          <div className="text-4xl">⚠️</div>
          <h3 className="text-lg font-bold text-white font-mono">CONNECTION LOST</h3>
          <p className="text-xs text-gray-400 leading-relaxed">{error}</p>
          <NeumorphicButton onClick={retry} className="w-full justify-center text-sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reconnect to System
          </NeumorphicButton>
        </GlassCard>
      </div>
    );
  }

  // Calculate completed daily quests count
  const completedCount = Object.values(data.dailyProgress || {}).filter(Boolean).length;
  const expPerQuest = tier ? tier.expReward / 4 : 2.5;

  /**
   * Toggle a specific quest in dailyProgress immediately
   */
  const handleToggleQuest = async (exerciseKey) => {
    if (data.huntClaimedToday) {
      showNotification({
        type: "reminder",
        title: "Hunt Already Claimed",
        message: "Today's hunt is already recorded. Rest, Hunter!",
        duration: 4000,
      });
      return;
    }

    const isMarkingComplete = !data.dailyProgress?.[exerciseKey];

    try {
      await toggleQuest(exerciseKey);

      if (isMarkingComplete) {
        const expStr = expPerQuest.toFixed(1).replace(/\.0$/, "");
        showNotification({
          type: "complete",
          title: "Task Complete!",
          message: `+${expStr} EXP earned! Great work, Hunter.`,
          duration: 3000,
        });
      }
    } catch (err) {
      showNotification({
        type: "reminder",
        title: "Connection Issue",
        message: "Failed to update quest. Reconnecting...",
        duration: 4000,
      });
    }
  };

  /**
   * Complete Hunt action (Authoritative Server-side loop)
   */
  const handleCompleteHunt = async () => {
    // --- GUARD 1: Prevent spam on the same day ---
    if (data.huntClaimedToday) {
      showNotification({
        type: "reminder",
        title: "Hunt Claimed",
        message: "Hunt already claimed today. The System resets tomorrow.",
        duration: 4000,
      });
      return;
    }

    // --- GUARD 2: Must complete at least 1 exercise ---
    if (completedCount === 0) {
      showNotification({
        type: "reminder",
        title: "Quests Incomplete",
        message: "Complete at least one exercise to claim your Hunt.",
        duration: 4000,
      });
      return;
    }

    setIsClaiming(true);
    const oldLevel = data.level || 0;

    try {
      const result = await completeHunt();

      if (result?.levelUp) {
        const statPointsEarned = (result.hunter.level - oldLevel) * 3;
        setLevelUpData({
          oldLevel: oldLevel,
          newLevel: result.hunter.level,
          statPointsEarned,
        });
        setShowLevelUp(true);

        // Persistent Level Up Notification with Action Button
        showNotification({
          type: "levelup",
          title: "LEVEL UP!",
          message: `Ascended to Level ${result.hunter.level}! +${statPointsEarned} Stat Points available to allocate.`,
          action: {
            label: "Go to Stats",
            onClick: () => router.push("/status"),
          },
          duration: 0, // Persistent
        });
      } else if (result?.earnedExp) {
        showNotification({
          type: "summary",
          title: "Hunt Clear!",
          message: `+${result.earnedExp} EXP Added! Daily workout saved to Activity Log.`,
          duration: 5000,
        });
      }
    } catch (err) {
      showNotification({
        type: "reminder",
        title: "Hunt Error",
        message: err.message || "Failed to complete hunt.",
        duration: 4000,
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const nextDelta = Math.max(0, Math.round((requiredExp - (data.exp || 0)) * 10) / 10);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="w-full flex-1 flex flex-col justify-between select-none space-y-4 pb-4"
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
                  System Simulator & Session
                </span>
                <span className="text-[10px] text-dark-muted font-mono truncate max-w-[120px]">
                  {data.email}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => refreshHunter()}
                  className="py-2 px-1.5 rounded-xl bg-dark-bg text-accent-cyan text-[11px] font-mono border border-accent-cyan/20 shadow-neu-raised hover:border-accent-cyan/50 flex items-center justify-center gap-1 active:shadow-neu-pressed text-center"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateHunterProgress({ huntClaimedToday: false, dailyProgress: { pushups: false, squats: false, crunches: false, running: false } })}
                  className="py-2 px-1.5 rounded-xl bg-dark-bg text-emerald-400 text-[11px] font-mono border border-emerald-500/20 shadow-neu-raised hover:border-emerald-400/50 flex items-center justify-center gap-1 active:shadow-neu-pressed text-center"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Quests
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="py-2 px-1.5 rounded-xl bg-dark-bg text-rose-400 text-[11px] font-mono border border-rose-500/20 shadow-neu-raised hover:border-rose-400/50 flex items-center justify-center gap-1 active:shadow-neu-pressed text-center"
                >
                  <LogOut className="w-3 h-3" />
                  Sign Out
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
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${tier?.badgeClass || "bg-gray-800 text-gray-300 border-gray-700"}`}
                >
                  Rank: {tier?.rankLetter || "E"}
                </span>
                <span className="text-xs text-gray-400 font-medium tracking-wide">
                  {tier?.title || "Novice Awakened"}
                </span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
                Level {data.level || 0}
                <Sparkles className="w-4 h-4 text-accent-cyan" />
              </h1>
            </div>

            {/* Right: Circular w-14 h-14 Neumorphic Badge & Tools */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowDevTools(!showDevTools)}
                className="p-2 rounded-xl bg-dark-bg/80 shadow-neu-raised hover:text-accent-cyan text-dark-muted border border-white/5 transition-all active:shadow-neu-pressed"
                title="System Tools & Logout"
                aria-label="Toggle Simulator"
              >
                <Clock className="w-3.5 h-3.5" />
              </button>

              <Link
                href="/status"
                className="p-2 rounded-xl bg-dark-bg/80 shadow-neu-raised hover:text-accent-cyan text-gray-300 border border-white/5 transition-all active:shadow-neu-pressed relative"
                title="View Hunter Status & Stats"
              >
                <Sliders className="w-3.5 h-3.5 text-accent-cyan" />
                {(data.statPoints || 0) > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-cyan animate-pulse" />
                )}
              </Link>

              <Link
                href="/log"
                className="p-2 rounded-xl bg-dark-bg/80 shadow-neu-raised hover:text-accent-cyan text-gray-300 border border-white/5 transition-all active:shadow-neu-pressed"
                title="View Activity History & Workout Logs"
              >
                <BookOpen className="w-3.5 h-3.5 text-accent-cyan" />
              </Link>

              <Link
                href="/analytics"
                className="p-2 rounded-xl bg-dark-bg/80 shadow-neu-raised hover:text-accent-cyan text-gray-300 border border-white/5 transition-all active:shadow-neu-pressed"
                title="View Visual Analytics & Progress Charts"
              >
                <BarChart3 className="w-3.5 h-3.5 text-accent-cyan" />
              </Link>

              <Link
                href="/rewards"
                className="p-2 rounded-xl bg-dark-bg/80 shadow-neu-raised hover:text-accent-cyan text-gray-300 border border-white/5 transition-all active:shadow-neu-pressed"
                title="View System Rewards & Milestones"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
              </Link>

              {(data.streak || 0) > 0 && (
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
                  {data.level || 0}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* CARD 2: EXP PROGRESS */}
        <GlassCard className="py-4 px-5 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-300 font-semibold tracking-wide">
              EXP {data.exp || 0} / {requiredExp}
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
            {tier?.exercises?.map((exercise) => {
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
                  onClick={() => {
                    if (data.huntClaimedToday) return;
                    setActiveTimerQuest({
                      ...exercise,
                      badge: expLabel,
                      isCompleted,
                    });
                  }}
                />
              );
            })}
          </div>
        </GlassCard>

        {/* CARD 4: COMPLETE HUNT ACTION */}
        <div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={handleCompleteHunt}
            disabled={isClaiming || data.huntClaimedToday || completedCount === 0}
            className={`w-full py-5 rounded-2xl font-black text-base tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-200 border ${
              data.huntClaimedToday
                ? "bg-dark-card/80 text-gray-400 border-white/5 shadow-neu-pressed cursor-not-allowed opacity-80"
                : completedCount === 0
                ? "bg-dark-card text-gray-500 border-white/5 shadow-neu-raised cursor-not-allowed opacity-60"
                : "bg-gradient-to-r from-blue-600 via-accent-cyan to-blue-500 shadow-glow-cyan text-white border-white/20 active:opacity-90 cursor-pointer"
            }`}
          >
            {isClaiming ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Recording Hunt...</span>
              </div>
            ) : data.huntClaimedToday ? (
              <>
                <Lock className="w-5 h-5 text-accent-cyan" />
                Hunt Claimed (Resets Tomorrow)
              </>
            ) : (
              <>
                <Swords className="w-5 h-5" />
                {completedCount === 0 ? "Complete 1+ Quests" : "Complete Hunt"}
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
        onClose={() => {
          setShowLevelUp(false);
          refreshHunter();
        }}
        oldLevel={levelUpData.oldLevel}
        newLevel={levelUpData.newLevel}
        statPointsEarned={levelUpData.statPointsEarned}
      />

      {/* FULL-SCREEN WORKOUT TIMER MODAL */}
      <WorkoutTimer
        isOpen={!!activeTimerQuest}
        onClose={() => setActiveTimerQuest(null)}
        exercise={activeTimerQuest}
        isCompleted={!!data.dailyProgress?.[activeTimerQuest?.key]}
        initialDuration={data.dailyDurations?.[activeTimerQuest?.key] || 0}
        onComplete={handleCompleteTimerQuest}
      />
    </motion.div>
  );
}
