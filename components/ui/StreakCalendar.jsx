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
    <GlassCard className="py-4 px-4 space-y-3 select-none bg-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold font-mono text-text-primary uppercase tracking-wider">
            Activity Heatmap
          </span>
        </div>
        <span className="text-[10px] font-mono text-text-muted">Last 30 Days</span>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 pt-1">
        {days.map((day) => {
          let tileStyle = "bg-slate-100 border-slate-200 text-slate-400";
          if (day.rate === 100) {
            tileStyle = "bg-emerald-500 border-emerald-600 text-white font-bold shadow-sm";
          } else if (day.rate >= 75) {
            tileStyle = "bg-primary border-indigo-600 text-white shadow-sm";
          } else if (day.rate >= 50) {
            tileStyle = "bg-secondary border-purple-600 text-white shadow-sm";
          } else if (day.rate > 0) {
            tileStyle = "bg-amber-400 border-amber-500 text-amber-950 font-medium";
          }

          const isSelected = selectedDay?.date === day.date;

          return (
            <button
              key={day.date}
              onClick={() => setSelectedDay(day)}
              className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-1 transition-all active:scale-95 relative ${tileStyle} ${
                day.isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-white" : ""
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
      <div className="flex items-center justify-between text-[9px] font-mono text-text-muted pt-1">
        <span>Less active</span>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-200" title="0%" />
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-400 border border-amber-500" title="25%" />
          <div className="w-2.5 h-2.5 rounded-sm bg-secondary border border-purple-600" title="50%" />
          <div className="w-2.5 h-2.5 rounded-sm bg-primary border border-indigo-600" title="75%" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 border border-emerald-600" title="100%" />
        </div>
        <span>Fully Cleared</span>
      </div>

      {/* Selected Day Quick Inspector */}
      {selectedDay && (
        <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-primary/30 text-xs font-mono space-y-1">
          <div className="flex items-center justify-between text-primary font-bold">
            <span>{selectedDay.fullDate || selectedDay.date}</span>
            <span>{selectedDay.isToday ? "Today" : ""}</span>
          </div>
          <div className="flex items-center justify-between text-text-secondary text-[11px]">
            <span>Quests Cleared: {selectedDay.completed} / 4 ({selectedDay.rate}%)</span>
            <span className="text-emerald-600 font-bold">+{selectedDay.exp} EXP</span>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

export default StreakCalendar;
