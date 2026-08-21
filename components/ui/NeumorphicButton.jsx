"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

/**
 * Button: Clean tactile interactive component for the Light & Indigo theme.
 * Features 56px minimum touch target, whileTap feedback, and crisp borders.
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
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`min-h-[56px] w-full flex items-center justify-between rounded-2xl px-4 py-3 bg-white select-none text-sm transition-all duration-200 border ${
        isCompleted
          ? "border-emerald-500/30 bg-emerald-50/50 text-slate-500 shadow-sm"
          : "border-slate-200/90 text-text-primary shadow-sm hover:border-primary/40 hover:shadow-md"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      {...props}
    >
      {children ? (
        children
      ) : (
        <>
          {/* Left: Status Icon & Title / Subtitle */}
          <div className="flex items-center space-x-3 text-left min-w-0 pr-2">
            <div className="flex-shrink-0">
              {icon ? (
                icon
              ) : isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <Circle className="w-5 h-5 text-slate-400" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-semibold truncate leading-tight transition-colors ${
                  isCompleted ? "line-through text-slate-400" : "text-text-primary"
                }`}
              >
                {title}
              </p>
              {subtitle && (
                <p className="text-[11px] font-mono text-text-muted truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Badge / EXP readout */}
          {badge && (
            <div className="flex-shrink-0 pl-2">
              <span
                className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl transition-colors ${
                  isCompleted
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
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

export const Button = NeumorphicButton;
export default NeumorphicButton;
