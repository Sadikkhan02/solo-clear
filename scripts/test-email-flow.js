import dotenv from "dotenv";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing in .env.local");
  process.exit(1);
}

// Minimal User Schema for testing
const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    level: { type: Number, default: 0 },
    emailVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

const User = mongoose.models.TestEmailUser || mongoose.model("TestEmailUser", UserSchema, "users");

async function runTests() {
  console.log("🧪 Starting Phase 10: Email Integration & Token Lifecycle Test...\n");

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");

    const testEmail = `test_email_${Date.now()}@system.test`;
    const initialPassword = "OldPassword123";
    const newPassword = "NewHunterPassword456";

    // 1. CREATE USER WITH VERIFICATION TOKEN
    console.log("\n1️⃣ Testing Registration with Verification Token...");
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(initialPassword, 10);

    const user = await User.create({
      email: testEmail,
      password: hashedPassword,
      emailVerified: false,
      verificationToken,
      verificationExpires,
    });

    console.log(`✅ User created: ${user.email} (Verified: ${user.emailVerified})`);
    console.log(`✅ Verification token assigned: ${verificationToken.slice(0, 10)}... (Expires: ${verificationExpires.toISOString()})`);

    // 2. TEST INVALID VERIFICATION TOKEN
    console.log("\n2️⃣ Testing Invalid Verification Token...");
    const invalidToken = "fake_invalid_token_123456";
    const invalidCheck = await User.findOne({
      verificationToken: invalidToken,
      verificationExpires: { $gt: new Date() },
    });
    if (!invalidCheck) {
      console.log("✅ Invalid token correctly rejected (null match)");
    } else {
      throw new Error("Invalid token unexpectedly matched!");
    }

    // 3. TEST VALID EMAIL VERIFICATION
    console.log("\n3️⃣ Testing Valid Email Verification...");
    const verifyMatch = await User.findOne({
      verificationToken,
      verificationExpires: { $gt: new Date() },
    });

    if (!verifyMatch) {
      throw new Error("Valid verification token not found!");
    }

    verifyMatch.emailVerified = true;
    verifyMatch.verificationToken = undefined;
    verifyMatch.verificationExpires = undefined;
    await verifyMatch.save();

    const verifiedUser = await User.findById(user._id);
    if (verifiedUser.emailVerified && !verifiedUser.verificationToken) {
      console.log("✅ Email successfully verified and token cleared!");
    } else {
      throw new Error("Email verification failed to persist!");
    }

    // 4. TEST PASSWORD RESET TOKEN GENERATION
    console.log("\n4️⃣ Testing Password Reset Request Token...");
    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    verifiedUser.resetPasswordToken = resetPasswordToken;
    verifiedUser.resetPasswordExpires = resetPasswordExpires;
    await verifiedUser.save();

    console.log(`✅ Reset token generated: ${resetPasswordToken.slice(0, 10)}... (Expires: ${resetPasswordExpires.toISOString()})`);

    // 5. TEST PASSWORD RESET CONFIRMATION & HASHING
    console.log("\n5️⃣ Testing Password Reset Confirmation...");
    const resetMatch = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!resetMatch) {
      throw new Error("Valid reset token not found!");
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    resetMatch.password = newHashedPassword;
    resetMatch.resetPasswordToken = undefined;
    resetMatch.resetPasswordExpires = undefined;
    await resetMatch.save();

    // 6. VERIFY NEW PASSWORD WITH BCRYPT
    console.log("\n6️⃣ Testing Authentication with New Password...");
    const updatedUser = await User.findById(user._id);
    const oldPasswordMatches = await bcrypt.compare(initialPassword, updatedUser.password);
    const newPasswordMatches = await bcrypt.compare(newPassword, updatedUser.password);

    if (!oldPasswordMatches && newPasswordMatches) {
      console.log("✅ Old password correctly invalidated!");
      console.log("✅ New password verified successfully with bcrypt!");
    } else {
      throw new Error("Password update verification failed!");
    }

    // CLEANUP
    console.log("\n🧹 Cleaning up test user...");
    await User.deleteOne({ _id: user._id });
    console.log("✅ Test user removed.");

    console.log("\n🎉 ALL PHASE 10 EMAIL & TOKEN LIFECYCLE TESTS PASSED!\n");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Email flow test failed:", error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

runTests();
