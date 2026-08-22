"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import NeumorphicButton from "@/components/ui/NeumorphicButton";
import { Mail, Check, X, MailCheck, RefreshCw, ArrowRight } from "lucide-react";

// --- Step Progress Indicator ---
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

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef(null);

  const isValidEmail = email.includes("@") && email.includes(".");

  // --- Resend countdown (setInterval pattern) ---
  function startCooldown() {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          cooldownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // --- API call ---
  async function sendInitiate(emailToSend) {
    const res = await fetch("/api/auth/register/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailToSend }),
    });
    return res;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail || status === "sending") return;
    setError("");
    setStatus("sending");

    try {
      const res = await sendInitiate(email.toLowerCase().trim());
      const data = await res.json();

      if (res.ok) {
        setStatus("sent");
        startCooldown();
      } else if (res.status === 409) {
        setError("A hunter with this email is already registered. Try logging in.");
        setStatus("error");
      } else {
        // 429 includes seconds remaining, 4xx/5xx use generic
        setError(data.error || "Failed to send verification email. Please try again.");
        setStatus("error");
      }
    } catch {
      setError("Connection error. Please check your network and try again.");
      setStatus("error");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || status === "sending") return;
    setError("");
    setStatus("sending");
    try {
      const res = await sendInitiate(email.toLowerCase().trim());
      const data = await res.json();
      if (res.ok) {
        startCooldown();
        setStatus("sent");
      } else {
        setError(data.error || "Failed to resend. Please try again.");
        setStatus("sent"); // stay on sent view, show error inline
      }
    } catch {
      setError("Connection error. Could not resend.");
      setStatus("sent");
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
        <StepDots current={1} />
        <div className="inline-block px-4 py-1 mx-auto rounded-full bg-indigo-50 border border-indigo-200 text-primary text-xs font-mono tracking-widest uppercase font-bold">
          HUNTER AWAKENING
        </div>
        <h1 className="text-3xl font-black text-text-primary tracking-tight">
          Begin Your Hunt
        </h1>
        <p className="text-text-secondary text-sm">
          Step 1 of 3 — Enter your email address
        </p>
      </div>

      <AnimatePresence mode="wait">
        {status !== "sent" ? (
          /* --- Step 1 Form --- */
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Email Input */}
            <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden flex items-center px-4">
              <Mail className="w-5 h-5 text-slate-400 flex-shrink-0 mr-3" />
              <input
                type="email"
                id="register-email"
                placeholder="Hunter Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") { setError(""); setStatus("idle"); }
                }}
                className="w-full py-4 bg-transparent text-text-primary placeholder-slate-400 outline-none min-h-[56px] text-sm"
                required
                autoComplete="email"
                autoFocus
              />
              {email.length > 0 && (
                <div className="flex-shrink-0 ml-1">
                  {isValidEmail
                    ? <Check className="w-5 h-5 text-emerald-500" />
                    : <X className="w-5 h-5 text-rose-400" />}
                </div>
              )}
            </div>

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
              disabled={!isValidEmail || status === "sending"}
              className="w-full justify-center text-center text-white font-bold bg-gradient-to-r from-primary to-secondary shadow-glow-primary hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none py-4 text-sm"
            >
              {status === "sending" ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Dispatching...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Send Verification Email</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </NeumorphicButton>
          </motion.form>
        ) : (
          /* --- Sent Success Card --- */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <GlassCard glow className="text-center py-8 px-6 space-y-4 bg-white">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <MailCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 tracking-widest uppercase">
                  EMAIL DISPATCHED
                </span>
                <h2 className="text-xl font-black text-text-primary tracking-tight pt-1">
                  Check Your Inbox!
                </h2>
              </div>
              <p className="text-xs text-text-secondary max-w-[280px] mx-auto leading-relaxed">
                A verification link has been sent to{" "}
                <span className="text-primary font-mono font-bold">
                  {email.toLowerCase().trim()}
                </span>
                . Click the link to continue.
              </p>

              {/* Resend error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
                  >
                    <span>⚠️</span><span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Resend button with countdown */}
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0 || status === "sending"}
                className="w-full py-3 rounded-2xl border border-slate-200 bg-slate-50 text-text-secondary text-xs font-mono font-bold hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${status === "sending" ? "animate-spin" : ""}`} />
                {resendCooldown > 0
                  ? `Resend (${resendCooldown}s)`
                  : status === "sending"
                  ? "Sending..."
                  : "Resend Email"}
              </button>
            </GlassCard>

            {/* Continue to Step 2 */}
            <button
              onClick={() =>
                router.push(`/verify-email?email=${encodeURIComponent(email.toLowerCase().trim())}`)
              }
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold shadow-glow-primary flex items-center justify-center gap-2 hover:opacity-95 transition-all"
            >
              <span>I&apos;ve Clicked the Link</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="text-center pt-1">
        <Link
          href="/login"
          className="text-sm text-text-secondary hover:text-primary transition-colors"
        >
          Already Awakened?{" "}
          <span className="text-primary font-semibold">Access System</span>
        </Link>
      </div>
    </motion.div>
  );
}
