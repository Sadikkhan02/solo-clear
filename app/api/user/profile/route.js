import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getTierBadge } from "@/lib/helpers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET: Fetch authenticated hunter profile with top-level username and metrics
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

    const rawProfile = user.profile || {};

    const profile = {
      displayName: rawProfile.displayName ?? null,
      age: rawProfile.age ?? null,
      weight: rawProfile.weight ?? null,
      weightUnit: rawProfile.weightUnit ?? "kg",
      height: rawProfile.height ?? null,
      heightUnit: rawProfile.heightUnit ?? "cm",
      goal: rawProfile.goal ?? "maintain",
      customGoal: rawProfile.customGoal ?? null,
    };

    const tier = getTierBadge(user.level || 0);

    return NextResponse.json(
      {
        email: user.email,
        username: user.username || user.profile?.username || null,
        level: user.level || 0,
        exp: user.exp || 0,
        streak: user.streak || 0,
        statPoints: user.statPoints || 0,
        stats: user.stats || {},
        tier,
        profile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update hunter profile and username with validation and uniqueness checks
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

    const {
      username,
      displayName,
      age,
      weight,
      weightUnit,
      height,
      heightUnit,
      goal,
      customGoal,
    } = body;

    const updatedProfile = { ...(user.profile?.toObject?.() || user.profile || {}) };

    // 1. Username Validation & Uniqueness
    if (username !== undefined) {
      const trimmedUsername = typeof username === "string" ? username.trim().toLowerCase() : null;
      if (trimmedUsername && trimmedUsername.length > 0) {
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmedUsername)) {
          return NextResponse.json(
            { error: "Username must be 3-20 characters using letters, numbers, and underscores only" },
            { status: 400 }
          );
        }

        // Check uniqueness across other users (case-insensitive)
        const existingWithUsername = await User.findOne({
          username: trimmedUsername,
          _id: { $ne: user._id },
        });

        if (existingWithUsername) {
          return NextResponse.json(
            { error: "Username is already taken by another hunter" },
            { status: 409 }
          );
        }

        user.username = trimmedUsername;
      }
    }

    // 2. Display Name Validation
    if (displayName !== undefined) {
      const trimmedDisplayName = typeof displayName === "string" ? displayName.trim() : null;
      if (trimmedDisplayName && trimmedDisplayName.length > 30) {
        return NextResponse.json(
          { error: "Display Name cannot exceed 30 characters" },
          { status: 400 }
        );
      }
      updatedProfile.displayName = trimmedDisplayName || null;
    }

    // 3. Age Validation (10 - 120)
    if (age !== undefined) {
      if (age === null || age === "") {
        updatedProfile.age = null;
      } else {
        const numAge = Number(age);
        if (isNaN(numAge) || numAge < 10 || numAge > 120) {
          return NextResponse.json(
            { error: "Age must be a valid number between 10 and 120" },
            { status: 400 }
          );
        }
        updatedProfile.age = Math.round(numAge);
      }
    }

    // 4. Weight Validation (20 - 500)
    if (weight !== undefined) {
      if (weight === null || weight === "") {
        updatedProfile.weight = null;
      } else {
        const numWeight = Number(weight);
        if (isNaN(numWeight) || numWeight < 20 || numWeight > 500) {
          return NextResponse.json(
            { error: "Weight must be a valid number between 20 and 500" },
            { status: 400 }
          );
        }
        updatedProfile.weight = Math.round(numWeight * 10) / 10;
      }
    }

    // 5. Weight Unit
    if (weightUnit !== undefined) {
      if (weightUnit !== "kg" && weightUnit !== "lbs") {
        return NextResponse.json(
          { error: "Weight unit must be either 'kg' or 'lbs'" },
          { status: 400 }
        );
      }
      updatedProfile.weightUnit = weightUnit;
    }

    // 6. Height Validation (50 - 300)
    if (height !== undefined) {
      if (height === null || height === "") {
        updatedProfile.height = null;
      } else {
        const numHeight = Number(height);
        if (isNaN(numHeight) || numHeight < 50 || numHeight > 300) {
          return NextResponse.json(
            { error: "Height must be a valid number between 50 and 300" },
            { status: 400 }
          );
        }
        updatedProfile.height = Math.round(numHeight * 10) / 10;
      }
    }

    // 7. Height Unit
    if (heightUnit !== undefined) {
      if (heightUnit !== "cm" && heightUnit !== "ft") {
        return NextResponse.json(
          { error: "Height unit must be either 'cm' or 'ft'" },
          { status: 400 }
        );
      }
      updatedProfile.heightUnit = heightUnit;
    }

    // 8. Goal
    if (goal !== undefined) {
      const allowedGoals = ["muscle", "fat_loss", "maintain", "endurance", "custom"];
      if (!allowedGoals.includes(goal)) {
        return NextResponse.json(
          { error: "Invalid fitness goal selected" },
          { status: 400 }
        );
      }
      updatedProfile.goal = goal;
    }

    // 9. Custom Goal
    if (customGoal !== undefined) {
      const trimmedCustom = typeof customGoal === "string" ? customGoal.trim() : null;
      if (trimmedCustom && trimmedCustom.length > 100) {
        return NextResponse.json(
          { error: "Custom goal cannot exceed 100 characters" },
          { status: 400 }
        );
      }
      updatedProfile.customGoal = trimmedCustom || null;
    }

    user.profile = updatedProfile;
    await user.save();

    return NextResponse.json(
      {
        message: "Hunter profile updated successfully",
        username: user.username,
        profile: updatedProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/user/profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
