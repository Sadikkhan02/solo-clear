"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useHunterData } from "@/hooks/useHunterData";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  ArrowLeft,
  TrendingUp,
  BarChart3,
  Flame,
  Award,
  Zap,
  Calendar,
  RefreshCw,
} from "lucide-react";

// SSR-Safe dynamic imports for Recharts components
const ExpChart = dynamic(() => import("@/components/ui/ExpChart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-56 rounded-2xl bg-dark-card/50 border border-white/5 animate-pulse flex items-center justify-center text-xs font-mono text-gray-500">
      Loading EXP Progression Chart...
    </div>
  ),
});

const CompletionBarChart = dynamic(
  () => import("@/components/ui/CompletionBarChart"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-48 rounded-2xl bg-dark-card/50 border border-white/5 animate-pulse flex items-center justify-center text-xs font-mono text-gray-500">
        Loading Completion Rate Chart...
      </div>
    ),
  }
);

const StreakCalendar = dynamic(() => import("@/components/ui/StreakCalendar"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-44 rounded-2xl bg-dark-card/50 border border-white/5 animate-pulse flex items-center justify-center text-xs font-mono text-gray-500">
      Loading Activity Heatmap...
    </div>
  ),
});

const TIMEFRAMES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "ALL", days: 365 },
];

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: hunter, tier } = useHunterData();

  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("30D");

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch workout logs
  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/user/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Error fetching logs for analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
    }
  }, [isAuthenticated]);

  // --- AGGREGATE & NORMALIZE DATA BY TIMEFRAME ---
  const { expData, completionData, heatmapDays, kpis } = useMemo(() => {
    const tfConfig = TIMEFRAMES.find((t) => t.label === selectedTimeframe) || TIMEFRAMES[1];
    const totalDays = tfConfig.days;

    // Create continuous array of dates ending today
    const now = new Date();
    const daysList = [];

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formattedDate = `${monthNames[d.getMonth()]} ${d.getDate()}`;
      const shortLabel = `${d.getDate()}`;
      const isToday = i === 0;

      daysList.push({
        date: dateStr,
        fullDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        formattedDate,
        shortLabel,
        isToday,
      });
    }

    // Map logs to date lookup
    const logMap = {};
    logs.forEach((log) => {
      const dateKey = (log.date || (log.timestamp ? new Date(log.timestamp).toISOString().split("T")[0] : "")).trim();
      if (dateKey) {
        logMap[dateKey] = log;
      }
    });

    let runningExp = 0;
    let totalRangeExp = 0;
    let activeDaysCount = 0;
    let sumCompletionRate = 0;

    const normalizedExp = [];
    const normalizedCompletion = [];

    daysList.forEach((day) => {
      const log = logMap[day.date];
      const dayExp = log ? Number(log.earnedExp) || 0 : 0;
      runningExp += dayExp;
      totalRangeExp += dayExp;

      let completedCount = 0;
      if (log?.exercises) {
        completedCount = Object.values(log.exercises).filter(Boolean).length;
      }

      const rate = completedCount > 0 ? Math.round((completedCount / 4) * 100) : 0;
      if (completedCount > 0) {
        activeDaysCount += 1;
        sumCompletionRate += rate;
      }

      normalizedExp.push({
        ...day,
        exp: dayExp,
        cumulativeExp: Math.round(runningExp * 10) / 10,
        level: log?.levelAtTime || hunter?.level || 0,
      });

      normalizedCompletion.push({
        ...day,
        rate,
        completed: completedCount,
      });
    });

    // Heatmap: strictly last 30 calendar days
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const shortLabel = `${d.getDate()}`;
      const log = logMap[dateStr];

      let completedCount = 0;
      if (log?.exercises) {
        completedCount = Object.values(log.exercises).filter(Boolean).length;
      }
      const rate = completedCount > 0 ? Math.round((completedCount / 4) * 100) : 0;
      const dayExp = log ? Number(log.earnedExp) || 0 : 0;

      last30Days.push({
        date: dateStr,
        fullDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        shortLabel,
        isToday: i === 0,
        rate,
        completed: completedCount,
        exp: dayExp,
        hasWorkout: !!log,
      });
    }

    const avgCompletion =
      activeDaysCount > 0 ? Math.round(sumCompletionRate / activeDaysCount) : 0;

    return {
      expData: normalizedExp,
      completionData: normalizedCompletion,
      heatmapDays: last30Days,
      kpis: {
        totalRangeExp: Math.round(totalRangeExp * 10) / 10,
        activeDaysCount,
        totalDays,
        avgCompletion,
        streak: hunter?.streak || 0,
      },
    };
  }, [logs, selectedTimeframe, hunter]);

  if (authLoading || (isLoading && logs.length === 0)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] space-y-3 select-none">
        <div className="w-10 h-10 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-gray-400 tracking-widest uppercase">
          CALIBRATING SYSTEM METRICS...
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
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-card shadow-neu-raised text-gray-300 text-xs font-mono font-bold hover:text-accent-cyan border border-white/5 active:shadow-neu-pressed transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan tracking-widest uppercase">
            RANK {tier?.rankLetter || "E"} • LVL {hunter?.level || 0}
          </span>
        </div>
      </div>

      {/* Page Title & Timeframe Selector */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-dark-muted">
            PERFORMANCE TRAJECTORY
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Visual Progress
            <BarChart3 className="w-5 h-5 text-accent-cyan" />
          </h1>
        </div>

        {/* Timeframe Filter Pills */}
        <div className="flex items-center p-0.5 rounded-xl bg-dark-card border border-white/5 shadow-neu-pressed">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.label}
              onClick={() => setSelectedTimeframe(tf.label)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedTimeframe === tf.label
                  ? "bg-accent-cyan/20 text-accent-cyan shadow-glow-cyan"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4-Stat KPI Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <GlassCard className="py-3 px-3.5 space-y-1">
          <div className="flex items-center justify-between text-dark-muted text-[10px] font-mono">
            <span>{selectedTimeframe} EXP</span>
            <Zap className="w-3.5 h-3.5 text-accent-cyan" />
          </div>
          <p className="text-lg font-black font-mono text-white">
            +{kpis.totalRangeExp} <span className="text-xs text-accent-cyan">EXP</span>
          </p>
        </GlassCard>

        <GlassCard className="py-3 px-3.5 space-y-1">
          <div className="flex items-center justify-between text-dark-muted text-[10px] font-mono">
            <span>ACTIVE DAYS</span>
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <p className="text-lg font-black font-mono text-white">
            {kpis.activeDaysCount} <span className="text-xs text-dark-muted">/ {kpis.totalDays}d</span>
          </p>
        </GlassCard>

        <GlassCard className="py-3 px-3.5 space-y-1">
          <div className="flex items-center justify-between text-dark-muted text-[10px] font-mono">
            <span>AVG CLEAR RATE</span>
            <Award className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-lg font-black font-mono text-emerald-400">
            {kpis.avgCompletion}%
          </p>
        </GlassCard>

        <GlassCard className="py-3 px-3.5 space-y-1">
          <div className="flex items-center justify-between text-dark-muted text-[10px] font-mono">
            <span>STREAK</span>
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-lg font-black font-mono text-amber-400">
            {kpis.streak} <span className="text-xs text-dark-muted">days</span>
          </p>
        </GlassCard>
      </div>

      {/* Chart 1: EXP Progression (Line/Area) */}
      <ExpChart data={expData} />

      {/* Chart 2: Daily Completion Rate (Bar) */}
      <CompletionBarChart data={completionData} />

      {/* Chart 3: Activity Heatmap */}
      <StreakCalendar days={heatmapDays} />
    </motion.div>
  );
}
