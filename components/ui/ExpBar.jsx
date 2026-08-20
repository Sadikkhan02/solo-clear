"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * ExpBar: Mobile-optimized EXP gauge featuring a thick h-5 track,
 * neumorphic pressed inset depth, and an atmospheric cyan glowing gradient.
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
      {/* Track: h-5 with shadow-neu-pressed */}
      <div className="w-full h-5 rounded-full bg-dark-bg p-0.5 shadow-neu-pressed border border-white/5 relative overflow-hidden flex items-center">
        {/* Animated Gradient Fill with Cyan Glow */}
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-cyan shadow-glow-cyan"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />

        {/* Center Progress Text Over Bar on Mobile */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] font-mono font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Subtext info */}
      {showLabels && (
        <div className="flex justify-between items-center text-[10px] font-mono text-dark-muted px-1">
          <span>{sublabel || "Level Progress"}</span>
          <span className="text-gray-300">
            {current} <span className="text-dark-muted">/ {max} EXP</span>
          </span>
        </div>
      )}
    </div>
  );
}

export default ExpBar;
