import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getTodayDateString, getDaysDifference } from "@/lib/helpers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // --- AUTHENTICATION ---
    const session = await getServerSession(authOptions);
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const query = session.user.id
      ? { _id: session.user.id }
      : { email: session.user.email.toLowerCase() };

    const user = await User.findOne(query).select("-password");

    if (!user) {
      return NextResponse.json(
        { error: "Hunter not found" },
        { status: 404 }
      );
    }

    // --- SERVER-SIDE PENALTY & RESET ENGINE ---
    const today = getTodayDateString();
    let updated = false;

    if (user.lastWorkoutDate) {
      const daysElapsed = getDaysDifference(user.lastWorkoutDate, today);

      // Rule 1: Auto-reset daily quests and unlock hunt claim on a new calendar day
      if (daysElapsed >= 1) {
        user.dailyProgress = {
          pushups: false,
          squats: false,
          crunches: false,
          running: false,
        };
        user.huntClaimedToday = false;
        updated = true;
      }

      // Rule 2: Apply 50% EXP penalty and reset streak after 2+ days of inactivity
      if (daysElapsed >= 2) {
        user.exp = Math.max(0, Math.floor((user.exp || 0) * 0.5));
        user.streak = 0;
        updated = true;
      }
    }

    if (updated) {
      await user.save();
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("GET /api/user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
