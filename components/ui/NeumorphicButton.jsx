"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

/**
 * NeumorphicButton: Primary thumb-friendly interactive component for mobile actions.
 * Features 56px minimum touch target, whileTap 0.95 scale feedback,
 * and dynamic neu-pressed/neu-raised shadow toggles.
 */
export function NeumorphicButton({
  title,
  subtitle,
  badge,
  icon,
  isCompleted = false,
  onClick,
  disabled = false,
  className = "",
  children,
  ...props
}) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`min-h-[56px] w-full flex items-center justify-between rounded-2xl px-5 py-3 bg-dark-card select-none text-sm transition-colors duration-200 border ${
        isCompleted
          ? "shadow-neu-pressed border-accent-cyan/30 bg-dark-card/70 text-gray-400"
          : "shadow-neu-raised border-white/[0.04] text-white hover:border-white/10"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      {...props}
    >
      {children ? (
        children
      ) : (
        <>
          {/* Left: Status Icon & Title / Subtitle */}
          <div className="flex items-center space-x-3.5 text-left min-w-0 pr-2">
            <div className="flex-shrink-0">
              {icon ? (
                icon
              ) : isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-accent-cyan" />
              ) : (
                <Circle className="w-5 h-5 text-gray-500" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-semibold truncate leading-tight transition-colors ${
                  isCompleted ? "line-through text-gray-400" : "text-gray-100"
                }`}
              >
                {title}
              </p>
              {subtitle && (
                <p className="text-[11px] font-mono text-dark-muted truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Badge / EXP readout */}
          {badge && (
            <div className="flex-shrink-0 pl-2">
              <span
                className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg transition-colors ${
                  isCompleted
                    ? "bg-accent-cyan/10 text-accent-cyan"
                    : "bg-dark-bg text-gray-300 border border-white/5"
                }`}
              >
                {badge}
              </span>
            </div>
          )}
        </>
      )}
    </motion.button>
  );
}

export default NeumorphicButton;
