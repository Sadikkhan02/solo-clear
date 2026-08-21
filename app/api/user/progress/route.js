import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Field Whitelist (strictly these fields can be modified via this generic endpoint)
const ALLOWED_FIELDS = [
  "dailyProgress",
  "dailyDurations",
  "durations",
  "claimedMilestones",
  "stats",
  "statPoints",
  "streak",
  "lastWorkoutDate",
];

const FORBIDDEN_FIELDS = ["email", "password", "_id", "createdAt", "updatedAt", "level", "exp"];

export async function PUT(request) {
  try {
    // --- AUTHENTICATION ---
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
    for (const key of FORBIDDEN_FIELDS) {
      if (body[key] !== undefined) {
        return NextResponse.json(
          { error: `Field '${key}' cannot be updated directly via this endpoint` },
          { status: 400 }
        );
      }
    }

    // --- SANITIZE WHITELISTED FIELDS ---
    const updateFields = {};
    const allowedExercises = ["pushups", "squats", "crunches", "running"];

    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) {
        if (key === "dailyProgress" && typeof body[key] === "object") {
          const sanitizedQuests = {};
          for (const ex of allowedExercises) {
            if (body[key][ex] !== undefined) {
              sanitizedQuests[ex] = Boolean(body[key][ex]);
            }
          }
          updateFields.dailyProgress = sanitizedQuests;
        } else if ((key === "dailyDurations" || key === "durations") && typeof body[key] === "object") {
          const sanitizedDurations = {};
          for (const ex of allowedExercises) {
            if (body[key][ex] !== undefined) {
              sanitizedDurations[ex] = Math.max(0, Number(body[key][ex]) || 0);
            }
          }
          updateFields.dailyDurations = sanitizedDurations;
        } else if (key === "claimedMilestones" && Array.isArray(body[key])) {
          updateFields.claimedMilestones = body[key].map(String);
        } else if (key === "stats" && typeof body[key] === "object") {
          const allowedStats = ["str", "vit", "agi", "con"];
          const sanitizedStats = {};
          for (const stat of allowedStats) {
            if (body[key][stat] !== undefined) {
              sanitizedStats[stat] = Math.max(0, Number(body[key][stat]) || 0);
            }
          }
          updateFields[key] = sanitizedStats;
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
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Hunter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Hunter progress updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/user/progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
