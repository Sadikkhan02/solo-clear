"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  User,
  Sliders,
  Trophy,
  BarChart3,
  BookOpen,
  Globe2,
  Lock,
  LogOut,
  Flame,
  Sparkles,
  Save,
  Check,
  X,
  Edit3,
  Calendar,
  Weight,
  Target,
  KeyRound,
  Shield,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeumorphicButton } from "@/components/ui/NeumorphicButton";
import { ExpBar } from "@/components/ui/ExpBar";
import { getRequiredExp, getTierBadge } from "@/lib/helpers";

const GOAL_OPTIONS = [
  {
    value: "muscle",
    label: "Build Muscle",
    emoji: "💪",
    desc: "Focus on hypertrophy and strength progression.",
  },
  {
    value: "fat_loss",
    label: "Fat Loss",
    emoji: "🔥",
    desc: "Maximize calorie burn and maintain lean mass.",
  },
  {
    value: "maintain",
    label: "Maintain",
    emoji: "⚡",
    desc: "Preserve conditioning and build daily consistency.",
  },
  {
    value: "endurance",
    label: "Endurance",
    emoji: "🏃",
    desc: "Improve cardiovascular stamina and agility.",
  },
  {
    value: "custom",
    label: "Custom Goal",
    emoji: "✏️",
    desc: "Define your own specific training objectives.",
  },
];

