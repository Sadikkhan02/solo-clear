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
      <div className="rounded-xl bg-white/95 backdrop-blur-md border border-primary/40 p-2.5 shadow-lg text-xs font-mono select-none">
        <p className="text-text-primary font-bold">{data.fullSubject || data.subject}</p>
        <p className="text-primary font-black text-sm">
          Value: {data.stat} <span className="text-text-muted font-normal text-xs">pts</span>
        </p>
      </div>
    );
  }
  return null;
}

export function StatRadarChart({ stats = { str: 0, vit: 0, agi: 0, con: 0 }, statPoints = 0 }) {
  const str = stats?.str || 0;
  const vit = stats?.vit || 0;
  const agi = stats?.agi || 0;
  const con = stats?.con || 0;
  const totalStats = str + vit + agi + con;

  const maxVal = Math.max(15, str, vit, agi, con);

  // 4-Axis Balanced Diamond: STR (Top) -> AGI (Right) -> VIT (Bottom) -> CON (Left)
  const radarData = [
    { subject: "STR", fullSubject: "Strength (STR)", stat: str, max: maxVal },
    { subject: "AGI", fullSubject: "Agility (AGI)", stat: agi, max: maxVal },
    { subject: "VIT", fullSubject: "Vitality (VIT)", stat: vit, max: maxVal },
    { subject: "CON", fullSubject: "Constitution (CON)", stat: con, max: maxVal },
  ];

  // Archetype evaluation
  let archetype = "Balanced Shadow Monarch";
  if (con > str && con > vit && con > agi) archetype = "Iron Fortress / Juggernaut";
  else if (str > vit && str > agi && str > con) archetype = "Striker / Vanguard";
  else if (vit > str && vit > agi && vit > con) archetype = "Endurance Tank";
  else if (agi > str && agi > vit && agi > con) archetype = "Speed Assassin";

  return (
    <GlassCard className="py-4 px-4 space-y-3.5 select-none relative overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold font-mono text-text-primary uppercase tracking-wider">
            Attribute Calibration
          </span>
        </div>
        <span className="text-[10px] font-mono text-primary font-bold">
          {archetype}
        </span>
      </div>

      {/* Spider / Radar Chart Display */}
      <div className="w-full h-56 -my-2 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="rgba(0, 0, 0, 0.08)" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#6366f1", fontSize: 11, fontFamily: "monospace", fontWeight: "bold" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, maxVal]}
              tick={{ fill: "#8a8a9e", fontSize: 9, fontFamily: "monospace" }}
              axisLine={false}
            />
            <Tooltip content={<CustomRadarTooltip />} />
            <Radar
              name="Hunter Stats"
              dataKey="stat"
              stroke="#6366f1"
              strokeWidth={2}
              fill="#6366f1"
              fillOpacity={0.25}
              dot={{
                r: 4,
                fill: "#ffffff",
                stroke: "#6366f1",
                strokeWidth: 2,
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 4 Stat Value Chips */}
      <div className="grid grid-cols-4 gap-1.5 text-center pt-1">
        <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 shadow-sm">
          <span className="text-[9px] font-mono text-rose-600 block font-bold">STR</span>
          <span className="text-sm font-black font-mono text-text-primary">{str}</span>
        </div>
        <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 shadow-sm">
          <span className="text-[9px] font-mono text-indigo-600 block font-bold">AGI</span>
          <span className="text-sm font-black font-mono text-text-primary">{agi}</span>
        </div>
        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm">
          <span className="text-[9px] font-mono text-emerald-600 block font-bold">VIT</span>
          <span className="text-sm font-black font-mono text-text-primary">{vit}</span>
        </div>
        <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 shadow-sm">
          <span className="text-[9px] font-mono text-amber-600 block font-bold">CON</span>
          <span className="text-sm font-black font-mono text-text-primary">{con}</span>
        </div>
      </div>

      {/* Quick Link to Status Screen */}
      <div className="pt-1">
        <Link
          href="/status"
          className={`w-full py-3 px-4 rounded-xl border flex items-center justify-between text-xs font-mono font-bold transition-all shadow-sm ${
            statPoints > 0
              ? "bg-indigo-50 border-primary/40 text-primary hover:bg-indigo-100 shadow-glow-primary"
              : "bg-white border-slate-200 text-text-secondary hover:text-primary"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            {statPoints > 0 ? `${statPoints} Stat Points Available` : "Calibrate Attributes"}
          </span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </GlassCard>
  );
}

export default StatRadarChart;
