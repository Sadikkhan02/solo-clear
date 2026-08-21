"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * Modern elevated Surface Card component for the Solo Clear Light & Indigo theme.
 * Features crisp white surface, soft ambient elevation shadow, and optional glowing accents.
 */
export function GlassCard({
  children,
  className = "",
  glow = false,
  ...props
}) {
  return (
    <motion.div
      className={`relative rounded-2xl bg-white/95 backdrop-blur-md border ${
        glow
          ? "border-primary/40 shadow-glow-primary"
          : "border-slate-200/80 shadow-card"
      } p-5 overflow-hidden transition-all duration-300 ${className}`}
      {...props}
    >
      {/* Optional ambient corner glow inside card */}
      {glow && (
        <div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none"
          aria-hidden="true"
        />
      )}
      <div className="relative z-10 text-text-primary">{children}</div>
    </motion.div>
  );
}

export const Card = GlassCard;
export default GlassCard;
