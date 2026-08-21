"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { MailCheck, ArrowRight, ShieldAlert } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your registered email";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex flex-col justify-center min-h-[85vh] py-8 select-none"
    >
      <GlassCard glow={true} className="text-center py-10 px-6 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-accent-cyan/15 border border-accent-cyan/40 flex items-center justify-center text-accent-cyan">
          <MailCheck className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan tracking-widest uppercase">
            AWAKENING INITIATED
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight pt-1">
            Check Your Email
          </h1>
        </div>

        <p className="text-xs text-gray-300 max-w-[300px] mx-auto leading-relaxed">
          A System verification link has been dispatched to{" "}
          <span className="text-accent-cyan font-mono font-semibold">{email}</span>.
        </p>

        <div className="p-3 rounded-xl bg-dark-bg/60 border border-white/5 text-[11px] font-mono text-gray-400 max-w-[320px] mx-auto flex items-start gap-2 text-left">
          <ShieldAlert className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" />
          <span>
            Click the link in the email within 24 hours to confirm your identity and unlock full System Quest access.
          </span>
        </div>

        <div className="pt-3">
          <Link
            href="/login"
            className="w-full py-4 rounded-xl bg-gradient-to-r from-accent-cyan to-blue-700 text-white text-xs font-mono font-bold shadow-glow-cyan flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
