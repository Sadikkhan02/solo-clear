"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import NeumorphicButton from "@/components/ui/NeumorphicButton";
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, ArrowLeft, KeyRound } from "lucide-react";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token;

  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  // Validate token on mount
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setIsTokenValid(false);
        setTokenError("Missing reset token.");
        setIsValidating(false);
        return;
      }

      try {
        const res = await fetch(`/api/auth/reset-password/validate/${token}`);
        const data = await res.json();

        if (!res.ok || !data.valid) {
          setIsTokenValid(false);
          setTokenError(data.error || "Invalid or expired recovery link.");
        } else {
          setIsTokenValid(true);
        }
      } catch (err) {
        console.error("Token validation error:", err);
        setIsTokenValid(false);
        setTokenError("Failed to validate reset link.");
      } finally {
        setIsValidating(false);
      }
    }

    validateToken();
  }, [token]);

  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = isPasswordValid && doPasswordsMatch && !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update password.");
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err) {
      console.error("Reset password error:", err);
      setFormError(err.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  // Loading state during token pre-validation
  if (isValidating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] space-y-3 select-none">
        <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-text-muted tracking-widest uppercase">
          VERIFYING RECOVERY TOKEN...
        </p>
      </div>
    );
  }

  // Invalid or expired token view
  if (!isTokenValid) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col justify-center min-h-[85vh] py-8 select-none"
      >
        <GlassCard className="text-center py-8 px-6 space-y-4 bg-white">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-text-primary font-mono">Link Expired or Invalid</h2>
          <p className="text-xs text-text-secondary leading-relaxed max-w-[280px] mx-auto">
            {tokenError || "This password recovery link is no longer valid. Recovery links expire after 1 hour."}
          </p>
          <div className="pt-3 flex flex-col gap-2">
            <Link
              href="/forgot-password"
              className="w-full py-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-primary text-xs font-mono font-bold hover:bg-indigo-100 transition-colors block text-center"
            >
              Request New Recovery Link
            </Link>
            <Link
              href="/login"
              className="text-xs text-text-muted hover:text-text-primary pt-2 transition-colors block text-center"
            >
              ← Back to Login
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  // Success view
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col justify-center min-h-[85vh] py-8 select-none"
      >
        <GlassCard className="text-center py-8 px-6 space-y-4 bg-white">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-text-primary font-mono">Password Updated!</h2>
          <p className="text-xs text-text-secondary leading-relaxed max-w-[280px] mx-auto">
            Your hunter credentials have been updated successfully. Redirecting you to System Access...
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-mono font-bold shadow-glow-primary"
            >
              Proceed to Login
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex flex-col justify-center min-h-[85vh] py-8 space-y-6 select-none"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-block px-4 py-1 mx-auto rounded-full bg-indigo-50 border border-indigo-200 text-primary text-xs font-mono tracking-widest uppercase font-bold">
          CREDENTIAL UPDATE
        </div>
        <h1 className="text-3xl font-black text-text-primary tracking-tight">New Password</h1>
        <p className="text-text-secondary text-sm max-w-[280px] mx-auto">
          Choose a secure new password for your hunter account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password Input */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden flex items-center px-4">
          <Lock className="w-5 h-5 text-slate-400 flex-shrink-0 mr-3" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        {/* Confirm Password Input */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden flex items-center px-4">
          <KeyRound className="w-5 h-5 text-slate-400 flex-shrink-0 mr-3" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full py-4 bg-transparent text-text-primary placeholder-slate-400 outline-none min-h-[56px] text-sm"
            required
            autoComplete="new-password"
          />
        </div>

        {/* Live Validation Indicators */}
        <div className="px-1 space-y-1 text-xs font-mono">
          <div className={`flex items-center gap-1.5 ${isPasswordValid ? "text-emerald-600" : "text-text-muted"}`}>
            <span>{isPasswordValid ? "✓" : "○"}</span>
            <span>At least 6 characters</span>
          </div>
          <div className={`flex items-center gap-1.5 ${doPasswordsMatch ? "text-emerald-600" : "text-text-muted"}`}>
            <span>{doPasswordsMatch ? "✓" : "○"}</span>
            <span>Passwords match</span>
          </div>
        </div>

        {/* Error Message */}
        {formError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2"
          >
            <span>⚠️</span>
            <span>{formError}</span>
          </motion.div>
        )}

        {/* Submit Button */}
        <NeumorphicButton
          type="submit"
          disabled={!canSubmit}
          className="w-full justify-center text-center text-white font-bold bg-gradient-to-r from-primary to-secondary shadow-glow-primary hover:opacity-95 transition-all disabled:opacity-50 border-none py-4 text-sm"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Updating Password...</span>
            </div>
          ) : (
            "Set New Password"
          )}
        </NeumorphicButton>
      </form>

      {/* Footer Navigation */}
      <div className="text-center pt-2">
        <Link
          href="/login"
          className="text-sm text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel and Return to Login</span>
        </Link>
      </div>
    </motion.div>
  );
}
