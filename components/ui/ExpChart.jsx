"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { Sparkles, TrendingUp } from "lucide-react";

// Custom Tooltip component for Recharts
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl bg-white/95 backdrop-blur-md border border-primary/40 p-3 shadow-lg text-xs font-mono select-none">
        <p className="text-text-muted font-bold border-b border-slate-100 pb-1 mb-1.5">
          {data.fullDate || label}
        </p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-text-secondary">Daily EXP:</span>
            <span className="text-primary font-black">+{data.exp} EXP</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-text-secondary">Cumulative:</span>
            <span className="text-secondary font-bold">{data.cumulativeExp} EXP</span>
          </div>
          {data.level !== undefined && data.level > 0 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-text-secondary">Level:</span>
              <span className="text-amber-600 font-bold">LVL {data.level}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export function ExpChart({ data = [] }) {
  const [viewMode, setViewMode] = useState("daily"); // 'daily' | 'cumulative'

  if (!data || data.length === 0) {
    return (
      <GlassCard className="py-8 px-4 text-center space-y-2 bg-white">
        <TrendingUp className="w-8 h-8 mx-auto text-slate-400" />
        <p className="text-xs font-mono text-text-muted">No workout data for this timeframe.</p>
      </GlassCard>
    );
  }

  const activeKey = viewMode === "daily" ? "exp" : "cumulativeExp";

  return (
    <GlassCard className="py-4 px-3 space-y-3 bg-white">
      {/* Header & Mode Toggle */}
      <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold font-mono text-text-primary uppercase tracking-wider">
            EXP Progression
          </span>
        </div>

        {/* Daily vs Cumulative Toggle Pills */}
        <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setViewMode("daily")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
              viewMode === "daily"
                ? "bg-white text-primary shadow-sm"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setViewMode("cumulative")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
              viewMode === "cumulative"
                ? "bg-white text-secondary shadow-sm"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Cumulative
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full h-56 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.05)" vertical={false} />

            <XAxis
              dataKey="formattedDate"
              tickLine={false}
              axisLine={{ stroke: "rgba(0, 0, 0, 0.1)" }}
              tick={{ fill: "#8a8a9e", fontSize: 10, fontFamily: "monospace" }}
              interval="preserveStartEnd"
              minTickGap={20}
            />

            <YAxis
              tickLine={false}
              axisLine={{ stroke: "rgba(0, 0, 0, 0.1)" }}
              tick={{ fill: "#8a8a9e", fontSize: 10, fontFamily: "monospace" }}
              allowDecimals={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey={activeKey}
              stroke={viewMode === "daily" ? "#6366f1" : "#8b5cf6"}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={viewMode === "daily" ? "url(#indigoGradient)" : "url(#violetGradient)"}
              activeDot={{
                r: 5,
                stroke: viewMode === "daily" ? "#6366f1" : "#8b5cf6",
                strokeWidth: 2,
                fill: "#ffffff",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

export default ExpChart;
