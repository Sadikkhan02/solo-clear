import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { token } = params || {};

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Invalid or expired verification token. Please request a new awakening link.",
        },
        { status: 400 }
      );
    }

    // Mark verified and clear verification tokens
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;

    await user.save();

    return NextResponse.json(
      {
        message: "Hunter email verified successfully! System access fully unlocked.",
        email: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/auth/verify/[token] error:", error);
    return NextResponse.json(
      { error: "Internal server error during verification" },
      { status: 500 }
    );
  }
}
