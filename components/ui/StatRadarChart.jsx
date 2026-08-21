"use client";

import React from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { Sliders, Sparkles, Shield, Zap, Wind, ArrowRight } from "lucide-react";

// Custom Tooltip component for RadarChart
function CustomRadarTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl bg-[#0e111a]/95 backdrop-blur-xl border border-accent-cyan/40 p-2.5 shadow-2xl text-xs font-mono select-none">
        <p className="text-gray-300 font-bold">{data.subject}</p>
        <p className="text-accent-cyan font-black text-sm">
          Value: {data.stat} <span className="text-gray-400 font-normal text-xs">pts</span>
        </p>
      </div>
    );
  }
  return null;
}

export function StatRadarChart({ stats = { str: 0, vit: 0, agi: 0 }, statPoints = 0 }) {
  const str = stats.str || 0;
  const vit = stats.vit || 0;
  const agi = stats.agi || 0;
  const totalStats = str + vit + agi;

  const maxVal = Math.max(15, str, vit, agi);

  const radarData = [
    { subject: "STR", fullSubject: "Strength (STR)", stat: str, max: maxVal },
    { subject: "VIT", fullSubject: "Vitality (VIT)", stat: vit, max: maxVal },
    { subject: "AGI", fullSubject: "Agility (AGI)", stat: agi, max: maxVal },
  ];

  // Archetype evaluation
  let archetype = "Balanced Hunter";
  if (str > vit && str > agi) archetype = "Striker / Vanguard";
  else if (vit > str && vit > agi) archetype = "Endurance Tank";
  else if (agi > str && agi > vit) archetype = "Speed Assassin";

  return (
    <GlassCard className="py-4 px-4 space-y-3.5 select-none relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-accent-cyan" />
          <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">
            Attribute Calibration
          </span>
        </div>
        <span className="text-[10px] font-mono text-accent-cyan font-bold">
          {archetype}
        </span>
      </div>

      {/* Spider / Radar Chart Display */}
      <div className="w-full h-56 -my-2 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#4facfe", fontSize: 11, fontFamily: "monospace", fontWeight: "bold" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, maxVal]}
              tick={{ fill: "#6b7280", fontSize: 9, fontFamily: "monospace" }}
              axisLine={false}
            />
            <Tooltip content={<CustomRadarTooltip />} />
            <Radar
              name="Hunter Stats"
              dataKey="stat"
              stroke="#4facfe"
              strokeWidth={2}
              fill="#4facfe"
              fillOpacity={0.4}
              dot={{
                r: 4,
                fill: "#0e111a",
                stroke: "#4facfe",
                strokeWidth: 2,
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Stat Value Chips */}
      <div className="grid grid-cols-3 gap-2 text-center pt-1">
        <div className="p-2 rounded-xl bg-dark-bg/80 border border-red-500/20 shadow-neu-pressed">
          <span className="text-[10px] font-mono text-red-400 block font-bold">STR</span>
          <span className="text-base font-black font-mono text-white">{str}</span>
        </div>
        <div className="p-2 rounded-xl bg-dark-bg/80 border border-emerald-500/20 shadow-neu-pressed">
          <span className="text-[10px] font-mono text-emerald-400 block font-bold">VIT</span>
          <span className="text-base font-black font-mono text-white">{vit}</span>
        </div>
        <div className="p-2 rounded-xl bg-dark-bg/80 border border-cyan-500/20 shadow-neu-pressed">
          <span className="text-[10px] font-mono text-cyan-400 block font-bold">AGI</span>
          <span className="text-base font-black font-mono text-white">{agi}</span>
        </div>
      </div>

      {/* Quick Link to Status Screen */}
      <div className="pt-1">
        <Link
          href="/status"
          className={`w-full py-3 px-4 rounded-xl border flex items-center justify-between text-xs font-mono font-bold transition-all shadow-neu-raised ${
            statPoints > 0
              ? "bg-accent-cyan/15 border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/25 shadow-glow-cyan"
              : "bg-dark-bg/80 border-white/5 text-gray-300 hover:text-accent-cyan"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
            {statPoints > 0 ? `${statPoints} Stat Points Available` : "Calibrate Attributes"}
          </span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </GlassCard>
  );
}

export default StatRadarChart;
