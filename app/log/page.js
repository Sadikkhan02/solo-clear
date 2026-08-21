"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Calendar,
  Flame,
  Sparkles,
  Swords,
  RefreshCw,
  Award,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeumorphicButton } from "@/components/ui/NeumorphicButton";
import { LogCard } from "@/components/ui/LogCard";

export default function LogPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({
    totalWorkouts: 0,
    monthlyExp: 0,
    streak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- FETCH WORKOUT LOGS ---
  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/logs");
      if (!res.ok) {
        throw new Error(`Failed to load activity logs (${res.status})`);
      }
      const data = await res.json();
      setLogs(data.logs || []);
      setSummary(
        data.summary || { totalWorkouts: 0, monthlyExp: 0, streak: 0 }
      );
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError("Failed to load activity history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
    }
  }, [isAuthenticated]);

  // --- REDIRECT UNAUTHENTICATED USERS ---
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // --- LOADING STATE ---
  if (authLoading || isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] space-y-3 select-none">
        <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-text-muted tracking-widest uppercase">
          RETRIEVING HUNT LOGS...
        </p>
      </div>
    );
  }

  // --- UNAUTHENTICATED GUARD ---
  if (!isAuthenticated) {
    return null;
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] space-y-4 select-none px-4">
        <GlassCard className="text-center space-y-4 w-full bg-white">
          <div className="text-4xl">⚠️</div>
          <h3 className="text-lg font-bold text-text-primary font-mono">CONNECTION LOST</h3>
          <p className="text-xs text-text-secondary leading-relaxed">{error}</p>
          <NeumorphicButton onClick={fetchLogs} className="w-full justify-center text-sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </NeumorphicButton>
        </GlassCard>
      </div>
    );
  }

  const hasLogs = logs.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="w-full flex-1 flex flex-col justify-between select-none space-y-4 py-1 pb-6"
    >
      {/* Top Header: Back navigation */}
      <header className="flex items-center justify-between pb-2 border-b border-slate-200/80">
        <Link
          href="/"
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white shadow-sm text-text-secondary hover:text-text-primary border border-slate-200 text-xs font-mono transition-colors active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quest Log</span>
        </Link>

        <div className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-mono text-primary font-bold">
          <Calendar className="w-3.5 h-3.5" />
          <span>Combat Archive</span>
        </div>
      </header>

      {/* Overview Card */}
      <GlassCard glow={true} className="py-4 px-4 space-y-2 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border bg-indigo-50 text-primary border-indigo-200 uppercase">
              SYSTEM HISTORY
            </span>
            <h1 className="text-xl font-black text-text-primary mt-1 tracking-tight">
              Activity History
            </h1>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-text-muted block uppercase">
              Total Records
            </span>
            <span className="text-sm font-bold text-primary font-mono">
              {logs.length} Hunts
            </span>
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          Chronicle of all completed Daily Quests and combat EXP awards.
        </p>
      </GlassCard>

      {/* Summary KPI Grid (3 Columns) */}
      <div className="grid grid-cols-3 gap-2.5">
        <GlassCard className="text-center p-3 space-y-1 bg-white">
          <div className="flex items-center justify-center text-primary mb-1">
            <Award className="w-4 h-4" />
          </div>
          <span className="text-lg font-black font-mono text-text-primary block leading-tight">
            {summary.totalWorkouts}
          </span>
          <span className="text-[10px] font-mono text-text-muted block leading-none">
            Total Hunts
          </span>
        </GlassCard>

        <GlassCard className="text-center p-3 space-y-1 bg-white">
          <div className="flex items-center justify-center text-primary mb-1">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-lg font-black font-mono text-primary block leading-tight">
            +{summary.monthlyExp}
          </span>
          <span className="text-[10px] font-mono text-text-muted block leading-none">
            Monthly EXP
          </span>
        </GlassCard>

        <GlassCard className="text-center p-3 space-y-1 bg-white">
          <div className="flex items-center justify-center text-amber-500 mb-1">
            <Flame className="w-4 h-4 fill-amber-500" />
          </div>
          <span className="text-lg font-black font-mono text-amber-600 block leading-tight">
            {summary.streak}d
          </span>
          <span className="text-[10px] font-mono text-text-muted block leading-none">
            Streak
          </span>
        </GlassCard>
      </div>

      {/* Timeline Section */}
      <div className="space-y-3 flex-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-primary" />
            Hunt Timeline
          </span>
          <span className="text-[11px] font-mono text-text-muted">
            {hasLogs ? "Newest First" : "No Records"}
          </span>
        </div>

        {hasLogs ? (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {logs.map((log, index) => (
                <motion.div
                  key={log._id || index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ delay: Math.min(index * 0.04, 0.4) }}
                >
                  <LogCard log={log} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <GlassCard className="text-center py-10 space-y-3 bg-white">
            <div className="text-4xl">🏹</div>
            <h3 className="text-base font-bold text-text-primary font-mono">
              No Hunts Completed Yet
            </h3>
            <p className="text-xs text-text-secondary max-w-[240px] mx-auto leading-relaxed">
              Complete today's Daily Quest to awaken your permanent combat record.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 border border-primary/30 text-primary text-xs font-mono font-bold hover:bg-indigo-100 transition-colors"
              >
                <Swords className="w-3.5 h-3.5" />
                Start Today's Hunt →
              </Link>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Return Button */}
      <footer className="pt-2">
        <Link
          href="/"
          className="w-full py-4 rounded-2xl bg-white shadow-sm border border-slate-200 text-text-primary font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 hover:border-primary active:scale-[0.98] transition-all"
        >
          <ChevronLeft className="w-4 h-4 text-primary" />
          Return to Daily Quest
        </Link>
      </footer>
    </motion.div>
  );
}
