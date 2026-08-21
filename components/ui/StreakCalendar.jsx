"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Flame, Calendar, Info } from "lucide-react";

export function StreakCalendar({ days = [] }) {
  const [selectedDay, setSelectedDay] = useState(null);

  if (!days || days.length === 0) {
    return null;
  }

  return (
    <GlassCard className="py-4 px-4 space-y-3 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">
            Activity Heatmap
          </span>
        </div>
        <span className="text-[10px] font-mono text-dark-muted">Last 30 Days</span>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 pt-1">
        {days.map((day) => {
          let tileStyle = "bg-dark-bg/80 border-white/5 text-dark-muted";
          if (day.rate === 100) {
            tileStyle = "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] text-white font-bold";
          } else if (day.rate >= 75) {
            tileStyle = "bg-cyan-500/80 border-cyan-400/60 shadow-[0_0_6px_rgba(6,182,212,0.4)] text-white";
          } else if (day.rate >= 50) {
            tileStyle = "bg-purple-500/70 border-purple-400/50 text-white";
          } else if (day.rate > 0) {
            tileStyle = "bg-amber-500/60 border-amber-400/40 text-amber-200";
          }

          const isSelected = selectedDay?.date === day.date;

          return (
            <button
              key={day.date}
              onClick={() => setSelectedDay(day)}
              className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-1 transition-all active:scale-95 relative ${tileStyle} ${
                day.isToday ? "ring-2 ring-accent-cyan ring-offset-2 ring-offset-dark-bg" : ""
              } ${isSelected ? "scale-105" : ""}`}
              title={`${day.date}: ${day.rate}% (${day.completed}/4) • ${day.exp} EXP`}
            >
              <span className="text-[9px] font-mono leading-none">{day.shortLabel}</span>
              {day.rate > 0 && (
                <span className="text-[8px] font-mono font-bold mt-0.5 opacity-90">
                  {day.exp}x
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[9px] font-mono text-gray-400 pt-1">
        <span>Less active</span>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-dark-bg border border-white/10" title="0%" />
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-500/60 border border-amber-400/40" title="25%" />
          <div className="w-2.5 h-2.5 rounded-sm bg-purple-500/70 border border-purple-400/50" title="50%" />
          <div className="w-2.5 h-2.5 rounded-sm bg-cyan-500/80 border border-cyan-400/60" title="75%" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 border border-emerald-400" title="100%" />
        </div>
        <span>Fully Cleared</span>
      </div>

      {/* Selected Day Quick Inspector */}
      {selectedDay && (
        <div className="mt-2 p-2.5 rounded-xl bg-dark-bg/90 border border-accent-cyan/30 text-xs font-mono space-y-1">
          <div className="flex items-center justify-between text-accent-cyan font-bold">
            <span>{selectedDay.fullDate || selectedDay.date}</span>
            <span>{selectedDay.isToday ? "Today" : ""}</span>
          </div>
          <div className="flex items-center justify-between text-gray-300 text-[11px]">
            <span>Quests Cleared: {selectedDay.completed} / 4 ({selectedDay.rate}%)</span>
            <span className="text-emerald-400 font-bold">+{selectedDay.exp} EXP</span>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

export default StreakCalendar;