export default function ProfileHubPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { showNotification } = useNotification();

  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [globalRank, setGlobalRank] = useState(null);

  // Accordion Toggles
  const [showEditMetrics, setShowEditMetrics] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Profile Form States
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [goal, setGoal] = useState("maintain");
  const [customGoal, setCustomGoal] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrPw, setShowCurrPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState(null);

  // Auto-redirect unauthenticated users to /login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load Profile & Global Rank
  useEffect(() => {
    async function loadData() {
      if (!isAuthenticated) return;
      try {
        const [profileRes, rankingRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/ranking?page=1&limit=1"),
        ]);

        if (profileRes.ok) {
          const pData = await profileRes.json();
          setUserData(pData);
          if (pData.profile) {
            setDisplayName(pData.profile.displayName || "");
            setAge(pData.profile.age !== null ? String(pData.profile.age) : "");
            setWeight(pData.profile.weight !== null ? String(pData.profile.weight) : "");
            setWeightUnit(pData.profile.weightUnit || "kg");
            setHeight(pData.profile.height !== null ? String(pData.profile.height) : "");
            setHeightUnit(pData.profile.heightUnit || "cm");
            setGoal(pData.profile.goal || "maintain");
            setCustomGoal(pData.profile.customGoal || "");
          }
        }

        if (rankingRes.ok) {
          const rData = await rankingRes.json();
          setGlobalRank(rData.currentUserRank);
        }
      } catch (err) {
        console.error("Error loading profile hub data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading && isAuthenticated) {
      loadData();
    }
  }, [authLoading, isAuthenticated]);

  // Handle Save Profile Metrics
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (isSavingProfile) return;
    setIsSavingProfile(true);

    const payload = {
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
          message: data.error || "Could not update metrics.",
          duration: 4000,
        });
        setIsSavingProfile(false);
        return;
      }

      showNotification({
        type: "summary",
        title: "Metrics Synchronized",
        message: "Physical parameters and display name updated successfully.",
        duration: 4000,
      });
      setShowEditMetrics(false);
    } catch (err) {
      console.error("Save profile error:", err);
      showNotification({
        type: "reminder",
        title: "System Error",
        message: "An unexpected error occurred while saving metrics.",
        duration: 4000,
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (isSavingPassword) return;

    if (newPassword.length < 6) {
      setPasswordFeedback({ type: "error", message: "New password must be at least 6 characters." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: "error", message: "Passwords do not match." });
      return;
    }

    setIsSavingPassword(true);
    setPasswordFeedback(null);

    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordFeedback({ type: "error", message: data.error || "Failed to update password." });
        setIsSavingPassword(false);
        return;
      }

      setPasswordFeedback({ type: "success", message: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      showNotification({
        type: "summary",
        title: "Security Updated",
        message: "Your hunter credentials have been updated.",
        duration: 4000,
      });

      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordFeedback(null);
      }, 1500);
    } catch (err) {
      console.error("Change password error:", err);
      setPasswordFeedback({ type: "error", message: "Network error updating password." });
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[85vh] space-y-4 select-none">
        <div className="w-12 h-12 rounded-full border-3 border-primary border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-text-muted tracking-widest uppercase">
          CALIBRATING PROFILE HUB...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const level = userData?.level || 0;
  const exp = userData?.exp || 0;
  const requiredExp = getRequiredExp(level);
  const tier = userData?.tier || getTierBadge(level);
  const streak = userData?.streak || 0;
  const username = userData?.username || "hunter";
  const userDisplayName = displayName || userData?.profile?.displayName || username;
  const stats = userData?.stats || { str: 0, vit: 0, agi: 0, con: 0 };

  const hubLinks = [
    {
      title: "Hunter Attributes",
      subtitle: "Calibrate STR, VIT, AGI, CON points",
      href: "/status",
      icon: Sliders,
      badge: (userData?.statPoints || 0) > 0 ? `${userData.statPoints} Pts Available` : null,
      accent: "from-indigo-500/10 to-indigo-500/5 hover:border-primary",
      iconColor: "text-primary",
    },
    {
      title: "System Rewards",
      subtitle: "Milestone badges & rank achievements",
      href: "/rewards",
      icon: Trophy,
      badge: "Trophies",
      accent: "from-amber-500/10 to-amber-500/5 hover:border-amber-400",
      iconColor: "text-amber-500",
    },
    {
      title: "Training Analytics",
      subtitle: "Visual workout distribution & charts",
      href: "/analytics",
      icon: BarChart3,
      badge: "Graphs",
      accent: "from-cyan-500/10 to-cyan-500/5 hover:border-cyan-400",
      iconColor: "text-cyan-600",
    },
    {
      title: "Activity Log",
      subtitle: "Full workout logs & completed quests",
      href: "/log",
      icon: BookOpen,
      badge: "History",
      accent: "from-emerald-500/10 to-emerald-500/5 hover:border-emerald-400",
      iconColor: "text-emerald-600",
    },
    {
      title: "Global Leaderboard",
      subtitle: "Worldwide rankings & top hunters",
      href: "/ranking",
      icon: Globe2,
      badge: globalRank ? `#${globalRank} Global` : "Leaderboard",
      accent: "from-violet-500/10 to-violet-500/5 hover:border-secondary",
      iconColor: "text-secondary",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex-1 flex flex-col space-y-4 select-none pb-8"
    >
      {/* Top Header */}
      <header className="flex items-center justify-between pb-2 border-b border-slate-200/80">
        <Link
          href="/"
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white shadow-sm text-text-secondary hover:text-text-primary border border-slate-200 text-xs font-mono transition-colors active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quest Log</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-primary text-xs font-mono font-bold tracking-widest uppercase">
          <User className="w-3.5 h-3.5" />
          <span>HUNTER PROFILE HUB</span>
        </div>
      </header>

      {/* HUNTER SUMMARY HERO CARD */}
      <GlassCard glow={true} className="p-4 bg-white space-y-4">
        {/* Top Handle & Global Standing */}
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-text-primary font-mono tracking-tight">
                @{username}
              </h1>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase ${
                  tier?.badgeClass || "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {tier?.label || "E-Rank"}
              </span>
            </div>
            <p className="text-xs text-text-secondary font-medium">
              {userDisplayName} • {userData?.email}
            </p>
          </div>

          <div className="flex items-center space-x-1.5">
            {globalRank ? (
              <div className="px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-mono text-primary font-bold shadow-sm">
                #{globalRank} Global
              </div>
            ) : null}

            {streak > 0 && (
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-xs font-mono text-amber-700 font-bold shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{streak}d</span>
              </div>
            )}
          </div>
        </div>

        {/* EXP Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-text-primary font-bold">
              Level {level}
            </span>
            <span className="text-text-muted">
              EXP {exp} / {requiredExp}
            </span>
          </div>
          <ExpBar current={exp} max={requiredExp} showLabels={false} />
        </div>

        {/* Mini Combat Stats Grid */}
        <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-100">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-mono text-rose-500 font-bold block">STR</span>
            <span className="text-sm font-black font-mono text-text-primary">{stats.str || 0}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-mono text-emerald-600 font-bold block">VIT</span>
            <span className="text-sm font-black font-mono text-text-primary">{stats.vit || 0}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-mono text-indigo-600 font-bold block">AGI</span>
            <span className="text-sm font-black font-mono text-text-primary">{stats.agi || 0}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-mono text-amber-600 font-bold block">CON</span>
            <span className="text-sm font-black font-mono text-text-primary">{stats.con || 0}</span>
          </div>
        </div>
      </GlassCard>

      {/* CENTRAL NAVIGATION HUB (Cards) */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold font-mono text-text-secondary uppercase tracking-wider px-1">
          System Control & Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {hubLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-200 flex items-center justify-between hover:shadow-md hover:scale-[1.01] active:scale-[0.99] group bg-gradient-to-br ${item.accent}`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`p-2.5 rounded-xl bg-white shadow-sm border border-slate-200 ${item.iconColor} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-text-primary tracking-tight truncate">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-text-secondary truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {item.badge && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-primary shadow-sm flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Toggle Physical Parameters Editor */}
          <button
            type="button"
            onClick={() => setShowEditMetrics(!showEditMetrics)}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-200 flex items-center justify-between hover:shadow-md hover:scale-[1.01] active:scale-[0.99] group text-left bg-gradient-to-br from-slate-50 to-slate-100/50 hover:border-primary"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-white shadow-sm border border-slate-200 text-slate-700 group-hover:scale-110 transition-transform">
                <Edit3 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-text-primary tracking-tight">
                  Edit Physical Metrics
                </h3>
                <p className="text-[11px] text-text-secondary truncate mt-0.5">
                  Calibrate age, height, weight, fitness goals
                </p>
              </div>
            </div>

            <span className="p-1 rounded-lg bg-white border border-slate-200 text-text-muted">
              {showEditMetrics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>
        </div>
      </div>

      {/* EXPANDABLE METRICS EDITOR */}
      <AnimatePresence>
        {showEditMetrics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GlassCard className="p-4 space-y-4 bg-white border-primary/30">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Edit3 className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold font-mono text-text-primary uppercase tracking-wider">
                    Physical Metrics & Parameters
                  </h3>
                </div>
                <button
                  onClick={() => setShowEditMetrics(false)}
                  className="text-xs text-text-muted hover:text-text-primary"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                {/* Display Name Input */}
                <div className="space-y-1">
                  <label className="text-xs font-mono font-medium text-text-secondary">
                    DISPLAY NAME
                  </label>
                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex items-center px-3 focus-within:border-primary">
                    <User className="w-4 h-4 text-slate-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Hunter Alias (e.g. Shadow King)"
                      value={displayName}
                      maxLength={30}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full py-2.5 bg-transparent text-text-primary placeholder-slate-400 outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Age, Weight, Height Row */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Age */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-medium text-text-secondary">
                      AGE
                    </label>
                    <input
                      type="number"
                      placeholder="24"
                      min="10"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full py-2 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-text-primary outline-none focus:border-primary shadow-sm"
                    />
                  </div>

                  {/* Weight */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-medium text-text-secondary">
                      WEIGHT ({weightUnit})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="75.0"
                      min="20"
                      max="500"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full py-2 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-text-primary outline-none focus:border-primary shadow-sm"
                    />
                  </div>

                  {/* Height */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-medium text-text-secondary">
                      HEIGHT ({heightUnit})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="180"
                      min="50"
                      max="300"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full py-2 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-text-primary outline-none focus:border-primary shadow-sm"
                    />
                  </div>
                </div>

                {/* Goal Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-text-secondary">
                    TRAINING OBJECTIVE
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {GOAL_OPTIONS.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setGoal(item.value)}
                        className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                          goal === item.value
                            ? "bg-indigo-50 border-primary shadow-sm text-primary"
                            : "bg-slate-50 border-slate-200 text-text-secondary hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-base">{item.emoji}</span>
                        <span className="text-xs font-bold truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <NeumorphicButton
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full justify-center text-white font-bold bg-gradient-to-r from-primary to-secondary shadow-glow-primary text-xs py-3 border-none"
                >
                  {isSavingProfile ? (
                    <span>Synchronizing...</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Physical Parameters</span>
                    </div>
                  )}
                </NeumorphicButton>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECURITY & AUTHENTICATION SECTION */}
      <GlassCard className="p-4 space-y-3 bg-white">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold font-mono text-text-primary uppercase tracking-wider">
              Account & Security
            </h3>
          </div>
        </div>

        <div className="space-y-2">
          {/* Change Password Toggle */}
          <button
            type="button"
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-left flex items-center justify-between transition-all"
          >
            <div className="flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-text-primary font-mono">
                Change Password
              </span>
            </div>
            <span className="text-xs text-text-muted">
              {showChangePassword ? "Hide" : "Modify →"}
            </span>
          </button>

          {/* Change Password Panel */}
          <AnimatePresence>
            {showChangePassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <form onSubmit={handleChangePassword} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 mt-1">
                  {/* Current Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary">CURRENT PASSWORD</label>
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex items-center px-3">
                      <input
                        type={showCurrPw ? "text" : "password"}
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="w-full py-2 bg-transparent text-xs text-text-primary outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrPw(!showCurrPw)}
                        className="text-slate-400 hover:text-text-primary p-1"
                      >
                        {showCurrPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary">NEW PASSWORD (min 6 chars)</label>
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex items-center px-3">
                      <input
                        type={showNewPw ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full py-2 bg-transparent text-xs text-text-primary outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="text-slate-400 hover:text-text-primary p-1"
                      >
                        {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-text-secondary">CONFIRM NEW PASSWORD</label>
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex items-center px-3">
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full py-2 bg-transparent text-xs text-text-primary outline-none"
                      />
                    </div>
                  </div>

                  {/* Feedback Message */}
                  {passwordFeedback && (
                    <div
                      className={`p-2 rounded-lg text-xs font-mono text-center border ${
                        passwordFeedback.type === "success"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-rose-50 text-rose-800 border-rose-200"
                      }`}
                    >
                      {passwordFeedback.message}
                    </div>
                  )}

                  <NeumorphicButton
                    type="submit"
                    disabled={isSavingPassword}
                    className="w-full justify-center text-white font-bold bg-gradient-to-r from-primary to-secondary shadow-glow-primary text-xs py-2.5 border-none"
                  >
                    {isSavingPassword ? "Updating..." : "Update Password"}
                  </NeumorphicButton>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full p-3 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 font-bold text-xs font-mono flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Hunter System</span>
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
