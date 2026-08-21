import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import {
  getRequiredExp,
  getWorkoutProgression,
  getTier,
  getDaysDifference,
  getTodayDateString,
} from "@/lib/helpers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
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

    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json(
        { error: "Hunter not found" },
        { status: 404 }
      );
    }

    // --- GUARD 1: Prevent duplicate claims on the same day ---
    if (user.huntClaimedToday) {
      return NextResponse.json(
        { error: "Hunt already claimed today. Rest, Hunter. The System resets tomorrow." },
        { status: 400 }
      );
    }

    // --- GUARD 2: Must complete at least 1 exercise ---
    const completedCount = Object.values(user.dailyProgress || {}).filter(Boolean).length;
    if (completedCount === 0) {
      return NextResponse.json(
        { error: "Complete at least one exercise to claim your Hunt." },
        { status: 400 }
      );
    }

    // --- CAPTURE DAILY PROGRESS FOR WORKOUT LOG BEFORE RESET ---
    const completedExercises = {
      pushups: !!user.dailyProgress?.pushups,
      squats: !!user.dailyProgress?.squats,
      crunches: !!user.dailyProgress?.crunches,
      running: !!user.dailyProgress?.running,
    };

    // --- CALCULATE ACTUAL DURATION FROM TRACKED TIMER SECONDS ---
    const totalDurationSeconds = Object.values(user.dailyDurations || {}).reduce(
      (sum, s) => sum + (Number(s) || 0),
      0
    );

    const actualDurationMinutes =
      totalDurationSeconds > 0
        ? Math.max(1, Math.round(totalDurationSeconds / 60))
        : Math.max(10, completedCount * 5);

    // --- CALCULATE PROGRESSION & EXP WITH CON BONUS ---
    const currentLevel = user.level || 0;
    const progression = getWorkoutProgression(currentLevel);
    const expPerQuest = progression.expReward / 4;
    const rawExp = expPerQuest * completedCount;

    // Constitution grants +1% EXP multiplier per point
    const conStat = user.stats?.con || 0;
    const conMultiplier = 1 + conStat * 0.01;

    const earnedExp = Math.round(rawExp * conMultiplier * 10) / 10;

    let newExp = Math.max(0, (user.exp || 0) + earnedExp);
    let newLevel = currentLevel;
    let newStatPoints = user.statPoints || 0;
    let levelsGained = 0;

    // --- MULTI-LEVEL PROGRESSION LOOP ---
    let required = getRequiredExp(newLevel);
    while (newExp >= required) {
      newExp -= required;
      newLevel += 1;
      newStatPoints += 3; // +3 stat points per level
      levelsGained += 1;
      required = getRequiredExp(newLevel);
    }

    // --- STREAK LOGIC ---
    const today = getTodayDateString();
    let newStreak = user.streak || 0;

    if (user.lastWorkoutDate) {
      const daysElapsed = getDaysDifference(user.lastWorkoutDate, today);
      if (daysElapsed === 1) {
        newStreak = (user.streak || 0) + 1; // Consecutive day
      } else if (daysElapsed === 0) {
        newStreak = Math.max(1, user.streak || 1);
      } else {
        newStreak = 1; // Fresh start after gap
      }
    } else {
      newStreak = 1;
    }

    // --- UPDATE & PERSIST HUNTER STATE ---
    user.level = newLevel;
    user.exp = Math.round(newExp * 10) / 10;
    user.statPoints = newStatPoints;
    user.streak = newStreak;
    user.lastWorkoutDate = today;
    user.huntClaimedToday = true;
    user.dailyProgress = {
      pushups: false,
      squats: false,
      crunches: false,
      running: false,
    };
    user.dailyDurations = {
      pushups: 0,
      squats: 0,
      crunches: 0,
      running: 0,
    };

    // --- RECORD WORKOUT LOG ENTRY ---
    if (!user.workoutLogs) {
      user.workoutLogs = [];
    }

    user.workoutLogs.unshift({
      date: today,
      timestamp: new Date(),
      exercises: completedExercises,
      earnedExp: earnedExp,
      levelAtTime: newLevel,
      durationMinutes: actualDurationMinutes,
    });

    // Keep up to last 365 logs (1 year history cap)
    if (user.workoutLogs.length > 365) {
      user.workoutLogs = user.workoutLogs.slice(0, 365);
    }

    await user.save();

    // Sanitize response
    const { password: _, ...sanitizedHunter } = user.toObject();

    return NextResponse.json(
      {
        message: "Hunt completed successfully!",
        hunter: sanitizedHunter,
        earnedExp,
        levelsGained,
        levelUp: levelsGained > 0,
        actualDurationMinutes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/user/hunt/complete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
