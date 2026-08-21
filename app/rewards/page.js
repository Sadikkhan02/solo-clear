"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useHunterData } from "@/hooks/useHunterData";
import { useNotification } from "@/context/NotificationContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { RewardCard } from "@/components/ui/RewardCard";
import {
  ArrowLeft,
  Trophy,
  Sparkles,
  Zap,
  Gift,
  Award,
  Flame,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { getRequiredExp } from "@/lib/helpers";

// SSR-Safe dynamic import for RadarChart
const StatRadarChart = dynamic(
  () => import("@/components/ui/StatRadarChart"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-56 rounded-2xl bg-slate-100 border border-slate-200 animate-pulse flex items-center justify-center text-xs font-mono text-text-muted">
        Calibrating Attribute Radar...
      </div>
    ),
  }
);

const MILESTONES = [
  {
    id: "e-rank",
    rank: "E-RANK",
    title: "Novice Awakening",
    levelReq: 0,
    description: "Awakened as a Hunter with baseline System access.",
    rewardText: "Awakened Title",
    bonusPoints: 0,
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  {
    id: "d-rank",
    rank: "D-RANK",
    title: "Iron Hunter Promotion",
    levelReq: 10,
    description: "Proven physical endurance across intermediate gates.",
    rewardText: "+5 Stat Points",
    bonusPoints: 5,
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "c-rank",
    rank: "C-RANK",
    title: "Shadow Initiate Ascendancy",
    levelReq: 20,
    description: "Mastery of combat pace and advanced gate thresholds.",
    rewardText: "+10 Stat Points",
    bonusPoints: 10,
    badgeClass: "bg-indigo-50 text-primary border-indigo-200",
  },
  {
    id: "b-rank",
    rank: "B-RANK",
    title: "Monarch Realm Convergence",
    levelReq: 30,
    description: "Ascend beyond human limits into Monarch realm.",
    rewardText: "+15 Stat Points",
    bonusPoints: 15,
    badgeClass: "bg-purple-50 text-secondary border-purple-200",
  },
];

export default function RewardsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: hunter, tier, updateHunterProgress } = useHunterData();
  const { showNotification } = useNotification();

  const [isClaimingId, setIsClaimingId] = useState(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const currentLevel = hunter?.level || 0;
  const nextLevel = currentLevel + 1;
  const currentExp = hunter?.exp || 0;
  const reqExp = getRequiredExp(currentLevel);
  const expRemaining = Math.max(0, Math.round((reqExp - currentExp) * 10) / 10);
  const claimedList = hunter?.claimedMilestones || ["e-rank"]; // e-rank claimed by default

  const allocatedStats =
    (hunter?.stats?.str || 0) +
    (hunter?.stats?.vit || 0) +
    (hunter?.stats?.agi || 0) +
    (hunter?.stats?.con || 0);

  // Handle Milestone Reward Claim
  const handleClaimMilestone = async (milestone) => {
    if (claimedList.includes(milestone.id)) return;
    if (currentLevel < milestone.levelReq) return;

    setIsClaimingId(milestone.id);

    try {
      const updatedClaimed = [...claimedList, milestone.id];
      const newPoints = (hunter?.statPoints || 0) + milestone.bonusPoints;

      await updateHunterProgress({
        claimedMilestones: updatedClaimed,
        statPoints: newPoints,
      });

      showNotification({
        type: "levelup",
        title: "REWARD CLAIMED!",
        message: `${milestone.title} claimed! +${milestone.bonusPoints} Stat Points added to your arsenal.`,
        action: {
          label: "Go to Stats",
          onClick: () => router.push("/status"),
        },
        duration: 0,
      });
    } catch (err) {
      console.error("Error claiming milestone:", err);
      showNotification({
        type: "reminder",
        title: "Claim Failed",
        message: "Failed to claim reward. Please check your connection.",
        duration: 4000,
      });
    } finally {
      setIsClaimingId(null);
    }
  };

  if (authLoading || !hunter?.email) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] space-y-3 select-none">
        <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-text-muted tracking-widest uppercase">
          SYNCING SYSTEM REWARDS...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex-1 flex flex-col space-y-4 select-none pb-6"
    >
      {/* Top Navigation */}
      <div className="flex items-center justify-between pt-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white shadow-sm text-text-secondary text-xs font-mono font-bold hover:text-primary border border-slate-200 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border tracking-widest uppercase ${
              tier?.badgeClass || "bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            {tier?.rank || "E-Rank"} • LVL {currentLevel}
          </span>
        </div>
      </div>

      {/* Page Title */}
      <div>
        <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-text-muted">
          ARSENAL & RECOGNITION
        </span>
        <h1 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
          System Rewards
          <Trophy className="w-5 h-5 text-amber-500" />
        </h1>
      </div>

      {/* 4-Card Summary Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <GlassCard className="py-3 px-3.5 space-y-1 bg-white">
          <div className="flex items-center justify-between text-text-muted text-[10px] font-mono">
            <span>LEVEL PROGRESS</span>
            <Zap className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="text-lg font-black font-mono text-text-primary">
            LVL {currentLevel} <span className="text-xs text-text-muted">({tier?.rankLetter}-Rank)</span>
          </p>
        </GlassCard>

        <GlassCard className="py-3 px-3.5 space-y-1 bg-white">
          <div className="flex items-center justify-between text-text-muted text-[10px] font-mono">
            <span>AVAILABLE STATS</span>
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="text-lg font-black font-mono text-primary">
            {hunter?.statPoints || 0} <span className="text-xs text-text-muted">pts</span>
          </p>
        </GlassCard>

        <GlassCard className="py-3 px-3.5 space-y-1 bg-white">
          <div className="flex items-center justify-between text-text-muted text-[10px] font-mono">
            <span>ALLOCATED STATS</span>
            <Award className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-lg font-black font-mono text-emerald-600">
            {allocatedStats} <span className="text-xs text-text-muted">total</span>
          </p>
        </GlassCard>

        <GlassCard className="py-3 px-3.5 space-y-1 bg-white">
          <div className="flex items-center justify-between text-text-muted text-[10px] font-mono">
            <span>DAILY STREAK</span>
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-lg font-black font-mono text-amber-600">
            {hunter?.streak || 0} <span className="text-xs text-text-muted">days</span>
          </p>
        </GlassCard>
      </div>

      {/* Next Level Reward Preview Card */}
      <GlassCard glow={true} className="py-4 px-4 space-y-3 border-primary/30 relative overflow-hidden bg-white">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold font-mono text-text-primary uppercase tracking-wider">
              Next Reward Preview (LVL {nextLevel})
            </span>
          </div>
          <span className="text-[10px] font-mono text-primary font-bold">
            +{expRemaining} EXP to Unlock
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-mono text-text-muted block uppercase font-bold">
              Guaranteed Points
            </span>
            <span className="text-lg font-black font-mono text-primary block">
              +3 Stat Points
            </span>
            <span className="text-[10px] text-text-secondary block">
              Directly allocatable to STR/VIT/AGI/CON
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-mono text-text-muted block uppercase font-bold">
              Combat Scaling
            </span>
            <span className="text-lg font-black font-mono text-secondary block">
              Higher EXP
            </span>
            <span className="text-[10px] text-text-secondary block">
              Scaled quest rewards & gate limits
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Spider/Radar Chart for Stat Allocation */}
      <StatRadarChart stats={hunter?.stats} statPoints={hunter?.statPoints} />

      {/* Rank Milestone Rewards Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold font-mono text-text-primary uppercase tracking-wider">
              Rank Milestone Arsenal
            </h2>
          </div>
          <span className="text-[10px] font-mono text-text-muted">
            {claimedList.length} / {MILESTONES.length} Claimed
          </span>
        </div>

        <div className="space-y-3">
          {MILESTONES.map((milestone) => (
            <RewardCard
              key={milestone.id}
              milestone={milestone}
              currentLevel={currentLevel}
              isClaimed={claimedList.includes(milestone.id)}
              onClaim={handleClaimMilestone}
              isClaiming={isClaimingId === milestone.id}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
