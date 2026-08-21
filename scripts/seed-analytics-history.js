import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import User from "../lib/models/User.js";

async function seedHistory() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("No MONGODB_URI");

  await mongoose.connect(uri);
  console.log("Connected to Mongo");

  const email = "monarch_test@solo.clear";
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  // Generate 20 workouts across the last 30 days
  const now = new Date();
  const logs = [];

  const workoutDays = [
    0, 1, 2, 4, 5, 7, 8, 9, 11, 12, 14, 15, 17, 18, 20, 21, 23, 25, 27, 28
  ];

  workoutDays.forEach((offset, idx) => {
    const d = new Date(now);
    d.setDate(d.getDate() - offset);
    const dateStr = d.toISOString().split("T")[0];

    const completedQuests = (idx % 4) + 1; // 1 to 4 quests
    const exercises = {
      pushups: completedQuests >= 1,
      squats: completedQuests >= 2,
      crunches: completedQuests >= 3,
      running: completedQuests >= 4,
    };
    const earnedExp = completedQuests * 2.5;

    logs.push({
      date: dateStr,
      timestamp: d,
      exercises,
      earnedExp,
      levelAtTime: Math.min(5, Math.floor(idx / 4) + 1),
      durationMinutes: completedQuests * 8,
    });
  });

  user.workoutLogs = logs;
  await user.save();

  console.log(`Seeded ${logs.length} workout logs for ${user.email}`);
  await mongoose.disconnect();
}

seedHistory().catch(console.error);
