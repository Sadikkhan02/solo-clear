"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { Award, CheckCircle2 } from "lucide-react";

// Custom Tooltip component for BarChart
function CustomBarTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl bg-white/95 backdrop-blur-md border border-emerald-300 p-3 shadow-lg text-xs font-mono select-none">
        <p className="text-text-muted font-bold border-b border-slate-100 pb-1 mb-1.5">
          {data.fullDate || label}
        </p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-text-secondary">Completion Rate:</span>
            <span className="text-emerald-600 font-black">{data.rate}%</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-text-secondary">Quests Finished:</span>
            <span className="text-primary font-bold">{data.completed} / 4</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function CompletionBarChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <GlassCard className="py-8 px-4 text-center space-y-2 bg-white">
        <Award className="w-8 h-8 mx-auto text-slate-400" />
        <p className="text-xs font-mono text-text-muted">No workout records available.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="py-4 px-3 space-y-3 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold font-mono text-text-primary uppercase tracking-wider">
            Daily Completion Rate
          </span>
        </div>
        <span className="text-[10px] font-mono text-text-muted">0% - 100% Scale</span>
      </div>

      {/* Bar Chart Area */}
      <div className="w-full h-48 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
              domain={[0, 100]}
              tickLine={false}
              axisLine={{ stroke: "rgba(0, 0, 0, 0.1)" }}
              tick={{ fill: "#8a8a9e", fontSize: 10, fontFamily: "monospace" }}
              ticks={[0, 25, 50, 75, 100]}
              unit="%"
            />

            <Tooltip content={<CustomBarTooltip />} />

            <Bar dataKey="rate" radius={[5, 5, 0, 0]}>
              {data.map((entry, index) => {
                let fillColor = "#e2e8f0"; // 0%
                if (entry.rate === 100) fillColor = "#10b981"; // 100% emerald
                else if (entry.rate >= 75) fillColor = "#6366f1"; // 75% indigo
                else if (entry.rate >= 50) fillColor = "#8b5cf6"; // 50% violet
                else if (entry.rate > 0) fillColor = "#f59e0b"; // 25% amber

                return <Cell key={`cell-${index}`} fill={fillColor} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

export default CompletionBarChart;
