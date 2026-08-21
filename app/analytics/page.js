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
    <div className="w-full h-56 rounded-2xl bg-slate-100 border border-slate-200 animate-pulse flex items-center justify-center text-xs font-mono text-text-muted">
      Loading EXP Progression Chart...
    </div>
  ),
});

const CompletionBarChart = dynamic(
  () => import("@/components/ui/CompletionBarChart"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-48 rounded-2xl bg-slate-100 border border-slate-200 animate-pulse flex items-center justify-center text-xs font-mono text-text-muted">
        Loading Completion Rate Chart...
      </div>
    ),
  }
);

const StreakCalendar = dynamic(() => import("@/components/ui/StreakCalendar"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-44 rounded-2xl bg-slate-100 border border-slate-200 animate-pulse flex items-center justify-center text-xs font-mono text-text-muted">
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

    // Map logs by date
    const logMap = new Map();
    logs.forEach((log) => {
      if (log?.date) {
        logMap.set(log.date, log);
      }
    });

    let runningCumulativeExp = 0;
    let totalTimeframeExp = 0;
    let totalWorkouts = 0;
    let totalCompletedQuests = 0;

    const normalizedExpData = [];
    const normalizedCompletionData = [];

    daysList.forEach((dayObj) => {
      const log = logMap.get(dayObj.date);

      if (log) {
        const earned = Number(log.earnedExp) || 0;
        const exercises = log.exercises || {};
        const completedCount = Object.values(exercises).filter(Boolean).length;
        const rate = Math.round((completedCount / 4) * 100);

        runningCumulativeExp += earned;
        totalTimeframeExp += earned;
        totalWorkouts += 1;
        totalCompletedQuests += completedCount;

        normalizedExpData.push({
          ...dayObj,
          exp: Math.round(earned * 10) / 10,
          cumulativeExp: Math.round(runningCumulativeExp * 10) / 10,
          level: log.levelAtTime || 0,
        });

        normalizedCompletionData.push({
          ...dayObj,
          rate,
          completed: completedCount,
        });
      } else {
        normalizedExpData.push({
          ...dayObj,
          exp: 0,
          cumulativeExp: Math.round(runningCumulativeExp * 10) / 10,
          level: 0,
        });

        normalizedCompletionData.push({
          ...dayObj,
          rate: 0,
          completed: 0,
        });
      }
    });

    // 30-Day Heatmap Fixed Window
    const fixed30Days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const log = logMap.get(dateStr);
      const completedCount = log ? Object.values(log.exercises || {}).filter(Boolean).length : 0;
      const rate = Math.round((completedCount / 4) * 100);
      const earned = log ? Number(log.earnedExp) || 0 : 0;

      fixed30Days.push({
        date: dateStr,
        fullDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        shortLabel: `${d.getDate()}`,
        isToday: i === 0,
        completed: completedCount,
        rate,
        exp: earned,
      });
    }

    const avgDailyExp = totalDays > 0 ? (totalTimeframeExp / totalDays).toFixed(1) : "0.0";
    const overallRate = totalDays > 0 ? Math.round((totalCompletedQuests / (totalDays * 4)) * 100) : 0;

    return {
      expData: normalizedExpData,
      completionData: normalizedCompletionData,
      heatmapDays: fixed30Days,
      kpis: {
        totalWorkouts,
        totalTimeframeExp: Math.round(totalTimeframeExp * 10) / 10,
        avgDailyExp,
        overallRate,
      },
    };
  }, [logs, selectedTimeframe]);

  if (authLoading || (!hunter?.email && isLoading)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] space-y-3 select-none">
        <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-text-muted tracking-widest uppercase">
          CALCULATING PROGRESS METRICS...
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white shadow-sm text-text-secondary text-xs font-mono font-bold hover:text-primary border border-slate-200 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center p-1 rounded-xl bg-white border border-slate-200 shadow-sm">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.label}
              onClick={() => setSelectedTimeframe(tf.label)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedTimeframe === tf.label
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page Title */}
      <div>
        <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-text-muted">
          PERFORMANCE & ANALYTICS
        </span>
        <h1 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
          Visual Progress
          <BarChart3 className="w-5 h-5 text-primary" />
        </h1>
      </div>

      {/* 4-KPI Metric Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <GlassCard className="py-3 px-3.5 space-y-1 bg-white">
          <div className="flex items-center justify-between text-text-muted text-[10px] font-mono">
            <span>TOTAL WORKOUTS</span>
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="text-lg font-black font-mono text-text-primary">
            {kpis.totalWorkouts} <span className="text-xs text-text-muted">sessions</span>
          </p>
        </GlassCard>

        <GlassCard className="py-3 px-3.5 space-y-1 bg-white">
          <div className="flex items-center justify-between text-text-muted text-[10px] font-mono">
            <span>EXP EARNED</span>
            <Zap className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="text-lg font-black font-mono text-primary">
            +{kpis.totalTimeframeExp} <span className="text-xs text-text-muted">EXP</span>
          </p>
        </GlassCard>

        <GlassCard className="py-3 px-3.5 space-y-1 bg-white">
          <div className="flex items-center justify-between text-text-muted text-[10px] font-mono">
            <span>DAILY AVG EXP</span>
            <Award className="w-3.5 h-3.5 text-secondary" />
          </div>
          <p className="text-lg font-black font-mono text-secondary">
            {kpis.avgDailyExp} <span className="text-xs text-text-muted">/ day</span>
          </p>
        </GlassCard>

        <GlassCard className="py-3 px-3.5 space-y-1 bg-white">
          <div className="flex items-center justify-between text-text-muted text-[10px] font-mono">
            <span>COMPLETION RATE</span>
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-lg font-black font-mono text-amber-600">
            {kpis.overallRate}% <span className="text-xs text-text-muted">avg</span>
          </p>
        </GlassCard>
      </div>

      {/* Main EXP Progression Area Chart */}
      <ExpChart data={expData} />

      {/* Daily Completion Rate Bar Chart */}
      <CompletionBarChart data={completionData} />

      {/* 30-Day Activity Streak Heatmap */}
      <StreakCalendar days={heatmapDays} />
    </motion.div>
  );
}
