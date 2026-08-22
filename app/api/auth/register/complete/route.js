import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    // --- VALIDATION ---
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // --- FIND VERIFIED, PENDING-COMPLETE USER ---
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { error: "No registration found for this email. Please start the awakening process." },
        { status: 400 }
      );
    }

    // Must be verified but not yet completed
    if (user.isPending === true || !user.emailVerified) {
      return NextResponse.json(
        { error: "Email not yet verified. Please click the link in your verification email first." },
        { status: 400 }
      );
    }

    // Prevent double-completion (account already has a password)
    if (user.password) {
      return NextResponse.json(
        { error: "Hunter account already fully activated. Please log in." },
        { status: 409 }
      );
    }

    // --- HASH AND SAVE PASSWORD ---
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json(
      { message: "Hunter awakened successfully! You can now log in." },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/auth/register/complete error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
