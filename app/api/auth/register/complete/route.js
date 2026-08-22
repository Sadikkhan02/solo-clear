import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, username } = body || {};

    // --- VALIDATION ---
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Email, password, and username are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = String(username).toLowerCase().trim();

    // Username format validation: 3-20 chars, letters, numbers, and underscores
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(normalizedUsername)) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters, letters/numbers/underscore only" },
        { status: 400 }
      );
    }

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
    if (user.password && user.username) {
      return NextResponse.json(
        { error: "Hunter account already fully activated. Please log in." },
        { status: 409 }
      );
    }

    // --- CHECK USERNAME UNIQUENESS ---
    const existingWithUsername = await User.findOne({
      username: normalizedUsername,
      _id: { $ne: user._id },
    });

    if (existingWithUsername) {
      return NextResponse.json(
        { error: "Username is already taken by another hunter. Please choose a different handle." },
        { status: 409 }
      );
    }

    // --- HASH AND SAVE PASSWORD & USERNAME ---
    const hashedPassword = await bcrypt.hash(password, 10);
    user.username = normalizedUsername;
    user.password = hashedPassword;
    user.isPending = false;
    user.emailVerified = true;
    await user.save();

    return NextResponse.json(
      {
        message: "Hunter awakened successfully! You can now log in.",
        username: user.username,
      },
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
