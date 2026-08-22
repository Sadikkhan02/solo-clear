"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Crown,
  Medal,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  Shield,
  RefreshCw,
  User,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeumorphicButton } from "@/components/ui/NeumorphicButton";

export default function RankingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [rankingData, setRankingData] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auto-redirect unauthenticated users to /login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchRankings = useCallback(async (targetPage = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ranking?page=${targetPage}&limit=20`);
      if (!res.ok) {
        throw new Error("Failed to load global hunter rankings");
      }
      const data = await res.json();
      setRankingData(data);
      setPage(data.page || 1);
    } catch (err) {
      console.error("Error loading rankings:", err);
      setError(err.message || "Could not retrieve rankings from system");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchRankings(page);
    }
  }, [authLoading, isAuthenticated, page, fetchRankings]);

  if (authLoading || (isLoading && !rankingData)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[85vh] space-y-4 select-none">
        <div className="w-12 h-12 rounded-full border-3 border-primary border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-text-muted tracking-widest uppercase">
          CALIBRATING GLOBAL LEADERBOARD...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const currentUser = rankingData?.currentUser;
  const users = rankingData?.users || [];
  const totalPages = rankingData?.totalPages || 1;
  const currentUserRank = rankingData?.currentUserRank;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex-1 flex flex-col space-y-4 select-none pb-8"
    >
      {/* Top Header */}
      <header className="flex items-center justify-between pb-2 border-b border-slate-200/80">
        <Link
          href="/profile"
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white shadow-sm text-text-secondary hover:text-text-primary border border-slate-200 text-xs font-mono transition-colors active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Profile Hub</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-mono font-bold tracking-widest uppercase">
          <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>GLOBAL LEADERBOARD</span>
        </div>
      </header>

      {/* Current User Standing Card */}
      {currentUser && (
        <GlassCard glow={true} className="p-4 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-primary shadow-sm font-bold text-base">
                #{currentUserRank || "—"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-text-primary font-mono tracking-tight">
                    @{currentUser.username}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-primary border border-indigo-200 uppercase">
                    YOU
                  </span>
                </div>
                <p className="text-xs text-text-secondary">
                  {currentUser.displayName || currentUser.username}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="text-right">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase ${
                    currentUser.tier?.badgeClass || "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {currentUser.tier?.label || "E-Rank"}
                </span>
                <div className="text-xs font-mono font-bold text-primary mt-1">
                  LVL {currentUser.level}
                </div>
              </div>

              {(currentUser.streak || 0) > 0 && (
                <div className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-mono text-amber-700 font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{currentUser.streak}d</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-text-muted border-t border-slate-100">
            <span>Standing: {currentUserRank ? `Rank #${currentUserRank} Worldwide` : "Unranked"}</span>
            <span>Total EXP: {currentUser.exp || 0}</span>
          </div>
        </GlassCard>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchRankings(page)}
            className="p-1 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-100"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Leaderboard List Card */}
      <GlassCard className="p-4 space-y-3 bg-white">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-bold font-mono text-text-primary uppercase tracking-wider">
              Top Ranked Hunters ({rankingData?.total || 0})
            </h2>
          </div>
          <span className="text-[10px] font-mono text-text-muted">
            Page {page} of {totalPages}
          </span>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-8 text-xs font-mono text-text-muted">
            No ranked hunters recorded yet. Complete awakening to rank!
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((hunter) => {
              const isCurrentUser =
                hunter.id === currentUser?.id || hunter.username === currentUser?.username;

              // Top 3 Badge styling
              const isRank1 = hunter.rank === 1;
              const isRank2 = hunter.rank === 2;
              const isRank3 = hunter.rank === 3;

              return (
                <div
                  key={hunter.id || hunter.rank}
                  className={`p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                    isCurrentUser
                      ? "bg-indigo-50/70 border-primary ring-1 ring-primary/40 shadow-sm"
                      : "bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-100/40"
                  }`}
                >
                  {/* Left: Rank & Hunter Info */}
                  <div className="flex items-center space-x-3 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs flex-shrink-0 border ${
                        isRank1
                          ? "bg-amber-100 border-amber-300 text-amber-800 shadow-sm"
                          : isRank2
                          ? "bg-slate-200 border-slate-300 text-slate-800 shadow-sm"
                          : isRank3
                          ? "bg-amber-50 border-amber-200 text-amber-900"
                          : "bg-white border-slate-200 text-text-secondary"
                      }`}
                    >
                      {isRank1 ? (
                        <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                      ) : isRank2 ? (
                        <Medal className="w-4 h-4 text-slate-600" />
                      ) : isRank3 ? (
                        <Medal className="w-4 h-4 text-amber-700" />
                      ) : (
                        `#${hunter.rank}`
                      )}
                    </div>

                    {/* Handle & Display Name */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-xs font-bold text-text-primary font-mono truncate">
                          @{hunter.username}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-primary border border-indigo-200">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-secondary truncate">
                        {hunter.displayName || hunter.username}
                      </p>
                    </div>
                  </div>

                  {/* Right: Level, Tier & Streak */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase ${
                        hunter.tier?.badgeClass || "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {hunter.tier?.label || "E-Rank"}
                    </span>

                    <div className="text-right">
                      <div className="text-xs font-mono font-black text-primary leading-none">
                        LVL {hunter.level}
                      </div>
                      <div className="text-[9px] font-mono text-text-muted mt-0.5">
                        {hunter.exp || 0} EXP
                      </div>
                    </div>

                    {(hunter.streak || 0) > 0 && (
                      <div className="flex items-center space-x-0.5 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[10px] font-mono text-amber-700 font-bold">
                        <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{hunter.streak}d</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-text-secondary hover:text-text-primary hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 active:scale-95 transition-all shadow-sm"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <span className="text-xs font-mono text-text-muted">
              Page <strong className="text-text-primary">{page}</strong> of{" "}
              <strong className="text-text-primary">{totalPages}</strong>
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-text-secondary hover:text-text-primary hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 active:scale-95 transition-all shadow-sm"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </GlassCard>

      {/* Return to Dashboard */}
      <footer className="pt-1">
        <Link
          href="/"
          className="w-full py-4 rounded-2xl bg-white shadow-sm border border-slate-200 text-text-primary font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 hover:border-primary active:scale-[0.98] transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-primary" />
          <span>Return to Quest Log</span>
        </Link>
      </footer>
    </motion.div>
  );
}
