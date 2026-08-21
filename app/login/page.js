"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import NeumorphicButton from "@/components/ui/NeumorphicButton";
import { Eye, EyeOff, Mail, Lock, KeyRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("verify your email")) {
          setError("Please verify your hunter email before logging in. Check your inbox for the awakening link.");
        } else {
          setError("Invalid hunter email or password.");
        }
        setIsLoading(false);
        return;
      }

      // Success - redirect to main quest dashboard
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
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
      className="flex flex-col justify-center min-h-[85vh] py-8 space-y-6 select-none"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-block px-4 py-1 mx-auto rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-mono tracking-widest uppercase">
          SYSTEM ACCESS
        </div>
        <h1 className="text-3xl font-bold text-white tracking-wide">Hunter Login</h1>
        <p className="text-white/40 text-sm">
          Identify yourself to resume your daily quest.
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
          </div>
        </GlassCard>

        {/* Password Input Card */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="flex items-center gap-3 px-4 bg-dark-card/30">
            <Lock className="w-5 h-5 text-white/40 flex-shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="System Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-4 bg-transparent text-white placeholder-white/30 outline-none min-h-[56px] text-sm"
              required
              autoComplete="current-password"
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

        {/* Forgot Password Link */}
        <div className="flex justify-end px-1">
          <Link
            href="/forgot-password"
            className="text-xs text-gray-400 hover:text-accent-cyan font-mono transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Error Message Notice */}
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

        {/* Submit Login Button */}
        <NeumorphicButton
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full justify-center text-center text-white font-bold bg-gradient-to-r from-accent-cyan to-blue-700 shadow-glow-cyan hover:shadow-2xl transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Authenticating...</span>
            </div>
          ) : (
            "Access System"
          )}
        </NeumorphicButton>
      </form>

      {/* Footer Navigation Link */}
      <div className="text-center pt-2">
        <Link
          href="/register"
          className="text-sm text-white/40 hover:text-accent-cyan transition-colors"
        >
          Unregistered Hunter? <span className="text-accent-cyan font-semibold">Awaken System</span>
        </Link>
      </div>
    </motion.div>
  );
}
