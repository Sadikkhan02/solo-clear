"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import NeumorphicButton from "@/components/ui/NeumorphicButton";
import { Eye, EyeOff, Mail, Lock, Check, X } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- VALIDATION HELPERS ---
  const isValidEmail = email.includes("@") && email.includes(".");
  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch = password === confirmPassword && password.length > 0;
  const isFormValid = isValidEmail && isPasswordValid && doPasswordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const normalizedEmail = email.toLowerCase().trim();

    // Client-side validation
    if (!isValidEmail) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    if (!isPasswordValid) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    if (!doPasswordsMatch) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Awaken the hunter via registration endpoint
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        if (registerRes.status === 409) {
          setError("A hunter with this email already exists.");
        } else {
          setError(registerData.error || "Registration failed. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      setSuccess("Hunter awakened successfully! Initializing system...");

      // Step 2: Auto-login with NextAuth
      const loginResult = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        setError("Registration succeeded, but auto-login failed. Redirecting to login...");
        setIsLoading(false);
        setTimeout(() => {
          router.push("/login");
        }, 1500);
        return;
      }

      // Step 3: Redirect to main quest dashboard
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex flex-col justify-center min-h-[85vh] py-8 space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-block px-4 py-1 mx-auto rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-mono tracking-widest">
          HUNTER AWAKENING
        </div>
        <h1 className="text-3xl font-bold text-white tracking-wide">Begin Your Hunt</h1>
        <p className="text-white/40 text-sm">
          Create your System profile to start at E-Rank (Level 0).
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input Card */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="flex items-center gap-3 px-4 bg-dark-card/30">
            <Mail className="w-5 h-5 text-white/40 flex-shrink-0" />
            <input
              type="email"
              placeholder="Hunter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-4 bg-transparent text-white placeholder-white/30 outline-none min-h-[56px] text-sm"
              required
              autoComplete="email"
            />
            {email.length > 0 && (
              <div className="flex-shrink-0">
                {isValidEmail ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <X className="w-5 h-5 text-red-400" />
                )}
              </div>
            )}
          </div>
        </GlassCard>

        {/* Password Input Card */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="flex items-center gap-3 px-4 bg-dark-card/30">
            <Lock className="w-5 h-5 text-white/40 flex-shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="System Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-4 bg-transparent text-white placeholder-white/30 outline-none min-h-[56px] text-sm"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 text-white/40 hover:text-white/80 transition-colors focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </GlassCard>

        {/* Confirm Password Input Card */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="flex items-center gap-3 px-4 bg-dark-card/30">
            <Lock className="w-5 h-5 text-white/40 flex-shrink-0" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full py-4 bg-transparent text-white placeholder-white/30 outline-none min-h-[56px] text-sm"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="p-2 text-white/40 hover:text-white/80 transition-colors focus:outline-none"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </GlassCard>

        {/* Real-time Validation Indicators */}
        {password.length > 0 && (
          <div className="space-y-1 text-xs px-1">
            <div
              className={`flex items-center gap-2 transition-colors ${
                isPasswordValid ? "text-emerald-400" : "text-white/40"
              }`}
            >
              {isPasswordValid ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              <span>At least 6 characters</span>
            </div>
            {confirmPassword.length > 0 && (
              <div
                className={`flex items-center gap-2 transition-colors ${
                  doPasswordsMatch ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {doPasswordsMatch ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <X className="w-3.5 h-3.5" />
                )}
                <span>Passwords match</span>
              </div>
            )}
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2"
          >
            <span>⚠️</span>
            <span>{error}</span>
          </motion.div>
        )}

        {/* Success Notice */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2"
          >
            <span>✅</span>
            <span>{success}</span>
          </motion.div>
        )}

        {/* Register Button */}
        <NeumorphicButton
          type="submit"
          disabled={isLoading || !isFormValid}
          className="w-full justify-center text-center text-white font-bold bg-gradient-to-r from-accent-cyan to-blue-700 shadow-glow-cyan hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Awakening...</span>
            </div>
          ) : (
            "Awaken Hunter"
          )}
        </NeumorphicButton>
      </form>

      {/* Footer Navigation Link */}
      <div className="text-center pt-2">
        <Link
          href="/login"
          className="text-sm text-white/40 hover:text-accent-cyan transition-colors"
        >
          Already Awakened? <span className="text-accent-cyan font-semibold">Access System</span>
        </Link>
      </div>
    </motion.div>
  );
}
