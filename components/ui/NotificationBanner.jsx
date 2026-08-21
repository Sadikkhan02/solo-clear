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
    borderColor: "border-primary/40",
    glowColor: "shadow-glow-primary",
    iconBg: "bg-indigo-50 border-indigo-200 text-primary",
    titleColor: "text-primary",
    badge: "SYSTEM AWAKENING",
    defaultIcon: <Zap className="w-4 h-4 text-primary fill-primary" />,
  },
  summary: {
    borderColor: "border-secondary/40",
    glowColor: "shadow-md",
    iconBg: "bg-purple-50 border-purple-200 text-secondary",
    titleColor: "text-secondary",
    badge: "DAILY BRIEFING",
    defaultIcon: <Award className="w-4 h-4 text-secondary" />,
  },
  complete: {
    borderColor: "border-emerald-200",
    glowColor: "shadow-md",
    iconBg: "bg-emerald-50 border-emerald-200 text-emerald-600",
    titleColor: "text-emerald-700",
    badge: "QUEST CLEAR",
    defaultIcon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  },
  reminder: {
    borderColor: "border-amber-200",
    glowColor: "shadow-md",
    iconBg: "bg-amber-50 border-amber-200 text-amber-600",
    titleColor: "text-amber-700",
    badge: "SYSTEM NOTICE",
    defaultIcon: <Bell className="w-4 h-4 text-amber-600" />,
  },
  info: {
    borderColor: "border-slate-200",
    glowColor: "shadow-md",
    iconBg: "bg-slate-50 border-slate-200 text-primary",
    titleColor: "text-primary",
    badge: "ALERT",
    defaultIcon: <Info className="w-4 h-4 text-primary" />,
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
              className={`w-full pointer-events-auto rounded-2xl bg-white border ${config.borderColor} ${config.glowColor} p-3.5 shadow-lg relative overflow-hidden select-none`}
            >
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
                    <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-text-muted">
                      {config.badge}
                    </span>
                  </div>

                  <h3 className={`text-xs font-bold font-mono tracking-wide ${config.titleColor}`}>
                    {notif.title}
                  </h3>

                  {notif.message && (
                    <p className="text-[11px] text-text-secondary leading-snug mt-0.5 break-words">
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-primary/40 text-primary text-[11px] font-mono font-bold hover:bg-indigo-100 active:scale-95 transition-all shadow-sm"
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
                  className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-text-primary hover:bg-slate-100 active:scale-90 transition-all"
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
