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
      <GlassCard glow={true} className="text-center py-10 px-6 space-y-4 bg-white">
        <div className="w-16 h-16 mx-auto rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-primary">
          <MailCheck className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-primary tracking-widest uppercase">
            AWAKENING INITIATED
          </span>
          <h1 className="text-2xl font-black text-text-primary tracking-tight pt-1">
            Check Your Email
          </h1>
        </div>

        <p className="text-xs text-text-secondary max-w-[300px] mx-auto leading-relaxed">
          A System verification link has been dispatched to{" "}
          <span className="text-primary font-mono font-bold">{email}</span>.
        </p>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-text-secondary max-w-[320px] mx-auto flex items-start gap-2 text-left shadow-sm">
          <ShieldAlert className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <span>
            Click the link in the email within 24 hours to confirm your identity and unlock full System Quest access.
          </span>
        </div>

        <div className="pt-3">
          <Link
            href="/login"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-mono font-bold shadow-glow-primary flex items-center justify-center gap-2 hover:opacity-95 transition-all"
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
          <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
