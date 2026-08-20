"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  Zap,
  Heart,
  Activity,
  Sparkles,
  Award,
  ChevronLeft,
} from "lucide-react";
import { useSystemData } from "@/hooks/useSystemData";
import { GlassCard } from "@/components/ui/GlassCard";

export default function StatusPage() {
  const {
    data,
    tier,
    isLoaded,
    allocateStat,
    decreaseStat,
  } = useSystemData();

  if (!isLoaded) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-3 select-none">
        <div className="w-8 h-8 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-gray-400 tracking-widest uppercase">
          CALIBRATING STATUS...
        </p>
      </div>
    );
  }

  const statConfigs = [
    {
      key: "str",
      label: "STR",
      title: "Strength",
      color: "text-rose-400",
      accentBorder: "border-rose-500/20",
      icon: Zap,
      description: "Boosts physical strike potency and burst force.",
    },
    {
      key: "vit",
      label: "VIT",
      title: "Vitality",
      color: "text-emerald-400",
      accentBorder: "border-emerald-500/20",
      icon: Heart,
      description: "Enhances stamina reserves and damage absorption.",
    },
    {
      key: "agi",
      label: "AGI",
      title: "Agility",
      color: "text-accent-cyan",
      accentBorder: "border-accent-cyan/20",
      icon: Activity,
      description: "Increases reaction velocity and evasion reflex.",
    },
  ];

  const availablePoints = data.statPoints || 0;

  return (
    <div className="w-full flex-1 flex flex-col justify-between select-none space-y-4 py-1">
      {/* Top Header: Back navigation & Available Points */}
      <header className="flex items-center justify-between pb-3 border-b border-white/5">
        <Link
          href="/"
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-dark-card shadow-neu-raised text-gray-300 hover:text-white border border-white/5 text-xs font-mono transition-colors active:shadow-neu-pressed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quest Log</span>
        </Link>

        {/* Available Points Badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-dark-card shadow-neu-pressed border border-accent-cyan/30 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
          <span className="text-gray-400">Points:</span>
          <span className="font-bold text-accent-cyan font-mono text-sm">
            {availablePoints}
          </span>
        </div>
      </header>

      {/* Overview Card: Hunter Identity */}
      <GlassCard glow={true} className="py-4 px-5 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${tier.badgeClass}`}
            >
              {tier.rank}
            </span>
            <h1 className="text-xl font-black text-white mt-1 tracking-tight">
              Hunter Attributes
            </h1>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-dark-muted block uppercase">
              Current Rank
            </span>
            <span className="text-sm font-bold text-accent-cyan">
              LVL {data.level}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          Allocate your earned System points to calibrate strength, stamina, and agility attributes.
        </p>
      </GlassCard>

      {/* Main Stat Allocation List */}
      <div className="space-y-3.5 flex-1">
        {statConfigs.map((stat) => {
          const statValue = data.stats?.[stat.key] || 0;
          const isMinusDisabled = statValue <= 0;
          const isPlusDisabled = availablePoints <= 0;
          const StatIcon = stat.icon;

          return (
            <GlassCard
              key={stat.key}
              className={`py-3.5 px-4 border ${stat.accentBorder} space-y-2`}
            >
              <div className="flex items-center justify-between">
                {/* Left: Decrement Button (w-12 h-12) */}
                <motion.button
                  whileTap={isMinusDisabled ? undefined : { scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  onClick={() => decreaseStat(stat.key)}
                  disabled={isMinusDisabled}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold font-mono transition-all duration-200 border ${
                    isMinusDisabled
                      ? "bg-dark-bg/60 text-gray-600 border-white/[0.02] shadow-neu-pressed opacity-40 cursor-not-allowed"
                      : "bg-dark-card text-gray-200 border-white/5 shadow-neu-raised hover:text-white cursor-pointer active:shadow-neu-pressed"
                  }`}
                  aria-label={`Decrease ${stat.label}`}
                >
                  -
                </motion.button>

                {/* Center: Stat Title, Icon & Value */}
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex items-center space-x-1.5">
                    <StatIcon className={`w-3.5 h-3.5 ${stat.color}`} />
                    <span className={`text-xs font-mono font-bold ${stat.color}`}>
                      {stat.label}
                    </span>
                    <span className="text-[11px] text-dark-muted">
                      ({stat.title})
                    </span>
                  </div>
                  <span className="text-3xl font-bold font-mono text-white mt-0.5 tracking-tight">
                    {statValue}
                  </span>
                </div>

                {/* Right: Increment Button (w-12 h-12) */}
                <motion.button
                  whileTap={isPlusDisabled ? undefined : { scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  onClick={() => allocateStat(stat.key)}
                  disabled={isPlusDisabled}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold font-mono transition-all duration-200 border ${
                    isPlusDisabled
                      ? "bg-dark-bg/60 text-gray-600 border-white/[0.02] shadow-neu-pressed opacity-40 cursor-not-allowed"
                      : "bg-dark-card text-accent-cyan border-accent-cyan/30 shadow-neu-raised hover:border-accent-cyan/60 cursor-pointer active:shadow-neu-pressed"
                  }`}
                  aria-label={`Increase ${stat.label}`}
                >
                  +
                </motion.button>
              </div>

              <p className="text-[10px] text-gray-400 text-center font-mono">
                {stat.description}
              </p>
            </GlassCard>
          );
        })}
      </div>

      {/* Bottom Action: Return to Quest Log */}
      <footer className="pt-2">
        <Link
          href="/"
          className="w-full py-4 rounded-2xl bg-dark-card shadow-neu-raised border border-white/5 text-gray-200 font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 hover:text-white active:shadow-neu-pressed transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-accent-cyan" />
          Return to Daily Quest
        </Link>
      </footer>
    </div>
  );
}
