"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Flame,
  Plus,
  RotateCcw,
  Clock,
  Sparkles,
  Zap,
  Skull,
  Radio,
  Dumbbell,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useSystemData } from "@/hooks/useSystemData";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeumorphicButton } from "@/components/ui/NeumorphicButton";
import { ExpBar } from "@/components/ui/ExpBar";

export default function HomePage() {
  const {
    data,
    tier,
    requiredExp,
    penaltyInfo,
    isLoaded,
    completeExercise,
    allocateStat,
    resetData,
    simulateDateJump,
    updateData,
  } = useSystemData();

  const [activeTab, setActiveTab] = useState("quests");
  const [showDevTools, setShowDevTools] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-3 select-none">
        <div className="w-8 h-8 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-gray-400 tracking-widest uppercase">
          SYNCHRONIZING SYSTEM...
        </p>
      </div>
    );
  }

  const completedCount = Object.values(data.dailyProgress || {}).filter(
    Boolean
  ).length;

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-1 select-none space-y-3.5">
      {/* Top Header: System Status & Streak */}
      <header className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center space-x-2">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan shadow-glow-cyan" />
            <span className="absolute w-4 h-4 rounded-full bg-accent-cyan/40 animate-ping" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-accent-cyan uppercase block leading-tight">
              SYSTEM QUEST
            </span>
            <span className="text-xs font-bold text-white tracking-wide">
              SOLO LEVELING
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Daily Streak Indicator */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-dark-card shadow-neu-pressed border border-white/5">
            <Flame
              className={`w-3.5 h-3.5 ${
                data.streak > 0 ? "text-amber-400 fill-amber-400" : "text-gray-500"
              }`}
            />
            <span className="text-xs font-mono font-bold text-gray-200">
              {data.streak}d
            </span>
          </div>

          {/* Dev / Penalty Simulator Toggle */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowDevTools(!showDevTools)}
            className="p-2 rounded-xl bg-dark-card shadow-neu-raised hover:text-accent-cyan transition-colors text-dark-muted border border-white/5"
            title="Toggle System Dev Tools"
            aria-label="Toggle Dev Tools"
          >
            <Clock className="w-4 h-4" />
          </motion.button>
        </div>
      </header>

      {/* Inactivity Penalty Alert Banner */}
      <AnimatePresence>
        {penaltyInfo && penaltyInfo.applied && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <GlassCard className="bg-rose-950/30 border-rose-500/40 text-rose-200">
              <div className="flex items-start space-x-3">
                <Skull className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold tracking-wide text-rose-300">
                    SYSTEM PENALTY APPLIED
                  </p>
                  <p className="text-[11px] text-rose-200/80 leading-relaxed">
                    Inactivity detected ({penaltyInfo.daysMissed} days missed). EXP floored
                    by 50% (-{penaltyInfo.lostExp} EXP) and streak reset to 0.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dev / Simulation Drawer */}
      <AnimatePresence>
        {showDevTools && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GlassCard className="bg-dark-card/90 border-accent-cyan/20 shadow-neu-pressed space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-accent-cyan uppercase font-semibold">
                  Penalty & Date Simulator
                </span>
                <span className="text-[10px] text-dark-muted font-mono">
                  Active: {data.lastWorkoutDate || "None"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => simulateDateJump(2)}
                  className="py-2 px-3 rounded-xl bg-dark-bg text-rose-400 text-xs font-medium border border-rose-500/20 shadow-neu-raised hover:border-rose-400/50 flex items-center justify-center gap-1.5 active:shadow-neu-pressed"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Trigger 2d Penalty
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={resetData}
                  className="py-2 px-3 rounded-xl bg-dark-bg text-gray-300 text-xs font-medium border border-white/5 shadow-neu-raised hover:text-white flex items-center justify-center gap-1.5 active:shadow-neu-pressed"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset System
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Status & Level Card with GlassCard + ExpBar */}
      <GlassCard glow={true} className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-md border ${tier.badgeClass}`}
              >
                {tier.rank}
              </span>
              <span className="text-xs text-gray-300 font-medium">
                {tier.title}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1.5 tracking-tight flex items-baseline gap-1.5">
              LVL <span className="text-accent-cyan">{data.level}</span>
            </h2>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-dark-muted block uppercase">
              Current EXP
            </span>
            <span className="text-sm font-mono font-bold text-gray-200">
              {data.exp}{" "}
              <span className="text-xs text-dark-muted font-normal">
                / {requiredExp}
              </span>
            </span>
          </div>
        </div>

        {/* Phase 3 ExpBar Component */}
        <ExpBar
          current={data.exp || 0}
          max={requiredExp || 10}
          sublabel={`+${tier.expReward} EXP / Quest`}
        />

        {/* Quick Level Switchers for Testing Tiers */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-mono">Test Tier Scaling</span>
          <div className="flex items-center space-x-1.5">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => updateData({ level: Math.max(0, data.level - 1) })}
              disabled={data.level <= 0}
              className="px-2.5 py-1 rounded-lg bg-dark-bg text-xs font-mono text-gray-300 disabled:opacity-30 shadow-neu-pressed border border-white/5"
            >
              -1
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => updateData({ level: data.level + 1 })}
              className="px-2.5 py-1 rounded-lg bg-dark-bg text-xs font-mono text-accent-cyan shadow-neu-pressed border border-white/5"
            >
              +1
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => updateData({ level: 10 })}
              className="px-2.5 py-1 rounded-lg bg-dark-bg text-[10px] font-mono text-emerald-400 shadow-neu-pressed border border-white/5"
            >
              D-Rank
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => updateData({ level: 20 })}
              className="px-2.5 py-1 rounded-lg bg-dark-bg text-[10px] font-mono text-accent-cyan shadow-neu-pressed border border-white/5"
            >
              C-Rank
            </motion.button>
          </div>
        </div>
      </GlassCard>

      {/* Main Tab Segment */}
      <div className="flex rounded-2xl bg-dark-card p-1 shadow-neu-pressed border border-white/5">
        <button
          onClick={() => setActiveTab("quests")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "quests"
              ? "bg-dark-bg text-accent-cyan shadow-neu-raised"
              : "text-gray-400"
          }`}
        >
          Daily Quests ({completedCount}/4)
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "stats"
              ? "bg-dark-bg text-accent-cyan shadow-neu-raised"
              : "text-gray-400"
          }`}
        >
          Attributes
        </button>
      </div>

      {/* Tab Content */}
      <section className="flex-1 space-y-2.5">
        {activeTab === "quests" ? (
          <div className="space-y-2.5">
            {tier.exercises.map((exercise) => {
              const isCompleted = !!data.dailyProgress[exercise.key];
              return (
                <NeumorphicButton
                  key={exercise.key}
                  title={exercise.name}
                  subtitle={`Target: ${exercise.target} ${exercise.unit} • ${exercise.category}`}
                  badge={`+${tier.expReward} EXP`}
                  isCompleted={isCompleted}
                  onClick={() => completeExercise(exercise.key)}
                />
              );
            })}
          </div>
        ) : (
          /* Attributes Grid */
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { key: "str", label: "STR", full: "Strength", color: "text-rose-400" },
              { key: "vit", label: "VIT", full: "Vitality", color: "text-emerald-400" },
              { key: "agi", label: "AGI", full: "Agility", color: "text-accent-cyan" },
            ].map((stat) => (
              <GlassCard
                key={stat.key}
                className="p-3.5 flex flex-col items-center justify-between text-center"
              >
                <div>
                  <span
                    className={`text-xs font-mono font-black ${stat.color}`}
                  >
                    {stat.label}
                  </span>
                  <span className="text-[10px] block text-dark-muted">
                    {stat.full}
                  </span>
                </div>

                <div className="my-2 font-mono text-xl font-bold text-white">
                  {data.stats[stat.key] || 0}
                </div>

                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => allocateStat(stat.key)}
                  className="w-full py-1.5 rounded-xl bg-dark-bg shadow-neu-pressed border border-white/5 text-gray-300 hover:text-white flex items-center justify-center text-xs"
                  aria-label={`Increase ${stat.label}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </motion.button>
              </GlassCard>
            ))}
          </div>
        )}
      </section>

      {/* Mobile Footer Status Dock */}
      <footer className="pt-1">
        <GlassCard className="p-3 flex items-center justify-between text-[11px] text-dark-muted font-mono">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-accent-cyan" />
            Storage: <span className="text-gray-200">Local (Synced)</span>
          </span>
          <span className="text-gray-400">
            {completedCount === 4 ? "Daily Quests Cleared! 🎉" : `${4 - completedCount} Left`}
          </span>
        </GlassCard>
      </footer>
    </div>
  );
}
