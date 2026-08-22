"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { MailCheck, RefreshCw, ArrowLeft, Check, CheckCircle2 } from "lucide-react";

// --- Step Progress Indicator (reused pattern) ---
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

// --- Pulsing waiting dot ---
function WaitingIndicator() {
  return (
    <div className="flex items-center justify-center gap-2 text-text-muted text-xs font-mono">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
      </span>
      <span>Waiting for verification...</span>
    </div>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [isVerified, setIsVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState("idle"); // idle | sending | sent | error
  const [resendError, setResendError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const cooldownRef = useRef(null);
  const pollRef = useRef(null);

  // --- Resend countdown ---
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

  // --- Poll verification status every 3s ---
  useEffect(() => {
    if (!email || isVerified) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/auth/verify/status?email=${encodeURIComponent(email)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.verified && !data.pending) {
          clearInterval(pollRef.current);
          setIsVerified(true);
          // Small celebration delay before redirect
          setTimeout(() => {
            router.push(
              `/register/complete?email=${encodeURIComponent(email)}`
            );
          }, 1500);
        }
      } catch {
        // Silent — polling is best-effort
      }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [email, isVerified, router]);

  // --- Resend email ---
  const handleResend = async () => {
    if (resendCooldown > 0 || resendStatus === "sending") return;
    setResendError("");
    setResendSuccess(false);
    setResendStatus("sending");

    try {
      const res = await fetch("/api/auth/register/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setResendSuccess(true);
        startCooldown();
        // Flash "Email resent!" for 3s
        setTimeout(() => setResendSuccess(false), 3000);
      } else {
        setResendError(data.error || "Failed to resend. Please try again.");
      }
    } catch {
      setResendError("Connection error. Could not resend.");
    } finally {
      setResendStatus("idle");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex flex-col justify-center min-h-[85vh] py-8 select-none space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <StepDots current={2} />
        <div className="inline-block px-4 py-1 mx-auto rounded-full bg-indigo-50 border border-indigo-200 text-primary text-xs font-mono tracking-widest uppercase font-bold">
          AWAKENING INITIATED
        </div>
        <h1 className="text-3xl font-black text-text-primary tracking-tight">
          Check Your Email
        </h1>
        <p className="text-text-secondary text-sm">
          Step 2 of 3 — Verify your email address
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isVerified ? (
          /* --- Verified success state --- */
          <motion.div
            key="verified"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <GlassCard glow className="text-center py-10 px-6 space-y-4 bg-white">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 tracking-widest uppercase">
                  EMAIL VERIFIED
                </span>
                <h2 className="text-2xl font-black text-text-primary tracking-tight pt-1">
                  Identity Confirmed!
                </h2>
              </div>
              <p className="text-xs text-text-secondary max-w-[280px] mx-auto leading-relaxed">
                Setting up your hunter profile...
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="text-xs font-mono text-text-muted">Redirecting to Step 3</span>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          /* --- Waiting state --- */
          <motion.div
            key="waiting"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <GlassCard glow className="text-center py-8 px-6 space-y-5 bg-white">
              <div className="w-16 h-16 mx-auto rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-primary">
                <MailCheck className="w-8 h-8" />
              </div>

              <div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  A verification link was sent to
                </p>
                <p className="text-primary font-mono font-bold text-sm mt-0.5">
                  {email || "your email address"}
                </p>
              </div>

              {/* Polling indicator */}
              <div className="py-2">
                <WaitingIndicator />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-text-secondary max-w-[300px] mx-auto flex items-start gap-2 text-left shadow-sm">
                <span className="text-primary mt-0.5">ℹ</span>
                <span>
                  Click the link in your email. This page will automatically
                  advance when verified.
                </span>
              </div>

              {/* Resend success flash */}
              <AnimatePresence>
                {resendSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Email resent successfully!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Resend error */}
              <AnimatePresence>
                {resendError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
                  >
                    <span>⚠️</span>
                    <span>{resendError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Resend button */}
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0 || resendStatus === "sending"}
                className="w-full py-3 rounded-2xl border border-slate-200 bg-slate-50 text-text-secondary text-xs font-mono font-bold hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${resendStatus === "sending" ? "animate-spin" : ""}`}
                />
                {resendCooldown > 0
                  ? `Resend (${resendCooldown}s)`
                  : resendStatus === "sending"
                  ? "Sending..."
                  : "Resend Email"}
              </button>
            </GlassCard>

            {/* Back to Step 1 */}
            <div className="text-center">
              <Link
                href="/register"
                className="text-sm text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Step 1</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
