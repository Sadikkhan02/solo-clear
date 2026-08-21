"use client";

import React from "react";
import { format, formatDistanceToNow, isToday } from "date-fns";
import { GlassCard } from "@/components/ui/GlassCard";
import { Sparkles, Calendar, Clock, Trophy } from "lucide-react";

const EXERCISE_LABELS = {
  pushups: "Push-ups 💪",
  squats: "Squats 🦵",
  crunches: "Crunches 🔥",
  running: "Running 🏃",
};

export function LogCard({ log }) {
  const {
    exercises = {},
    earnedExp = 0,
    levelAtTime = 0,
    durationMinutes = 15,
    timestamp,
    date,
  } = log || {};

  // Date formatting via date-fns
  const logDate = timestamp ? new Date(timestamp) : new Date(date);
  let formattedDate;
  try {
    if (isToday(logDate)) {
      formattedDate = `Today at ${format(logDate, "h:mm a")}`;
    } else {
      const daysAgo = formatDistanceToNow(logDate, { addSuffix: true });
      formattedDate = `${format(logDate, "MMM d, yyyy")} • ${daysAgo}`;
    }
  } catch (e) {
    formattedDate = date || "Recent Hunt";
  }

  // Count completed exercises
  const completedEntries = Object.entries(exercises).filter(([, done]) => !!done);
  const completedCount = completedEntries.length;
  const totalExercises = 4;

  const completedNames = completedEntries.map(
    ([key]) => EXERCISE_LABELS[key] || key
  );

  const isFullClear = completedCount === totalExercises;

  return (
    <GlassCard className="relative pl-6 py-4 border-white/5 space-y-2.5 overflow-hidden">
      {/* Vertical Cyan Accent Indicator Line */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full ${
          isFullClear ? "bg-accent-cyan shadow-glow-cyan" : "bg-blue-600/50"
        }`}
      />

      {/* Top Row: Date and Status Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 text-xs text-gray-300 font-mono">
          <Calendar className="w-3.5 h-3.5 text-accent-cyan flex-shrink-0" />
          <span className="truncate">{formattedDate}</span>
        </div>

        <div
          className={`flex-shrink-0 px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-lg border ${
            isFullClear
              ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/40"
              : "bg-cyan-950/60 text-cyan-300 border-cyan-800/40"
          }`}
        >
          {completedCount}/{totalExercises}
          {isFullClear ? " FULL CLEAR" : " PARTIAL"}
        </div>
      </div>

      {/* Exercises Chips */}
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {completedNames.length > 0 ? (
          completedNames.map((name, i) => (
            <span
              key={i}
              className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-dark-bg/80 border border-white/5 text-gray-200"
            >
              {name}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-500 font-mono">No exercises logged</span>
        )}
      </div>

      {/* Bottom Row: EXP, Level at Time, Duration */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] font-mono text-dark-muted">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1 text-accent-cyan font-bold">
            <Sparkles className="w-3 h-3" />+{earnedExp} EXP
          </span>
          <span className="flex items-center gap-1 text-gray-400">
            <Trophy className="w-3 h-3" />
            LVL {levelAtTime}
          </span>
        </div>

        <div className="flex items-center gap-1 text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{durationMinutes} min</span>
        </div>
      </div>
    </GlassCard>
  );
}

export default LogCard;
