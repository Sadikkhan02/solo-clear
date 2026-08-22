"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Zap,
  Heart,
  Activity,
  Sparkles,
  ChevronLeft,
  RefreshCw,
  Shield,
  UserCog,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useHunterData } from "@/hooks/useHunterData";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeumorphicButton } from "@/components/ui/NeumorphicButton";

export default function StatusPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    data,
    tier,
    isLoading: hunterLoading,
    isLoaded,
    error,
    allocateStat,
    decreaseStat,
    refreshHunter,
    retry,
  } = useHunterData();

  // --- REDIRECT UNAUTHENTICATED USERS ---
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // --- LOADING STATE ---
  if (authLoading || (hunterLoading && !data?.email)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] space-y-3 select-none">
        <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-text-muted tracking-widest uppercase">
          CALIBRATING STATUS...
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

  const statConfigs = [
    {
      key: "str",
      label: "STR",
      title: "Strength",
      color: "text-rose-500",
      accentBorder: "border-rose-200",
      icon: Zap,
      description: "Boosts physical strike potency and burst force.",
    },
    {
      key: "vit",
      label: "VIT",
      title: "Vitality",
      color: "text-emerald-600",
      accentBorder: "border-emerald-200",
      icon: Heart,
      description: "Enhances stamina reserves and damage absorption.",
    },
    {
      key: "agi",
      label: "AGI",
      title: "Agility",
      color: "text-indigo-600",
      accentBorder: "border-indigo-200",
      icon: Activity,
      description: "Increases reaction velocity and evasion reflex.",
    },
    {
      key: "con",
      label: "CON",
      title: "Constitution",
      color: "text-amber-600",
      accentBorder: "border-amber-200",
      icon: Shield,
      description: "Bolsters baseline vitality and adds +1% bonus EXP per point on hunt completions.",
    },
  ];

  const availablePoints = data.statPoints || 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="w-full flex-1 flex flex-col justify-between select-none space-y-4 py-1 pb-6"
    >
      {/* Top Header: Back navigation, Profile & Available Points */}
      <header className="flex items-center justify-between pb-2 border-b border-slate-200/80">
        <Link
          href="/"
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white shadow-sm text-text-secondary hover:text-text-primary border border-slate-200 text-xs font-mono transition-colors active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quest Log</span>
        </Link>

        {/* Edit Profile Link */}
        <Link
          href="/profile"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white shadow-sm text-text-secondary hover:text-primary border border-slate-200 text-xs font-mono transition-colors active:scale-95"
        >
          <UserCog className="w-3.5 h-3.5 text-primary" />
          <span>Profile</span>
        </Link>

        {/* Available Points Badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white shadow-sm border border-primary/30 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-text-muted">Points:</span>
          <span className="font-bold text-primary font-mono text-sm">
            {availablePoints}
          </span>
        </div>
      </header>

      {/* Overview Card: Hunter Identity */}
      <GlassCard glow={true} className="py-4 px-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase ${tier?.badgeClass || "bg-slate-100 text-slate-700 border-slate-200"}`}
            >
              {tier?.rank || "E-Rank"}
            </span>
            <h1 className="text-xl font-black text-text-primary mt-1 tracking-tight">
              Hunter Attributes
            </h1>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-text-muted block uppercase">
              Current Rank
            </span>
            <span className="text-sm font-bold text-primary">
              LVL {data.level || 0}
            </span>
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          Allocate your earned System points to calibrate strength, stamina, and agility attributes.
        </p>
      </GlassCard>

      {/* Main Stat Allocation List */}
      <div className="space-y-3 flex-1">
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
                      ? "bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed"
                      : "bg-white text-text-primary border-slate-200 shadow-sm hover:border-primary cursor-pointer active:scale-95"
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
                    <span className="text-[11px] text-text-muted">
                      ({stat.title})
                    </span>
                  </div>
                  <span className="text-3xl font-black font-mono text-text-primary mt-0.5 tracking-tight">
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
                      ? "bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed"
                      : "bg-white text-primary border-primary/40 shadow-sm hover:border-primary cursor-pointer active:scale-95 shadow-glow-primary"
                  }`}
                  aria-label={`Increase ${stat.label}`}
                >
                  +
                </motion.button>
              </div>

              <p className="text-[10px] text-text-muted text-center font-mono">
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
          className="w-full py-4 rounded-2xl bg-white shadow-sm border border-slate-200 text-text-primary font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 hover:border-primary active:scale-[0.98] transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-primary" />
          Return to Daily Quest
        </Link>
      </footer>
    </motion.div>
  );
}
