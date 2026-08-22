import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { sendVerificationEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 60-second cooldown between resend attempts
const RESEND_COOLDOWN_MS = 60 * 1000;
// Cleanup: delete pending users whose token expired > 48h ago
const STALE_THRESHOLD_MS = 48 * 60 * 60 * 1000;

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body || {};

    // --- VALIDATION ---
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail.includes("@") || !normalizedEmail.includes(".")) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // --- INLINE CLEANUP: Remove stale pending users (> 48h expired) ---
    await User.deleteMany({
      isPending: true,
      verificationExpires: { $lt: new Date(Date.now() - STALE_THRESHOLD_MS) },
    });

    // --- CHECK EXISTING USER ---
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      // Already fully registered → conflict
      if (existingUser.isPending === false) {
        return NextResponse.json(
          { error: "A hunter with this email is already registered" },
          { status: 409 }
        );
      }

      // Pending → check cooldown before resending
      if (
        existingUser.lastVerificationSent &&
        Date.now() - existingUser.lastVerificationSent.getTime() < RESEND_COOLDOWN_MS
      ) {
        const secondsLeft = Math.ceil(
          (RESEND_COOLDOWN_MS - (Date.now() - existingUser.lastVerificationSent.getTime())) / 1000
        );
        return NextResponse.json(
          {
            error: `Please wait ${secondsLeft} second${secondsLeft !== 1 ? "s" : ""} before requesting another verification email`,
          },
          { status: 429 }
        );
      }

      // Pending + cooldown passed → refresh token and resend
      const newToken = crypto.randomBytes(32).toString("hex");
      existingUser.verificationToken = newToken;
      existingUser.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      existingUser.lastVerificationSent = new Date();
      await existingUser.save();

      try {
        await sendVerificationEmail(normalizedEmail, newToken);
      } catch (emailErr) {
        console.error("Warning: Could not resend verification email:", emailErr);
      }

      return NextResponse.json(
        { message: "Verification email resent. Please check your inbox." },
        { status: 200 }
      );
    }

    // --- NEW PENDING USER ---
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await User.create({
      email: normalizedEmail,
      isPending: true,
      verificationToken,
      verificationExpires,
      lastVerificationSent: new Date(),
      // All other fields use schema defaults (no password, level:0, etc.)
    });

    // --- SEND VERIFICATION EMAIL ---
    try {
      await sendVerificationEmail(normalizedEmail, verificationToken);
    } catch (emailErr) {
      console.error("Warning: Could not send verification email:", emailErr);
      // Non-blocking — user can request resend
    }

    return NextResponse.json(
      { message: "Verification email sent. Please check your inbox." },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/auth/register/initiate error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
