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
        <div className="inline-block px-4 py-1 mx-auto rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-mono tracking-widest uppercase font-bold">
          SYSTEM RECOVERY
        </div>
        <h1 className="text-3xl font-black text-text-primary tracking-tight">Recover Password</h1>
        <p className="text-text-secondary text-sm max-w-[280px] mx-auto leading-relaxed">
          Enter your registered hunter email to receive a password reset link.
        </p>
      </div>

      {isSent ? (
        <GlassCard className="text-center py-8 px-6 space-y-4 bg-white">
          <div className="w-16 h-16 mx-auto rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-primary">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-text-primary font-mono">Recovery Link Sent</h2>
          <p className="text-xs text-text-secondary leading-relaxed max-w-[280px] mx-auto">
            If an awakened hunter account exists for <span className="text-primary font-mono font-bold">{email}</span>, a password reset link has been dispatched to your inbox.
          </p>
          <div className="pt-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white shadow-sm border border-slate-200 text-text-primary text-xs font-mono font-bold hover:border-primary transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-primary" />
              Return to Login
            </Link>
          </div>
        </GlassCard>
      ) : (
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

          {/* Error Message */}
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

          {/* Submit Button */}
          <NeumorphicButton
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full justify-center text-center text-white font-bold bg-gradient-to-r from-rose-600 to-rose-500 shadow-md hover:opacity-95 transition-all disabled:opacity-50 border-none py-4 text-sm"
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
          className="text-sm text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Hunter Login</span>
        </Link>
      </div>
    </motion.div>
  );
}
