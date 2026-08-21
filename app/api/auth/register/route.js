import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    // --- VALIDATION PIPELINE ---
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
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

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // --- DUPLICATE PREVENTION ---
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "A hunter with this email already exists" },
        { status: 409 }
      );
    }

    // --- PASSWORD HASHING ---
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- GENERATE VERIFICATION TOKEN (24h expiry) ---
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // --- CREATE HUNTER ---
    const newHunter = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      level: 0,
      exp: 0,
      statPoints: 0,
      stats: { str: 0, vit: 0, agi: 0 },
      streak: 0,
      lastWorkoutDate: new Date().toISOString().split("T")[0],
      huntClaimedToday: false,
      dailyProgress: {
        pushups: false,
        squats: false,
        crunches: false,
        running: false,
      },
      emailVerified: false,
      verificationToken,
      verificationExpires,
    });

    // --- SEND VERIFICATION EMAIL ---
    try {
      await sendVerificationEmail(normalizedEmail, verificationToken);
    } catch (emailErr) {
      console.error("Warning: Could not send verification email:", emailErr);
      // Non-blocking for registration completion
    }

    // --- SANITIZE RESPONSE (Exclude password) ---
    const { password: _, ...sanitizedHunter } = newHunter.toObject();

    return NextResponse.json(
      {
        message: "Hunter awakened successfully! Verification email dispatched.",
        hunter: sanitizedHunter,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Invalid hunter data provided" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
