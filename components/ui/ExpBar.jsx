"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * ExpBar: Mobile-optimized EXP gauge featuring an Indigo-to-Violet gradient track,
 * crisp percentage labels, and clean metadata display.
 */
export function ExpBar({
  current = 0,
  max = 10,
  showLabels = true,
  sublabel,
  className = "",
}) {
  const safeMax = Math.max(1, max);
  const percentage = Math.min(100, Math.max(0, Math.round((current / safeMax) * 100)));

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {/* Track: h-5 with subtle inset border */}
      <div className="w-full h-5 rounded-full bg-slate-100 p-0.5 border border-slate-200/80 shadow-inner relative overflow-hidden flex items-center">
        {/* Animated Gradient Fill with Indigo Glow */}
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary shadow-glow-primary"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />

        {/* Center Progress Text Over Bar on Mobile */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] font-mono font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Subtext info */}
      {showLabels && (
        <div className="flex justify-between items-center text-[10px] font-mono text-text-muted px-1">
          <span>{sublabel || "Level Progress"}</span>
          <span className="text-text-primary font-bold">
            {current} <span className="text-text-muted font-normal">/ {max} EXP</span>
          </span>
        </div>
      )}
    </div>
  );
}

export default ExpBar;
