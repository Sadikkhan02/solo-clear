"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  User,
  AtSign,
  Calendar,
  Weight,
  Ruler,
  Target,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  Edit3,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeumorphicButton } from "@/components/ui/NeumorphicButton";

const GOAL_OPTIONS = [
  {
    value: "muscle",
    label: "Build Muscle",
    emoji: "💪",
    desc: "Focus on hypertrophy, strength progression, and power.",
  },
  {
    value: "fat_loss",
    label: "Fat Loss",
    emoji: "🔥",
    desc: "Maximize calorie burn while maintaining lean muscle mass.",
  },
  {
    value: "maintain",
    label: "Maintain",
    emoji: "⚡",
    desc: "Preserve current physical conditioning and build consistency.",
  },
  {
    value: "endurance",
    label: "Endurance",
    emoji: "🏃",
    desc: "Improve cardiovascular stamina, lung capacity, and agility.",
  },
  {
    value: "custom",
    label: "Custom Goal",
    emoji: "✏️",
    desc: "Define your own specific training objectives.",
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { showNotification } = useNotification();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [email, setEmail] = useState("");

  // Form fields
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [goal, setGoal] = useState("maintain");
  const [customGoal, setCustomGoal] = useState("");

  // Auto-redirect unauthenticated users to /login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch current profile data
  useEffect(() => {
    async function fetchProfile() {
      if (!isAuthenticated) return;
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) {
          throw new Error("Failed to load profile data");
        }
        const data = await res.json();
        setEmail(data.email || "");
        if (data.profile) {
          setUsername(data.profile.username || "");
          setDisplayName(data.profile.displayName || "");
          setAge(data.profile.age !== null ? String(data.profile.age) : "");
          setWeight(data.profile.weight !== null ? String(data.profile.weight) : "");
          setWeightUnit(data.profile.weightUnit || "kg");
          setHeight(data.profile.height !== null ? String(data.profile.height) : "");
          setHeightUnit(data.profile.heightUnit || "cm");
          setGoal(data.profile.goal || "maintain");
          setCustomGoal(data.profile.customGoal || "");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        showNotification({
          type: "reminder",
          title: "Profile Load Error",
          message: "Could not load existing profile. Please refresh.",
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading && isAuthenticated) {
      fetchProfile();
    }
  }, [authLoading, isAuthenticated, showNotification]);

  // Validation helpers
  const trimmedUsername = username.trim();
  const isUsernameValid =
    trimmedUsername.length === 0 ||
    (trimmedUsername.length >= 3 &&
      trimmedUsername.length <= 20 &&
      /^[a-zA-Z0-9_]+$/.test(trimmedUsername));

  const isDisplayNameValid = displayName.length <= 30;

  const isAgeValid =
    age === "" ||
    (!isNaN(Number(age)) && Number(age) >= 10 && Number(age) <= 120);

  const isWeightValid =
    weight === "" ||
    (!isNaN(Number(weight)) && Number(weight) >= 20 && Number(weight) <= 500);

  const isHeightValid =
    height === "" ||
    (!isNaN(Number(height)) && Number(height) >= 50 && Number(height) <= 300);

  const isCustomGoalValid = goal !== "custom" || customGoal.length <= 100;

  const isFormValid =
    isUsernameValid &&
    isDisplayNameValid &&
    isAgeValid &&
    isWeightValid &&
    isHeightValid &&
    isCustomGoalValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isSaving) return;

    setIsSaving(true);

    const payload = {
      username: trimmedUsername || null,
      displayName: displayName.trim() || null,
      age: age === "" ? null : Number(age),
      weight: weight === "" ? null : Number(weight),
      weightUnit,
      height: height === "" ? null : Number(height),
      heightUnit,
      goal,
      customGoal: goal === "custom" ? customGoal.trim() || null : null,
    };

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showNotification({
          type: "reminder",
          title: "Update Failed",
          message: data.error || "Could not update profile.",
          duration: 5000,
        });
        setIsSaving(false);
        return;
      }

      showNotification({
        type: "summary",
        title: "Profile Synchronized",
        message: "Your hunter records and physical parameters have been updated.",
        duration: 4000,
      });
    } catch (err) {
      console.error("Save profile error:", err);
      showNotification({
        type: "reminder",
        title: "System Error",
        message: "An unexpected error occurred while saving profile.",
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] space-y-3 select-none">
        <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-text-muted tracking-widest uppercase">
          LOADING HUNTER PROFILE...
        </p>
      </div>
    );
  }

  // Unauthenticated guard
  if (!isAuthenticated) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="w-full flex-1 flex flex-col justify-between select-none space-y-4 py-1 pb-8"
    >
      {/* Header Navigation */}
      <header className="flex items-center justify-between pb-2 border-b border-slate-200/80">
        <Link
          href="/"
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white shadow-sm text-text-secondary hover:text-text-primary border border-slate-200 text-xs font-mono transition-colors active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quest Log</span>
        </Link>

        <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-primary text-xs font-mono font-bold tracking-widest uppercase">
          HUNTER PROFILE
        </div>
      </header>

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* CARD 1: Identity & Call Sign */}
        <GlassCard glow={true} className="p-4 space-y-3.5 bg-white">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-primary">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary tracking-tight">
                Hunter Identity
              </h2>
              <p className="text-[11px] text-text-secondary">
                Public handle and display alias
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Account Email (Read-Only) */}
            <div className="space-y-1">
              <label className="text-xs font-mono font-medium text-text-muted">
                REGISTERED EMAIL
              </label>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-text-secondary flex items-center justify-between">
                <span>{email}</span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Verified
                </span>
              </div>
            </div>

            {/* Username Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="profile-username"
                  className="text-xs font-mono font-medium text-text-secondary"
                >
                  HUNTER USERNAME
                </label>
                <span className="text-[10px] font-mono text-text-muted">
                  3-20 chars (a-z, 0-9, _)
                </span>
              </div>
              <div
                className={`rounded-xl border bg-white shadow-sm overflow-hidden flex items-center px-3 transition-colors ${
                  !isUsernameValid
                    ? "border-rose-300 ring-1 ring-rose-300"
                    : "border-slate-200 focus-within:border-primary"
                }`}
              >
                <AtSign className="w-4 h-4 text-slate-400 flex-shrink-0 mr-2" />
                <input
                  id="profile-username"
                  type="text"
                  placeholder="shadow_monarch"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                  className="w-full py-2.5 bg-transparent text-text-primary placeholder-slate-400 outline-none text-sm font-mono"
                />
              </div>
              {!isUsernameValid && (
                <p className="text-[11px] text-rose-500 font-mono">
                  Username must be 3-20 characters using only letters, numbers, and underscores.
                </p>
              )}
            </div>

            {/* Display Name Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="profile-displayName"
                  className="text-xs font-mono font-medium text-text-secondary"
                >
                  DISPLAY NAME
                </label>
                <span className="text-[10px] font-mono text-text-muted">
                  {displayName.length}/30
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex items-center px-3 focus-within:border-primary transition-colors">
                <Edit3 className="w-4 h-4 text-slate-400 flex-shrink-0 mr-2" />
                <input
                  id="profile-displayName"
                  type="text"
                  placeholder="Sung Jin-Woo"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={30}
                  className="w-full py-2.5 bg-transparent text-text-primary placeholder-slate-400 outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* CARD 2: Physical Parameters */}
        <GlassCard glow={false} className="p-4 space-y-3.5 bg-white">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Weight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary tracking-tight">
                Physical Metrics
              </h2>
              <p className="text-[11px] text-text-secondary">
                Calibrate body parameters for training records
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Age Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="profile-age"
                  className="text-xs font-mono font-medium text-text-secondary"
                >
                  AGE
                </label>
                <span className="text-[10px] font-mono text-text-muted">10-120</span>
              </div>
              <div
                className={`rounded-xl border bg-white shadow-sm overflow-hidden flex items-center px-3 transition-colors ${
                  !isAgeValid
                    ? "border-rose-300 ring-1 ring-rose-300"
                    : "border-slate-200 focus-within:border-primary"
                }`}
              >
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0 mr-2" />
                <input
                  id="profile-age"
                  type="number"
                  placeholder="24"
                  min="10"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full py-2.5 bg-transparent text-text-primary placeholder-slate-400 outline-none text-sm font-mono"
                />
                <span className="text-xs text-text-muted font-mono ml-1">yrs</span>
              </div>
            </div>

            {/* Weight Input + Unit Toggle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="profile-weight"
                  className="text-xs font-mono font-medium text-text-secondary"
                >
                  WEIGHT
                </label>
                <span className="text-[10px] font-mono text-text-muted">20-500</span>
              </div>
              <div
                className={`rounded-xl border bg-white shadow-sm overflow-hidden flex items-center pl-3 pr-1 transition-colors ${
                  !isWeightValid
                    ? "border-rose-300 ring-1 ring-rose-300"
                    : "border-slate-200 focus-within:border-primary"
                }`}
              >
                <input
                  id="profile-weight"
                  type="number"
                  step="0.1"
                  placeholder="75.0"
                  min="20"
                  max="500"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full py-2.5 bg-transparent text-text-primary placeholder-slate-400 outline-none text-sm font-mono"
                />
                {/* Unit Switcher */}
                <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setWeightUnit("kg")}
                    className={`px-2 py-1 text-[10px] font-mono font-bold rounded-md transition-all ${
                      weightUnit === "kg"
                        ? "bg-white text-primary shadow-sm"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeightUnit("lbs")}
                    className={`px-2 py-1 text-[10px] font-mono font-bold rounded-md transition-all ${
                      weightUnit === "lbs"
                        ? "bg-white text-primary shadow-sm"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    lbs
                  </button>
                </div>
              </div>
            </div>

            {/* Height Input + Unit Toggle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="profile-height"
                  className="text-xs font-mono font-medium text-text-secondary"
                >
                  HEIGHT
                </label>
                <span className="text-[10px] font-mono text-text-muted">50-300</span>
              </div>
              <div
                className={`rounded-xl border bg-white shadow-sm overflow-hidden flex items-center pl-3 pr-1 transition-colors ${
                  !isHeightValid
                    ? "border-rose-300 ring-1 ring-rose-300"
                    : "border-slate-200 focus-within:border-primary"
                }`}
              >
                <input
                  id="profile-height"
                  type="number"
                  step="0.1"
                  placeholder="180.0"
                  min="50"
                  max="300"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full py-2.5 bg-transparent text-text-primary placeholder-slate-400 outline-none text-sm font-mono"
                />
                {/* Unit Switcher */}
                <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setHeightUnit("cm")}
                    className={`px-2 py-1 text-[10px] font-mono font-bold rounded-md transition-all ${
                      heightUnit === "cm"
                        ? "bg-white text-primary shadow-sm"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    cm
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeightUnit("ft")}
                    className={`px-2 py-1 text-[10px] font-mono font-bold rounded-md transition-all ${
                      heightUnit === "ft"
                        ? "bg-white text-primary shadow-sm"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    ft
                  </button>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* CARD 3: Training Goal Picker */}
        <GlassCard glow={false} className="p-4 space-y-3.5 bg-white">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary tracking-tight">
                Primary Training Focus
              </h2>
              <p className="text-[11px] text-text-secondary">
                Select your current quest priority
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {GOAL_OPTIONS.map((item) => {
              const isSelected = goal === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setGoal(item.value)}
                  className={`p-3 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                    isSelected
                      ? "bg-indigo-50/60 border-primary shadow-sm ring-1 ring-primary/40"
                      : "bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50"
                  }`}
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isSelected ? "text-primary" : "text-text-primary"
                        }`}
                      >
                        {item.label}
                      </span>
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-1">
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Goal Input (Animates in when custom is selected) */}
          <AnimatePresence>
            {goal === "custom" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="pt-1 overflow-hidden"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="profile-customGoal"
                      className="text-xs font-mono font-medium text-text-secondary"
                    >
                      CUSTOM OBJECTIVE
                    </label>
                    <span className="text-[10px] font-mono text-text-muted">
                      {customGoal.length}/100
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex items-center px-3 focus-within:border-primary transition-colors">
                    <input
                      id="profile-customGoal"
                      type="text"
                      placeholder="e.g. Master 100 pushups in a single set by end of month"
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      maxLength={100}
                      className="w-full py-2.5 bg-transparent text-text-primary placeholder-slate-400 outline-none text-xs"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* Submit Save Button */}
        <div className="pt-2">
          <NeumorphicButton
            type="submit"
            disabled={!isFormValid || isSaving}
            className="w-full justify-center text-center text-white font-bold bg-gradient-to-r from-primary to-secondary shadow-glow-primary hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none py-4 text-sm"
          >
            {isSaving ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Synchronizing Profile...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </div>
            )}
          </NeumorphicButton>
        </div>
      </form>

      {/* Skip for Now Link */}
      <div className="text-center pt-2">
        <Link
          href="/"
          className="text-xs text-text-muted hover:text-primary transition-colors inline-flex items-center gap-1 font-mono"
        >
          <span>Skip for Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
