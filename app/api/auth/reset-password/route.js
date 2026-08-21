import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { sendResetPasswordEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body || {};

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
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

    const user = await User.findOne({ email: normalizedEmail });

    // Return generic 200 message to prevent email enumeration even if user not found
    if (!user) {
      return NextResponse.json(
        {
          message:
            "If an awakened hunter account exists for this email, a recovery link has been dispatched.",
        },
        { status: 200 }
      );
    }

    // Generate 32-byte reset token with 1 hour expiration
    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;

    await user.save();

    try {
      await sendResetPasswordEmail(user.email, resetPasswordToken);
    } catch (emailErr) {
      console.error("Warning: Failed to send reset password email:", emailErr);
    }

    return NextResponse.json(
      {
        message:
          "If an awakened hunter account exists for this email, a recovery link has been dispatched.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/auth/reset-password error:", error);
    return NextResponse.json(
      { error: "Internal server error during password reset request" },
      { status: 500 }
    );
  }
}
