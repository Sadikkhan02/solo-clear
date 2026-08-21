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
      <div className="rounded-xl bg-[#0e111a]/95 backdrop-blur-xl border border-accent-cyan/40 p-3 shadow-2xl text-xs font-mono select-none">
        <p className="text-gray-400 font-bold border-b border-white/10 pb-1 mb-1.5">
          {data.fullDate || label}
        </p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-300">Daily EXP:</span>
            <span className="text-accent-cyan font-black">+{data.exp} EXP</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-300">Cumulative:</span>
            <span className="text-purple-400 font-bold">{data.cumulativeExp} EXP</span>
          </div>
          {data.level !== undefined && data.level > 0 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-300">Level:</span>
              <span className="text-amber-400 font-bold">LVL {data.level}</span>
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
      <GlassCard className="py-8 px-4 text-center space-y-2">
        <TrendingUp className="w-8 h-8 mx-auto text-gray-500" />
        <p className="text-xs font-mono text-gray-400">No workout data for this timeframe.</p>
      </GlassCard>
    );
  }

  const activeKey = viewMode === "daily" ? "exp" : "cumulativeExp";

  return (
    <GlassCard className="py-4 px-3 space-y-3">
      {/* Header & Mode Toggle */}
      <div className="flex items-center justify-between px-2 pb-1 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-accent-cyan" />
          <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">
            EXP Progression
          </span>
        </div>

        {/* Daily vs Cumulative Toggle Pills */}
        <div className="flex items-center p-0.5 rounded-lg bg-dark-bg/80 border border-white/5">
          <button
            onClick={() => setViewMode("daily")}
            className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
              viewMode === "daily"
                ? "bg-accent-cyan/20 text-accent-cyan shadow-glow-cyan"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setViewMode("cumulative")}
            className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
              viewMode === "cumulative"
                ? "bg-purple-500/20 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                : "text-gray-400 hover:text-white"
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
              <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4facfe" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#4facfe" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />

            <XAxis
              dataKey="formattedDate"
              tickLine={false}
              axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
              tick={{ fill: "#9ca3af", fontSize: 10, fontFamily: "monospace" }}
              interval="preserveStartEnd"
              minTickGap={20}
            />

            <YAxis
              tickLine={false}
              axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
              tick={{ fill: "#9ca3af", fontSize: 10, fontFamily: "monospace" }}
              allowDecimals={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey={activeKey}
              stroke={viewMode === "daily" ? "#4facfe" : "#a855f7"}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={viewMode === "daily" ? "url(#cyanGradient)" : "url(#purpleGradient)"}
              activeDot={{
                r: 5,
                stroke: viewMode === "daily" ? "#4facfe" : "#a855f7",
                strokeWidth: 2,
                fill: "#0e111a",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

export default ExpChart;
