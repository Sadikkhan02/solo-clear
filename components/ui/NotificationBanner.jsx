"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "@/context/NotificationContext";
import {
  Zap,
  Award,
  CheckCircle2,
  Bell,
  X,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";

const THEME_CONFIG = {
  levelup: {
    borderColor: "border-accent-cyan/50",
    glowColor: "shadow-[0_0_25px_rgba(79,172,254,0.35)]",
    iconBg: "bg-accent-cyan/15 border-accent-cyan/40 text-accent-cyan",
    titleColor: "text-accent-cyan",
    badge: "SYSTEM AWAKENING",
    defaultIcon: <Zap className="w-4 h-4 text-accent-cyan fill-accent-cyan" />,
  },
  summary: {
    borderColor: "border-purple-500/50",
    glowColor: "shadow-[0_0_25px_rgba(168,85,247,0.35)]",
    iconBg: "bg-purple-500/15 border-purple-500/40 text-purple-400",
    titleColor: "text-purple-300",
    badge: "DAILY BRIEFING",
    defaultIcon: <Award className="w-4 h-4 text-purple-400" />,
  },
  complete: {
    borderColor: "border-emerald-500/50",
    glowColor: "shadow-[0_0_25px_rgba(16,185,129,0.35)]",
    iconBg: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400",
    titleColor: "text-emerald-300",
    badge: "QUEST CLEAR",
    defaultIcon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  },
  reminder: {
    borderColor: "border-amber-500/50",
    glowColor: "shadow-[0_0_25px_rgba(245,158,11,0.35)]",
    iconBg: "bg-amber-500/15 border-amber-500/40 text-amber-400",
    titleColor: "text-amber-300",
    badge: "SYSTEM NOTICE",
    defaultIcon: <Bell className="w-4 h-4 text-amber-400" />,
  },
  info: {
    borderColor: "border-blue-500/40",
    glowColor: "shadow-[0_0_20px_rgba(59,130,246,0.25)]",
    iconBg: "bg-blue-500/15 border-blue-500/30 text-blue-400",
    titleColor: "text-blue-300",
    badge: "ALERT",
    defaultIcon: <Info className="w-4 h-4 text-blue-400" />,
  },
};

export function NotificationBanner() {
  const { notifications, dismissNotification } = useNotification();

  return (
    <aside
      aria-label="System Notifications"
      className="fixed top-3 left-0 right-0 z-50 pointer-events-none px-4 flex flex-col items-center gap-2 max-w-sm mx-auto"
    >
      <AnimatePresence>
        {notifications.map((notif) => {
          const config = THEME_CONFIG[notif.type] || THEME_CONFIG.info;

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.94, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
              className={`w-full pointer-events-auto rounded-2xl bg-[#0e111a]/98 backdrop-blur-2xl border ${config.borderColor} ${config.glowColor} p-3.5 shadow-2xl relative overflow-hidden select-none`}
            >
              {/* Subtle Ambient Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/[0.04] to-transparent pointer-events-none" />

              <div className="flex items-start gap-3 relative z-10">
                {/* Type Icon Badge */}
                <div
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5 ${config.iconBg}`}
                >
                  {notif.icon || config.defaultIcon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-dark-muted">
                      {config.badge}
                    </span>
                  </div>

                  <h3 className={`text-xs font-bold font-mono tracking-wide ${config.titleColor}`}>
                    {notif.title}
                  </h3>

                  {notif.message && (
                    <p className="text-[11px] text-gray-300 leading-snug mt-0.5 break-words">
                      {notif.message}
                    </p>
                  )}

                  {/* Optional Action Button */}
                  {notif.action && (
                    <div className="mt-2">
                      <button
                        onClick={() => {
                          if (notif.action?.onClick) {
                            notif.action.onClick();
                          }
                          dismissNotification(notif.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-cyan/20 border border-accent-cyan/50 text-accent-cyan text-[11px] font-mono font-bold hover:bg-accent-cyan/30 active:scale-95 transition-all shadow-glow-cyan"
                      >
                        <span>{notif.action.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Dismiss X Button */}
                <button
                  onClick={() => dismissNotification(notif.id)}
                  className="absolute top-2.5 right-2.5 p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5 active:scale-90 transition-all"
                  aria-label="Dismiss Notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </aside>
  );
}

export default NotificationBanner;
