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
  const completedEntries = Object.entries(exercises).filter(([, done]) => !done);
  const completedCount = completedEntries.length;
  const totalExercises = 4;

  const completedNames = completedEntries.map(
    ([key]) => EXERCISE_LABELS[key] || key
  );

  const isFullClear = completedCount === totalExercises;

  return (
    <GlassCard className="relative pl-6 py-4 border-slate-200/80 space-y-2.5 overflow-hidden bg-white">
      {/* Vertical Indicator Line */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full ${
          isFullClear ? "bg-emerald-500" : "bg-primary"
        }`}
      />

      {/* Top Row: Date and Status Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 text-xs text-text-secondary font-mono">
          <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="truncate">{formattedDate}</span>
        </div>

        <div
          className={`flex-shrink-0 px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-lg border ${
            isFullClear
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-indigo-50 text-primary border-indigo-200"
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
              className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-text-primary"
            >
              {name}
            </span>
          ))
        ) : (
          <span className="text-xs text-slate-400 font-mono">No exercises logged</span>
        )}
      </div>

      {/* Bottom Row: EXP, Level at Time, Duration */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] font-mono text-text-muted">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1 text-primary font-bold">
            <Sparkles className="w-3 h-3 text-primary" />+{earnedExp} EXP
          </span>
          <span className="flex items-center gap-1 text-text-secondary">
            <Trophy className="w-3 h-3 text-amber-500" />
            LVL {levelAtTime}
          </span>
        </div>

        <div className="flex items-center gap-1 text-text-muted">
          <Clock className="w-3 h-3" />
          <span>{durationMinutes} min</span>
        </div>
      </div>
    </GlassCard>
  );
}

export default LogCard;
