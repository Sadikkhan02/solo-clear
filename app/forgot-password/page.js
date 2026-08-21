"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import NeumorphicButton from "@/components/ui/NeumorphicButton";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to dispatch recovery link.");
      }

      setIsSent(true);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
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
        <div className="inline-block px-4 py-1 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono tracking-widest uppercase">
          SYSTEM RECOVERY
        </div>
        <h1 className="text-3xl font-bold text-white tracking-wide">Recover Password</h1>
        <p className="text-white/40 text-sm max-w-[280px] mx-auto leading-relaxed">
          Enter your registered hunter email to receive a password reset link.
        </p>
      </div>

      {isSent ? (
        <GlassCard className="text-center py-8 px-6 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white font-mono">Recovery Link Sent</h2>
          <p className="text-xs text-gray-300 leading-relaxed max-w-[280px] mx-auto">
            If an awakened hunter account exists for <span className="text-accent-cyan font-mono">{email}</span>, a password reset link has been dispatched to your inbox.
          </p>
          <div className="pt-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-card shadow-neu-raised text-white text-xs font-mono font-bold hover:text-accent-cyan transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Login
            </Link>
          </div>
        </GlassCard>
      ) : (
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

          {/* Error Message */}
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

          {/* Submit Button */}
          <NeumorphicButton
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full justify-center text-center text-white font-bold bg-gradient-to-r from-rose-600 to-rose-500 shadow-glow-cyan hover:shadow-2xl transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sending Recovery Link...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                <span>Send Recovery Link</span>
              </div>
            )}
          </NeumorphicButton>
        </form>
      )}

      {/* Footer Navigation */}
      <div className="text-center pt-2">
        <Link
          href="/login"
          className="text-sm text-white/40 hover:text-accent-cyan transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Hunter Login</span>
        </Link>
      </div>
    </motion.div>
  );
}
