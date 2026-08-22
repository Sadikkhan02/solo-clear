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
  User,
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
  const [globalRank, setGlobalRank] = useState(null);
  const initialBriefingShownRef = useRef(false);

  // Auto-redirect unauthenticated users to /login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch current user global rank
  useEffect(() => {
    async function fetchRank() {
      if (!isAuthenticated) return;
      try {
        const res = await fetch("/api/ranking?page=1&limit=1");
        if (res.ok) {
          const payload = await res.json();
          if (payload.currentUserRank) {
            setGlobalRank(payload.currentUserRank);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user rank:", err);
      }
    }

    if (!authLoading && isAuthenticated) {
      fetchRank();
    }
  }, [authLoading, isAuthenticated, data?.level, data?.exp]);

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

    const exObj = tier?.exercises?.find((e) => e.key === exerciseKey);
    const exName = exObj?.name || "Quest";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeFormatted = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    showNotification({
      type: "complete",
      title: "Task Completed!",
      message: `${exName} finished in ${timeFormatted}! Progress recorded.`,
      duration: 4000,
    });
  };

  // Handler for Claim Daily Hunt
  const handleClaimHunt = async () => {
    if (isClaiming) return;
    setIsClaiming(true);
    setHuntFeedback(null);

    const oldLvl = data.level || 0;
    const res = await completeHunt();

    setIsClaiming(false);

    if (res.success) {
      setHuntFeedback({
        type: "success",
        message: `Hunt Claimed! Earned +${res.earnedExp} EXP in ${res.actualDurationMinutes || 15}m.`,
      });

      if (res.levelUp) {
        const pointsGained = res.levelsGained * 3;
        setLevelUpData({
          oldLevel: oldLvl,
          newLevel: res.hunter?.level || oldLvl + res.levelsGained,
          statPointsEarned: pointsGained,
        });
        setShowLevelUp(true);

        showNotification({
          type: "levelup",
          title: "LEVEL UP!",
          message: `Ascended to Level ${res.hunter?.level}! You earned +${pointsGained} Stat Points.`,
          action: {
            label: "Go to Stats →",
            onClick: () => router.push("/status"),
          },
          duration: 0,
        });
      } else {
        showNotification({
          type: "summary",
          title: "Hunt Completed!",
          message: `Earned +${res.earnedExp} EXP! Streak preserved at ${res.hunter?.streak || 1} days.`,
          duration: 5000,
        });
      }
    } else {
      setHuntFeedback({
        type: "error",
        message: res.error || "Failed to complete hunt. Try again.",
      });

      showNotification({
        type: "reminder",
        title: "Action Required",
        message: res.error || "Please complete at least one quest before claiming.",
        duration: 5000,
      });
    }
  };

  // --- INITIAL LOADING STATE ---
  if (authLoading || (hunterLoading && !data?.email)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[85vh] space-y-4 select-none">
        <div className="w-12 h-12 rounded-full border-3 border-primary border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-text-muted tracking-widest uppercase">
          CALIBRATING HUNTER SYSTEM...
        </p>
      </div>
    );
  }

  // --- UNAUTHENTICATED GUARD ---
  if (!isAuthenticated) {
    return null;
  }

  // --- ERROR / RECONNECT STATE ---
  if (error && !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[85vh] space-y-4 select-none px-4">
        <GlassCard className="text-center space-y-4 w-full">
          <div className="text-4xl">⚠️</div>
          <h3 className="text-lg font-bold text-text-primary font-mono">CONNECTION LOST</h3>
          <p className="text-xs text-text-secondary leading-relaxed">{error}</p>
          <NeumorphicButton onClick={retry} className="w-full justify-center text-sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reconnect to System
          </NeumorphicButton>
        </GlassCard>
      </div>
    );
  }

  const nextDelta = Math.max(0, Math.round((requiredExp - (data.exp || 0)) * 10) / 10);
  const completedCount = Object.values(data.dailyProgress || {}).filter(Boolean).length;
  const isClaimLocked = completedCount === 0 || data.huntClaimedToday;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex-1 flex flex-col space-y-4 select-none pb-6"
    >
      {/* 2-Day Inactivity Penalty Warning Banner */}
      {penaltyInfo?.isPenaltyApplied && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>INACTIVITY PENALTY:</strong> 50% EXP deducted & streak reset.
            </span>
          </div>
        </motion.div>
      )}

      {/* Dev / Simulator Tools Panel */}
      <AnimatePresence>
        {showDevTools && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GlassCard className="p-4 space-y-3 border-indigo-200 bg-indigo-50/50">
              <div className="flex items-center justify-between text-xs font-mono text-text-muted">
                <span>SYSTEM SIMULATOR</span>
                <span className="text-[10px] text-text-muted">{data.email}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => refreshHunter()}
                  className="py-2 px-1.5 rounded-xl bg-white text-primary text-[11px] font-mono border border-slate-200 shadow-sm hover:border-primary flex items-center justify-center gap-1 active:shadow-inner text-center"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateHunterProgress({ huntClaimedToday: false, dailyProgress: { pushups: false, squats: false, crunches: false, running: false } })}
                  className="py-2 px-1.5 rounded-xl bg-white text-emerald-600 text-[11px] font-mono border border-slate-200 shadow-sm hover:border-emerald-500 flex items-center justify-center gap-1 active:shadow-inner text-center"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Quests
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="py-2 px-1.5 rounded-xl bg-white text-rose-600 text-[11px] font-mono border border-slate-200 shadow-sm hover:border-rose-500 flex items-center justify-center gap-1 active:shadow-inner text-center"
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
      <div className="flex flex-col gap-3.5">
        {/* CARD 1: STREAMLINED HEADER */}
        <GlassCard glow={true} className="py-3.5 px-4">
          <div className="flex items-center justify-between">
            {/* Left: Global Rank, Tier, Level & Streak */}
            <div className="flex items-center flex-wrap gap-2">
              {/* Global Rank Badge */}
              <Link
                href="/ranking"
                className="px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-mono font-bold text-primary shadow-sm hover:bg-indigo-100 transition-colors flex items-center gap-1"
                title="View Global Leaderboard"
              >
                <Trophy className="w-3 h-3 text-indigo-500" />
                <span>{globalRank ? `#${globalRank} Global` : "Ranked"}</span>
              </Link>

              {/* Tier Rank Badge */}
              <span
                className={`text-[10px] font-mono font-bold px-2 py-1 rounded-xl border uppercase tracking-wider ${
                  tier?.badgeClass || "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {tier?.rankLetter || "E"}-Rank
              </span>

              {/* Level Badge */}
              <div className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-text-primary shadow-sm">
                LVL {data.level || 0}
              </div>

              {/* Streak Badge */}
              {(data.streak || 0) > 0 && (
                <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-xs font-mono text-amber-700 font-bold shadow-sm">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{data.streak}d</span>
                </div>
              )}
            </div>

            {/* Right: Profile Hub & Sign Out Buttons */}
            <div className="flex items-center space-x-2">
              <Link
                href="/profile"
                className="p-2.5 rounded-2xl bg-white border border-slate-200 text-primary shadow-sm hover:border-primary hover:bg-indigo-50/50 transition-all active:scale-95 flex items-center gap-1.5"
                title="Open Hunter Profile Hub"
                aria-label="Hunter Profile Hub"
              >
                <User className="w-4 h-4" />
                <span className="text-xs font-mono font-bold hidden sm:inline">Profile</span>
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-2.5 rounded-2xl bg-white border border-slate-200 text-rose-600 shadow-sm hover:border-rose-300 hover:bg-rose-50 transition-all active:scale-95"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </GlassCard>

        {/* CARD 2: EXP PROGRESS */}
        <GlassCard className="py-4 px-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-text-primary font-semibold tracking-wide">
              EXP {data.exp || 0} / {requiredExp}
            </span>
            <span className="text-primary font-bold">
              Next: +{nextDelta}
            </span>
          </div>

          <ExpBar
            current={data.exp || 0}
            max={requiredExp}
            showLabels={false}
          />
        </GlassCard>

        {/* CARD 3: DAILY QUESTS */}
        <GlassCard className="py-4 px-4 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-bold font-mono text-text-primary uppercase tracking-wider">
                Daily Quests
              </h2>
            </div>
            <span className="text-[10px] font-mono text-text-muted">
              {data.huntClaimedToday
                ? "Claimed for Today"
                : `${completedCount} / 4 Completed`}
            </span>
          </div>

          <div className="space-y-2.5">
            {tier?.exercises?.map((exercise) => {
              const isDone = !!data.dailyProgress?.[exercise.key];
              const expPerQuest = Math.round((tier.expReward / 4) * 10) / 10;
              const durationSec = data.dailyDurations?.[exercise.key] || 0;

              return (
                <div key={exercise.key} className="space-y-1">
                  <NeumorphicButton
                    title={exercise.name}
                    subtitle={`Target: ${exercise.target} ${exercise.unit} • ${exercise.category}`}
                    badge={`+${expPerQuest} EXP`}
                    isCompleted={isDone}
                    onClick={() => toggleQuest(exercise.key)}
                  />

                  {/* Workout Timer trigger row */}
                  <div className="flex items-center justify-between px-2 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setActiveTimerQuest(exercise)}
                      className="text-primary font-semibold hover:underline flex items-center gap-1 py-0.5"
                    >
                      <Clock className="w-3 h-3" />
                      <span>{durationSec > 0 ? `Tracked: ${Math.floor(durationSec / 60)}m ${durationSec % 60}s (Retake)` : "Open Workout Timer →"}</span>
                    </button>

                    {durationSec > 0 && (
                      <span className="text-emerald-600 font-bold">
                        ✓ Recorded
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Feedback Alert */}
        {huntFeedback && (
          <div
            className={`p-3 rounded-2xl text-xs font-mono text-center border shadow-sm ${
              huntFeedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {huntFeedback.message}
          </div>
        )}

        {/* CARD 4: CLAIM ACTION BUTTON */}
        <motion.button
          whileTap={isClaimLocked ? undefined : { scale: 0.97 }}
          onClick={handleClaimHunt}
          disabled={isClaimLocked || isClaiming}
          className={`w-full py-4 rounded-2xl font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all duration-300 ${
            data.huntClaimedToday
              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
              : isClaimLocked
              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60 shadow-none"
              : "bg-gradient-to-r from-primary to-secondary text-white shadow-glow-primary hover:opacity-95 active:opacity-90 cursor-pointer border border-primary/20"
          }`}
        >
          {isClaiming ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : data.huntClaimedToday ? (
            <>
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Hunt Claimed (Resets Tomorrow)</span>
            </>
          ) : isClaimLocked ? (
            <>
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Complete 1+ Quest to Claim</span>
            </>
          ) : (
            <>
              <Swords className="w-4 h-4 text-white" />
              <span>Claim Quest Reward</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Full-screen Exercise Workout Timer Modal */}
      {activeTimerQuest && (
        <WorkoutTimer
          exercise={activeTimerQuest}
          isOpen={!!activeTimerQuest}
          onClose={() => setActiveTimerQuest(null)}
          onComplete={handleCompleteTimerQuest}
        />
      )}

      {/* Level Up Celebration Modal */}
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
