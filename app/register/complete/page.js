"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import NeumorphicButton from "@/components/ui/NeumorphicButton";
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  X,
  ArrowLeft,
  Sword,
  XCircle,
  AtSign,
} from "lucide-react";

// --- Step Dots ---
function StepDots({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-2">
      {[1, 2, 3].map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
              step < current
                ? "bg-emerald-500 border-emerald-500 text-white"
                : step === current
                ? "bg-primary border-primary text-white shadow-glow-primary"
                : "bg-slate-100 border-slate-200 text-text-muted"
            }`}
          >
            {step < current ? <Check className="w-3.5 h-3.5" /> : step}
          </div>
          {i < 2 && (
            <div
              className={`w-8 h-0.5 rounded-full transition-all duration-500 ${
                step < current ? "bg-emerald-400" : "bg-slate-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// --- Password Strength ---
function getStrength(pw) {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { label: "Weak", color: "bg-rose-500", textColor: "text-rose-600", width: "w-1/4" };
  if (score <= 3) return { label: "Medium", color: "bg-amber-500", textColor: "text-amber-600", width: "w-2/4" };
  return { label: "Strong", color: "bg-emerald-500", textColor: "text-emerald-600", width: "w-full" };
}

function CompleteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [error, setError] = useState("");

  const trimmedUsername = username.trim().toLowerCase();
  const isUsernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(trimmedUsername);
  const strength = getStrength(password);
  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = isUsernameValid && isPasswordValid && doPasswordsMatch && status !== "submitting";

  // --- Guard: no email in query ---
  if (!email) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col justify-center min-h-[85vh] py-8 select-none"
      >
        <GlassCard className="text-center py-10 px-6 space-y-4 bg-white">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-text-primary font-mono">
            Session Expired
          </h2>
          <p className="text-xs text-text-secondary max-w-[280px] mx-auto leading-relaxed">
            No email address found. Please restart the awakening process from
            the beginning.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-mono font-bold shadow-glow-primary"
          >
            Restart Awakening
          </Link>
        </GlassCard>
      </motion.div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setStatus("submitting");

    try {
      // Step 1: Set username & password
      const completeRes = await fetch("/api/auth/register/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          username: trimmedUsername,
        }),
      });
      const completeData = await completeRes.json();

      if (!completeRes.ok) {
        setError(completeData.error || "Failed to complete registration. Please try again.");
        setStatus("error");
        return;
      }

      // Step 2: Auto-login
      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        // Graceful fallback — account is created, just couldn't auto-login
        router.push("/login?awakened=1");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Connection error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex flex-col justify-center min-h-[85vh] py-8 space-y-6 select-none"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <StepDots current={3} />
        <div className="inline-block px-4 py-1 mx-auto rounded-full bg-violet-50 border border-violet-200 text-secondary text-xs font-mono tracking-widest uppercase font-bold">
          FINAL STEP
        </div>
        <h1 className="text-3xl font-black text-text-primary tracking-tight">
          Awaken Your Hunter
        </h1>
        <p className="text-text-secondary text-sm">
          Step 3 of 3 — Choose your handle and secure your account
        </p>
      </div>

      {/* Email badge (read-only) */}
      <div className="flex items-center justify-center">
        <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-text-secondary text-xs font-mono flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          <span>{email}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hunter Username Input */}
        <div className="space-y-1">
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden flex items-center px-4">
            <AtSign className="w-5 h-5 text-slate-400 flex-shrink-0 mr-3" />
            <input
              type="text"
              id="complete-username"
              placeholder="Hunter Username (e.g. shadow_monarch)"
              value={username}
              maxLength={20}
              onChange={(e) => {
                setUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ""));
                if (status === "error") { setError(""); setStatus("idle"); }
              }}
              className="w-full py-4 bg-transparent text-text-primary placeholder-slate-400 outline-none min-h-[56px] text-sm font-mono"
              required
              autoComplete="username"
              autoFocus
            />
            {username.length > 0 && (
              <span className="flex-shrink-0">
                {isUsernameValid ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <X className="w-4 h-4 text-rose-500" />
                )}
              </span>
            )}
          </div>
          {username.length > 0 && !isUsernameValid && (
            <p className="text-[11px] font-mono text-rose-500 px-2">
              3-20 characters using letters, numbers, and underscores only.
            </p>
          )}
        </div>

        {/* Password Input */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden flex items-center px-4">
          <Lock className="w-5 h-5 text-slate-400 flex-shrink-0 mr-3" />
          <input
            type={showPassword ? "text" : "password"}
            id="complete-password"
            placeholder="System Password (min 6 chars)"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (status === "error") { setError(""); setStatus("idle"); }
            }}
            className="w-full py-4 bg-transparent text-text-primary placeholder-slate-400 outline-none min-h-[56px] text-sm"
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-2 text-slate-400 hover:text-text-primary transition-colors focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Password Strength Meter */}
        {password.length > 0 && strength && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="px-1 space-y-1.5"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted font-mono">Strength</span>
              <span className={`font-bold font-mono ${strength.textColor}`}>
                {strength.label}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${strength.color}`}
                initial={{ width: 0 }}
                animate={{ width: strength.width.replace("w-", "").replace("/", "%").replace("1%", "25%").replace("2%", "50%").replace("full", "100%") }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  width: strength.width === "w-1/4" ? "25%" : strength.width === "w-2/4" ? "50%" : "100%"
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Confirm Password Input */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden flex items-center px-4">
          <KeyRound className="w-5 h-5 text-slate-400 flex-shrink-0 mr-3" />
          <input
            type={showConfirm ? "text" : "password"}
            id="complete-confirm-password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full py-4 bg-transparent text-text-primary placeholder-slate-400 outline-none min-h-[56px] text-sm"
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="p-2 text-slate-400 hover:text-text-primary transition-colors focus:outline-none"
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Live Validation Checks */}
        {(username.length > 0 || password.length > 0 || confirmPassword.length > 0) && (
          <div className="px-1 space-y-1 text-xs font-mono">
            <div className={`flex items-center gap-2 transition-colors ${isUsernameValid ? "text-emerald-600" : "text-text-muted"}`}>
              {isUsernameValid ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              <span>Unique username (3-20 chars)</span>
            </div>
            <div className={`flex items-center gap-2 transition-colors ${isPasswordValid ? "text-emerald-600" : "text-text-muted"}`}>
              {isPasswordValid ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              <span>Password at least 6 characters</span>
            </div>
            {confirmPassword.length > 0 && (
              <div className={`flex items-center gap-2 transition-colors ${doPasswordsMatch ? "text-emerald-600" : "text-rose-500"}`}>
                {doPasswordsMatch ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>Passwords match</span>
              </div>
            )}
          </div>
        )}

        {/* Error Notice */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2"
            >
              <span>⚠️</span>
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <NeumorphicButton
          type="submit"
          disabled={!canSubmit}
          className="w-full justify-center text-center text-white font-bold bg-gradient-to-r from-primary to-secondary shadow-glow-primary hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none py-4 text-sm"
        >
          {status === "submitting" ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Awakening Hunter...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Sword className="w-4 h-4" />
              <span>Awaken Hunter</span>
            </div>
          )}
        </NeumorphicButton>
      </form>

      {/* Footer */}
      <div className="text-center pt-1">
        <Link
          href="/login"
          className="text-sm text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>
      </div>
    </motion.div>
  );
}

export default function RegisterCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <CompleteContent />
    </Suspense>
  );
}
