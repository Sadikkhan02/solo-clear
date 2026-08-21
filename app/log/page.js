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
        <div className="w-10 h-10 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-gray-400 tracking-widest uppercase">
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
        <GlassCard className="text-center space-y-4 w-full">
          <div className="text-4xl">⚠️</div>
          <h3 className="text-lg font-bold text-white font-mono">CONNECTION LOST</h3>
          <p className="text-xs text-gray-400 leading-relaxed">{error}</p>
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
      <header className="flex items-center justify-between pb-3 border-b border-white/5">
        <Link
          href="/"
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-dark-card shadow-neu-raised text-gray-300 hover:text-white border border-white/5 text-xs font-mono transition-colors active:shadow-neu-pressed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quest Log</span>
        </Link>

        <div className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-dark-card shadow-neu-pressed border border-accent-cyan/30 text-xs font-mono text-accent-cyan">
          <Calendar className="w-3.5 h-3.5" />
          <span>Combat Archive</span>
        </div>
      </header>

      {/* Overview Card */}
      <GlassCard glow={true} className="py-4 px-5 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border bg-cyan-950/80 text-cyan-300 border-cyan-800/50">
              SYSTEM HISTORY
            </span>
            <h1 className="text-xl font-black text-white mt-1 tracking-tight">
              Activity History
            </h1>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-dark-muted block uppercase">
              Total Records
            </span>
            <span className="text-sm font-bold text-accent-cyan font-mono">
              {logs.length} Hunts
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          Chronicle of all completed Daily Quests and combat EXP awards.
        </p>
      </GlassCard>

      {/* Summary KPI Grid (3 Columns) */}
      <div className="grid grid-cols-3 gap-2.5">
        <GlassCard className="text-center p-3 space-y-1">
          <div className="flex items-center justify-center text-accent-cyan mb-1">
            <Award className="w-4 h-4" />
          </div>
          <span className="text-lg font-black font-mono text-white block leading-tight">
            {summary.totalWorkouts}
          </span>
          <span className="text-[10px] font-mono text-dark-muted block leading-none">
            Total Hunts
          </span>
        </GlassCard>

        <GlassCard className="text-center p-3 space-y-1">
          <div className="flex items-center justify-center text-accent-cyan mb-1">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-lg font-black font-mono text-accent-cyan block leading-tight">
            +{summary.monthlyExp}
          </span>
          <span className="text-[10px] font-mono text-dark-muted block leading-none">
            Monthly EXP
          </span>
        </GlassCard>

        <GlassCard className="text-center p-3 space-y-1">
          <div className="flex items-center justify-center text-amber-400 mb-1">
            <Flame className="w-4 h-4 fill-amber-400" />
          </div>
          <span className="text-lg font-black font-mono text-amber-400 block leading-tight">
            {summary.streak}d
          </span>
          <span className="text-[10px] font-mono text-dark-muted block leading-none">
            Streak
          </span>
        </GlassCard>
      </div>

      {/* Timeline Section */}
      <div className="space-y-3 flex-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-accent-cyan" />
            Hunt Timeline
          </span>
          <span className="text-[11px] font-mono text-dark-muted">
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
          <GlassCard className="text-center py-10 space-y-3">
            <div className="text-4xl">🏹</div>
            <h3 className="text-base font-bold text-white font-mono">
              No Hunts Completed Yet
            </h3>
            <p className="text-xs text-gray-400 max-w-[240px] mx-auto leading-relaxed">
              Complete today's Daily Quest to awaken your permanent combat record.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-mono font-bold hover:bg-accent-cyan/20 transition-colors"
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
          className="w-full py-4 rounded-2xl bg-dark-card shadow-neu-raised border border-white/5 text-gray-200 font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 hover:text-white active:shadow-neu-pressed transition-all"
        >
          <ChevronLeft className="w-4 h-4 text-accent-cyan" />
          Return to Daily Quest
        </Link>
      </footer>
    </motion.div>
  );
}
