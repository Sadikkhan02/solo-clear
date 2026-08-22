import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/verify/status?email=...
 * Returns the verification + pending status for a given email.
 * Used by the frontend to poll and auto-advance the registration flow.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "email query parameter is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    await connectToDatabase();

    const user = await User.findOne(
      { email: normalizedEmail },
      { emailVerified: 1, isPending: 1, _id: 0 } // project only what we need
    );

    if (!user) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    return NextResponse.json(
      {
        exists: true,
        verified: user.emailVerified === true,
        pending: user.isPending !== false, // true if isPending is true OR undefined (legacy)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/auth/verify/status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
