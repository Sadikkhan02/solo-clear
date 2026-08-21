"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeumorphicButton } from "@/components/ui/NeumorphicButton";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  Clock,
  Target,
} from "lucide-react";

export function WorkoutTimer({
  isOpen,
  onClose,
  exercise,
  isCompleted = false,
  initialDuration = 0,
  onComplete,
}) {
  const [seconds, setSeconds] = useState(initialDuration || 0);
  const [status, setStatus] = useState("idle"); // 'idle' | 'running' | 'paused'
  const [isFinishing, setIsFinishing] = useState(false);
  const intervalRef = useRef(null);

  // Sync initial duration if provided
  useEffect(() => {
    if (isOpen) {
      setSeconds(initialDuration || 0);
      setStatus("idle");
      setIsFinishing(false);
    }
  }, [isOpen, initialDuration]);

  // Clean up interval on unmount or close
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    setStatus("running");
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const pauseTimer = () => {
    setStatus("paused");
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resumeTimer = () => {
    setStatus("running");
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const resetTimer = () => {
    setStatus("idle");
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSeconds(0);
  };

  const handleComplete = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsFinishing(true);

    const trackedSeconds = Math.max(1, seconds);

    setTimeout(() => {
      if (onComplete && exercise?.key) {
        onComplete(exercise.key, trackedSeconds);
      }
      onClose();
    }, 450);
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen || !exercise) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="relative w-full max-w-sm z-10"
        >
          <GlassCard glow={true} className="py-6 px-6 space-y-5 text-center overflow-hidden relative shadow-2xl bg-white">
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 text-text-muted hover:text-text-primary border border-slate-200 transition-colors active:scale-95"
              aria-label="Close Timer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Exercise Details */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-primary tracking-widest uppercase">
                COMBAT TIMER • {exercise.category || "SYSTEM"}
              </span>

              <h2 className="text-2xl font-black text-text-primary tracking-tight">
                {exercise.name}
              </h2>

              <div className="flex items-center justify-center gap-2 text-xs font-mono text-text-secondary">
                <Target className="w-3.5 h-3.5 text-primary" />
                <span>
                  Target: {exercise.target} {exercise.unit}
                </span>
                <span>•</span>
                <span className="text-primary font-bold">
                  {exercise.badge || "+2.5 EXP"}
                </span>
              </div>
            </div>

            {/* Large Digital Clock Display */}
            <div className="relative py-4">
              <div
                className={`text-6xl font-black font-mono tracking-tight transition-all duration-300 ${
                  status === "running"
                    ? "text-primary drop-shadow-[0_0_20px_rgba(99,102,241,0.35)]"
                    : status === "paused"
                    ? "text-amber-500"
                    : "text-text-primary"
                }`}
              >
                {formatTime(seconds)}
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-center gap-1.5 mt-2 text-[11px] font-mono text-text-muted">
                <Clock className="w-3 h-3 text-primary" />
                <span className="uppercase tracking-wider">
                  {status === "running"
                    ? "⏱ Recording Active Cadence"
                    : status === "paused"
                    ? "⏸ Workout Paused"
                    : "Ready to Begin"}
                </span>
              </div>
            </div>

            {/* Timer Control Buttons */}
            <div className="space-y-3 pt-1">
              {status === "idle" && (
                <div className="flex flex-col gap-2.5">
                  <NeumorphicButton
                    onClick={startTimer}
                    className="w-full justify-center text-white font-bold bg-gradient-to-r from-primary to-secondary shadow-glow-primary text-sm py-4 border-none"
                  >
                    <Play className="w-4 h-4 mr-2 fill-white text-white" />
                    Start Workout
                  </NeumorphicButton>

                  <button
                    onClick={handleComplete}
                    className="text-xs font-mono text-text-muted hover:text-primary transition-colors py-1"
                  >
                    Quick Complete (Bypass Timer)
                  </button>
                </div>
              )}

              {status === "running" && (
                <div className="flex flex-col gap-2.5">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={pauseTimer}
                      className="py-3.5 px-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs font-mono flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
                    >
                      <Pause className="w-4 h-4 fill-amber-600 text-amber-600" />
                      Pause
                    </button>

                    <button
                      onClick={handleComplete}
                      disabled={isFinishing}
                      className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-xs font-mono shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isFinishing ? "Saving..." : "Complete"}
                    </button>
                  </div>
                </div>
              )}

              {status === "paused" && (
                <div className="flex flex-col gap-2.5">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={resetTimer}
                      className="py-3 px-2 rounded-xl bg-slate-100 border border-slate-200 text-text-secondary font-bold text-xs font-mono flex items-center justify-center gap-1 active:scale-95 hover:text-text-primary"
                      title="Reset Timer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </button>

                    <button
                      onClick={resumeTimer}
                      className="py-3 px-2 rounded-xl bg-indigo-50 border border-indigo-200 text-primary font-bold text-xs font-mono flex items-center justify-center gap-1 active:scale-95 hover:bg-indigo-100"
                    >
                      <Play className="w-3.5 h-3.5 fill-primary text-primary" />
                      Resume
                    </button>

                    <button
                      onClick={handleComplete}
                      disabled={isFinishing}
                      className="py-3 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-xs font-mono shadow-sm flex items-center justify-center gap-1 active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isFinishing ? "Saving..." : "Done"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default WorkoutTimer;
