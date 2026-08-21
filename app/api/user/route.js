import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getTodayDateString, getDaysDifference } from "@/lib/helpers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET: Fetch hunter profile with automatic penalty logic
export async function GET() {
  try {
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

    const user = await User.findOne(query);

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

    // Sanitize response (strictly exclude password)
    const { password: _, ...sanitizedUser } = user.toObject();

    return NextResponse.json({ user: sanitizedUser }, { status: 200 });
  } catch (error) {
    console.error("GET /api/user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update hunter stats and attributes (whitelisted fields only)
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    // --- REJECT FORBIDDEN FIELDS ---
    const forbidden = ["email", "password", "_id", "createdAt", "updatedAt"];
    for (const key of forbidden) {
      if (body[key] !== undefined) {
        return NextResponse.json(
          { error: `Field '${key}' cannot be updated directly` },
          { status: 400 }
        );
      }
    }

    // --- WHITELIST VALIDATION ---
    const ALLOWED_FIELDS = ["stats", "statPoints", "level", "exp", "streak", "lastWorkoutDate", "dailyProgress"];
    const updateFields = {};

    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) {
        if (key === "stats" && typeof body[key] === "object") {
          const allowedStats = ["str", "vit", "agi"];
          const sanitizedStats = {};
          for (const stat of allowedStats) {
            if (body[key][stat] !== undefined) {
              sanitizedStats[stat] = Math.max(0, Number(body[key][stat]) || 0);
            }
          }
          updateFields[key] = sanitizedStats;
        } else if (key === "dailyProgress" && typeof body[key] === "object") {
          const allowedQuests = ["pushups", "squats", "crunches", "running"];
          const sanitizedQuests = {};
          for (const q of allowedQuests) {
            if (body[key][q] !== undefined) {
              sanitizedQuests[q] = Boolean(body[key][q]);
            }
          }
          updateFields[key] = sanitizedQuests;
        } else if (key === "statPoints") {
          updateFields[key] = Math.max(0, Number(body[key]) || 0);
        } else {
          updateFields[key] = body[key];
        }
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: "No valid update fields provided" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const query = session.user.id
      ? { _id: session.user.id }
      : { email: session.user.email.toLowerCase() };

    const updatedUser = await User.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Hunter not found" },
        { status: 404 }
      );
    }

    const { password: _, ...sanitizedUser } = updatedUser.toObject();

    return NextResponse.json(
      {
        message: "Hunter updated successfully",
        user: sanitizedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
