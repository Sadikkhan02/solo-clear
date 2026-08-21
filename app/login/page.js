"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import NeumorphicButton from "@/components/ui/NeumorphicButton";
import { Eye, EyeOff, Mail, Lock, KeyRound, Sparkles } from "lucide-react";

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
        <div className="inline-block px-4 py-1 mx-auto rounded-full bg-indigo-50 border border-indigo-200 text-primary text-xs font-mono tracking-widest uppercase font-bold">
          SYSTEM ACCESS
        </div>
        <h1 className="text-3xl font-black text-text-primary tracking-tight">Hunter Login</h1>
        <p className="text-text-secondary text-sm">
          Identify yourself to resume your daily quest.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden flex items-center px-4">
          <Mail className="w-5 h-5 text-slate-400 flex-shrink-0 mr-3" />
          <input
            type="email"
            placeholder="Hunter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full py-4 bg-transparent text-text-primary placeholder-slate-400 outline-none min-h-[56px] text-sm"
            required
            autoComplete="email"
          />
        </div>

        {/* Password Input Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden flex items-center px-4">
          <Lock className="w-5 h-5 text-slate-400 flex-shrink-0 mr-3" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="System Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full py-4 bg-transparent text-text-primary placeholder-slate-400 outline-none min-h-[56px] text-sm"
            required
            autoComplete="current-password"
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

        {/* Forgot Password Link */}
        <div className="flex justify-end px-1">
          <Link
            href="/forgot-password"
            className="text-xs text-text-muted hover:text-primary font-mono transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Error Message Notice */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2"
          >
            <span>⚠️</span>
            <span>{error}</span>
          </motion.div>
        )}

        {/* Submit Login Button */}
        <NeumorphicButton
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full justify-center text-center text-white font-bold bg-gradient-to-r from-primary to-secondary shadow-glow-primary hover:opacity-95 transition-all disabled:opacity-50 border-none py-4 text-sm"
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
          className="text-sm text-text-secondary hover:text-primary transition-colors"
        >
          Unregistered Hunter? <span className="text-primary font-semibold">Awaken System</span>
        </Link>
      </div>
    </motion.div>
  );
}
