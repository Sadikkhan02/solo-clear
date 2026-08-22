"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import NeumorphicButton from "@/components/ui/NeumorphicButton";
import { CheckCircle2, XCircle, ArrowRight, ShieldCheck } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing from the link.");
        return;
      }

      try {
        const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Invalid or expired verification link.");
        } else {
          // Capture email so we can pass it to the complete page
          setVerifiedEmail(data.email || "");
          setStatus("success");
          setMessage(data.message || "Hunter email verified successfully!");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        setMessage("Connection error. Could not verify email.");
      }
    }

    verify();
  }, [token]);

  useEffect(() => {
    if (status !== "success") return;

    if (countdown <= 0) {
      // Redirect to password setup step with email pre-filled
      router.push(`/register/complete?email=${encodeURIComponent(verifiedEmail)}`);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [status, countdown, router, verifiedEmail]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex flex-col justify-center min-h-[85vh] py-8 select-none"
    >
      {status === "verifying" && (
        <GlassCard className="text-center py-12 px-6 space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
          <h2 className="text-xl font-bold text-white font-mono tracking-wide">
            VERIFYING HUNTER IDENTITY...
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            Calibrating Monarch system authentication tokens
          </p>
        </GlassCard>
      )}

      {status === "success" && (
        <GlassCard className="text-center py-10 px-6 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent-cyan/15 border border-accent-cyan/40 flex items-center justify-center text-accent-cyan">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan tracking-widest">
              AWAKENING VERIFIED
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight pt-1">
              Identity Confirmed
            </h2>
          </div>
          <p className="text-xs text-gray-300 max-w-[280px] mx-auto leading-relaxed">
            {message}
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-bg/80 border border-white/5 text-xs font-mono text-gray-300">
            <span>Setting up your profile in</span>
            <span className="text-accent-cyan font-bold text-sm">{countdown}s</span>
          </div>

          <div className="pt-2">
            <NeumorphicButton
              onClick={() =>
                router.push(`/register/complete?email=${encodeURIComponent(verifiedEmail)}`)
              }
              className="w-full justify-center text-white font-bold bg-gradient-to-r from-accent-cyan to-blue-700 shadow-glow-cyan"
            >
              <span>Set Your Password Now</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </NeumorphicButton>
          </div>
        </GlassCard>
      )}

      {status === "error" && (
        <GlassCard className="text-center py-10 px-6 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white font-mono">
            Verification Failed
          </h2>
          <p className="text-xs text-gray-300 max-w-[280px] mx-auto leading-relaxed">
            {message}
          </p>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/register"
              className="w-full py-3 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-mono font-bold hover:bg-accent-cyan/20 transition-colors block text-center"
            >
              Awaken New Account
            </Link>
            <Link
              href="/login"
              className="text-xs text-gray-400 hover:text-white pt-2 transition-colors block text-center"
            >
              ← Return to Login
            </Link>
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
