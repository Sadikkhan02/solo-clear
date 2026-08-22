import dotenv from "dotenv";
import dns from "dns";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(__dirname, "..", ".env") });
}

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../lib/models/User.js";
import { getTierBadge } from "../lib/helpers.js";

async function runTests() {
  console.log("⚔️ Running Phase 22 Automated Verification Tests...\n");

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not found");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  const testPrefix = `p22_${Date.now().toString().slice(-6)}`;
  const testEmail1 = `${testPrefix}_1@test.com`;
  const testEmail2 = `${testPrefix}_2@test.com`;
  const testUsername1 = `h_${Date.now().toString().slice(-6)}_a`;
  const testUsername2 = `h_${Date.now().toString().slice(-6)}_b`;

  try {
    // ----------------------------------------------------
    // TEST 1: Tier Badge Threshold Logic
    // ----------------------------------------------------
    console.log("\n[TEST 1] Testing Rank Tier Badge Thresholds...");
    const tier55 = getTierBadge(55);
    const tier35 = getTierBadge(35);
    const tier25 = getTierBadge(25);
    const tier15 = getTierBadge(15);
    const tier7 = getTierBadge(7);
    const tier2 = getTierBadge(2);

    if (
      tier55.label === "S-Rank" &&
      tier35.label === "A-Rank" &&
      tier25.label === "B-Rank" &&
      tier15.label === "C-Rank" &&
      tier7.label === "D-Rank" &&
      tier2.label === "E-Rank"
    ) {
      console.log("✅ S/A/B/C/D/E-Rank tier badge calculation: PASSED");
    } else {
      throw new Error(`Tier badge threshold mismatch: ${JSON.stringify({ tier55, tier35, tier25, tier15, tier7, tier2 })}`);
    }

    // ----------------------------------------------------
    // TEST 2: User Schema & Username Validation
    // ----------------------------------------------------
    console.log("\n[TEST 2] Testing User Schema & Top-Level Username...");

    // 2a: Valid user creation
    const hashedPassword = await bcrypt.hash("Password123", 10);
    const user1 = await User.create({
      email: testEmail1,
      username: testUsername1,
      password: hashedPassword,
      isPending: false,
      emailVerified: true,
      level: 25,
      exp: 150,
      streak: 10,
      profile: {
        displayName: "Shadow King",
        age: 24,
        weight: 78,
        height: 182,
        goal: "muscle",
      },
    });

    if (user1.username === testUsername1 && user1.profile.displayName === "Shadow King") {
      console.log("✅ User created with top-level username & profile: PASSED");
    } else {
      throw new Error("User username/profile mismatch");
    }

    // 2b: Duplicate username rejection
    let duplicateRejected = false;
    try {
      await User.create({
        email: testEmail2,
        username: testUsername1, // duplicate!
        password: hashedPassword,
        isPending: false,
        emailVerified: true,
      });
    } catch (dupErr) {
      duplicateRejected = true;
      console.log("✅ Duplicate username rejection: PASSED (Rejected correctly)");
    }

    if (!duplicateRejected) {
      throw new Error("Duplicate username was unexpectedly allowed!");
    }

    // 2c: Invalid username regex rejection (< 3 chars or special symbols)
    let invalidRegexRejected = false;
    try {
      await User.create({
        email: `${testPrefix}_invalid@test.com`,
        username: "ab!", // invalid char '!' and length < 3
        password: hashedPassword,
        isPending: false,
        emailVerified: true,
      });
    } catch (regexErr) {
      invalidRegexRejected = true;
      console.log("✅ Invalid username format rejection: PASSED (Rejected correctly)");
    }

    if (!invalidRegexRejected) {
      throw new Error("Invalid username regex was unexpectedly allowed!");
    }

    // ----------------------------------------------------
    // TEST 3: Global Ranking Query & Standing Calculation
    // ----------------------------------------------------
    console.log("\n[TEST 3] Testing Global Ranking Query & Rank Calculation...");

    const user2 = await User.create({
      email: testEmail2,
      username: testUsername2,
      password: hashedPassword,
      isPending: false,
      emailVerified: true,
      level: 30, // higher level than user1 (25)
      exp: 50,
      streak: 5,
      profile: {
        displayName: "Monarch Slayer",
      },
    });

    const baseFilter = {
      isPending: false,
      emailVerified: true,
      username: { $ne: null },
    };

    const total = await User.countDocuments(baseFilter);
    const sorted = await User.find(baseFilter)
      .sort({ level: -1, exp: -1, streak: -1, _id: 1 })
      .select("username level exp streak");

    console.log(`Found ${total} ranked hunters in database.`);

    // user2 (level 30) should rank higher than user1 (level 25)
    const user2Index = sorted.findIndex((u) => u.username === testUsername2);
    const user1Index = sorted.findIndex((u) => u.username === testUsername1);

    if (user2Index >= 0 && user1Index >= 0 && user2Index < user1Index) {
      console.log(`✅ Rank ordering (User2 Level 30 @ rank ${user2Index + 1} > User1 Level 25 @ rank ${user1Index + 1}): PASSED`);
    } else {
      throw new Error(`Rank ordering failed: user2 idx = ${user2Index}, user1 idx = ${user1Index}`);
    }

    // Calculate user1 rank count
    const higherThanUser1 = await User.countDocuments({
      ...baseFilter,
      $or: [
        { level: { $gt: user1.level || 0 } },
        { level: user1.level || 0, exp: { $gt: user1.exp || 0 } },
        { level: user1.level || 0, exp: user1.exp || 0, streak: { $gt: user1.streak || 0 } },
        { level: user1.level || 0, exp: user1.exp || 0, streak: user1.streak || 0, _id: { $lt: user1._id } },
      ],
    });

    const calculatedRank = higherThanUser1 + 1;
    if (calculatedRank === user1Index + 1) {
      console.log(`✅ Current user rank calculation (#${calculatedRank}): PASSED`);
    } else {
      throw new Error(`Calculated rank #${calculatedRank} did not match index #${user1Index + 1}`);
    }

    // ----------------------------------------------------
    // TEST 4: Password Verification & Change Simulation
    // ----------------------------------------------------
    console.log("\n[TEST 4] Testing Password Change & Verification...");

    const isOriginalMatch = await bcrypt.compare("Password123", user1.password);
    if (!isOriginalMatch) throw new Error("Original password did not match");

    const newHashed = await bcrypt.hash("NewSecret456", 10);
    user1.password = newHashed;
    await user1.save();

    const isNewMatch = await bcrypt.compare("NewSecret456", user1.password);
    const isOldRejected = await bcrypt.compare("Password123", user1.password);

    if (isNewMatch && !isOldRejected) {
      console.log("✅ Password update & hashing: PASSED");
    } else {
      throw new Error("Password update failed");
    }

    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log("\n🧹 Cleaning up test data...");
    await User.deleteMany({ email: { $in: [testEmail1, testEmail2] } });
    console.log("✅ Test data cleaned up successfully.");

    console.log("\n🎉 ALL PHASE 22 VERIFICATION TESTS PASSED SUCCESSFULLY! ⚔️\n");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Phase 22 Verification Test Failed:", err);
    await User.deleteMany({ email: { $in: [testEmail1, testEmail2] } }).catch(() => {});
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

runTests();
