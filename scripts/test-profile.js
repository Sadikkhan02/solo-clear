const dns = require("dns");
const path = require("path");

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
if (!process.env.MONGODB_URI) {
  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
}

const mongoose = require("mongoose");

async function testProfile() {
  console.log("🧪 Testing User Profile Schema & Validation...");
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  // Define minimal Schema matching User model for testing
  const ProfileSchema = new mongoose.Schema({
    email: String,
    profile: {
      username: { type: String, unique: true, sparse: true, trim: true },
      displayName: { type: String, trim: true },
      age: { type: Number, min: 10, max: 120 },
      weight: { type: Number, min: 20, max: 500 },
      weightUnit: { type: String, enum: ["kg", "lbs"], default: "kg" },
      height: { type: Number, min: 50, max: 300 },
      heightUnit: { type: String, enum: ["cm", "ft"], default: "cm" },
      goal: {
        type: String,
        enum: ["muscle", "fat_loss", "maintain", "endurance", "custom"],
        default: "maintain",
      },
      customGoal: { type: String, trim: true },
    },
  });

  const TestUser = mongoose.models.TestProfileUser || mongoose.model("TestProfileUser", ProfileSchema);

  const testEmail = `test_hunter_${Date.now()}@system.test`;

  try {
    // 1. Create a test user with a profile
    const user = await TestUser.create({
      email: testEmail,
      profile: {
        username: `hunter_${Date.now()}`,
        displayName: "Shadow Monarch",
        age: 24,
        weight: 75.5,
        weightUnit: "kg",
        height: 180,
        heightUnit: "cm",
        goal: "muscle",
        customGoal: null,
      },
    });

    console.log("✅ User created with profile:", user.profile.displayName, `(${user.profile.goal})`);

    // 2. Verify profile retrieval
    const fetched = await TestUser.findById(user._id);
    if (
      fetched.profile.username === user.profile.username &&
      fetched.profile.displayName === "Shadow Monarch" &&
      fetched.profile.weight === 75.5 &&
      fetched.profile.goal === "muscle"
    ) {
      console.log("✅ Profile retrieval & field matching: PASSED");
    } else {
      throw new Error("Profile fields did not match expected values");
    }

    // 3. Test profile update
    fetched.profile.goal = "custom";
    fetched.profile.customGoal = "100 Pushups unbroken";
    await fetched.save();

    const updated = await TestUser.findById(user._id);
    if (updated.profile.goal === "custom" && updated.profile.customGoal === "100 Pushups unbroken") {
      console.log("✅ Profile update & custom goal: PASSED");
    } else {
      throw new Error("Profile update failed");
    }

    // 4. Test validation limits (e.g. invalid age)
    let validationFailed = false;
    try {
      await TestUser.create({
        email: `invalid_${Date.now()}@system.test`,
        profile: {
          age: 5, // below min 10
        },
      });
    } catch (valErr) {
      validationFailed = true;
      console.log("✅ Validation check for invalid age (< 10): PASSED (rejected correctly)");
    }

    if (!validationFailed) {
      throw new Error("Invalid age was unexpectedly allowed!");
    }

    // Clean up test users
    await TestUser.deleteMany({ email: { $in: [testEmail] } });
    await mongoose.disconnect();
    console.log("🧹 Cleaned up test data & disconnected.");

    console.log("\n🎉 All Profile schema & validation tests PASSED successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err);
    await TestUser.deleteMany({ email: testEmail });
    await mongoose.disconnect();
    process.exit(1);
  }
}

testProfile();
