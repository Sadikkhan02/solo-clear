import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function verifyToken(token) {
  if (!token || typeof token !== "string") {
    return { success: false, status: 400, error: "Verification token is required" };
  }

  await connectToDatabase();

  const user = await User.findOne({
    verificationToken: token,
    verificationExpires: { $gt: new Date() },
  });

  if (!user) {
    return {
      success: false,
      status: 400,
      error: "Invalid or expired verification token. Please request a new awakening link.",
    };
  }

    // Mark email as verified, clear pending flag, and clear tokens
    user.emailVerified = true;
    user.isPending = false;  // Allow /register/complete to find this user
    user.verificationToken = undefined;
    user.verificationExpires = undefined;

  await user.save();

  return {
    success: true,
    status: 200,
    message: "Hunter email verified successfully! System access fully unlocked.",
    email: user.email,
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { token } = body || {};

    const result = await verifyToken(token);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(
      { message: result.message, email: result.email },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/auth/verify error:", error);
    return NextResponse.json(
      { error: "Internal server error during verification" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    const result = await verifyToken(token);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(
      { message: result.message, email: result.email },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/auth/verify error:", error);
    return NextResponse.json(
      { error: "Internal server error during verification" },
      { status: 500 }
    );
  }
}
