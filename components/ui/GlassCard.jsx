"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * GlassCard component combining translucent glassmorphism with dark system neumorphism.
 * Designed with generous p-5 padding for mobile touch comfort.
 */
export function GlassCard({
  children,
  className = "",
  glow = false,
  ...props
}) {
  return (
    <motion.div
      className={`relative rounded-2xl bg-dark-card/80 backdrop-blur-xl border border-white/[0.07] p-5 shadow-neu-raised overflow-hidden transition-all duration-300 ${className}`}
      {...props}
    >
      {/* Optional ambient corner glow inside card */}
      {glow && (
        <div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-accent-cyan/15 blur-2xl pointer-events-none"
          aria-hidden="true"
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export default GlassCard;
