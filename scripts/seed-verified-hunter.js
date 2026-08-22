import dotenv from "dotenv";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../lib/models/User.js";

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("No MONGODB_URI");

  await mongoose.connect(uri);
  console.log("Connected to Mongo");

  const email = "monarch_test@solo.clear";
  const username = "monarch_test";
  await User.deleteMany({ $or: [{ email }, { username }] });

  const hashedPassword = await bcrypt.hash("Hunter123", 10);
  const user = await User.create({
    email,
    username,
    profile: {
      displayName: "Shadow Monarch",
    },
    password: hashedPassword,
    level: 0,
    exp: 8, // 8 / 10 EXP so completing hunt will level up!
    statPoints: 0,
    stats: { str: 10, vit: 10, agi: 10 },
    streak: 3,
    huntClaimedToday: false,
    emailVerified: true,
    dailyProgress: {
      pushups: false,
      squats: false,
      crunches: false,
      running: false,
    },
    dailyDurations: {
      pushups: 0,
      squats: 0,
      crunches: 0,
      running: 0,
    },
    lastWorkoutDate: new Date().toISOString().split("T")[0],
  });

  console.log("Seeded user:", user.email);
  await mongoose.disconnect();
}

seed().catch(console.error);
