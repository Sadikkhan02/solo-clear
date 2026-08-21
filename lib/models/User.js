import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    level: {
      type: Number,
      default: 0,
    },
    exp: {
      type: Number,
      default: 0,
    },
    statPoints: {
      type: Number,
      default: 0,
    },
    stats: {
      str: { type: Number, default: 0 },
      vit: { type: Number, default: 0 },
      agi: { type: Number, default: 0 },
      con: { type: Number, default: 0 }, // Constitution: 1% EXP bonus per point
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastWorkoutDate: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
    huntClaimedToday: {
      type: Boolean,
      default: false,
    },
    dailyProgress: {
      pushups: { type: Boolean, default: false },
      squats: { type: Boolean, default: false },
      crunches: { type: Boolean, default: false },
      running: { type: Boolean, default: false },
    },
    // --- Tracked Workout Duration per Exercise (in seconds) ---
    dailyDurations: {
      pushups: { type: Number, default: 0 },
      squats: { type: Number, default: 0 },
      crunches: { type: Number, default: 0 },
      running: { type: Number, default: 0 },
    },
    // --- Claimed Milestone Rewards ---
    claimedMilestones: {
      type: [String],
      default: [],
    },
    // --- Workout Activity History ---
    workoutLogs: [
      {
        date: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        exercises: {
          pushups: { type: Boolean, default: false },
          squats: { type: Boolean, default: false },
          crunches: { type: Boolean, default: false },
          running: { type: Boolean, default: false },
        },
        earnedExp: { type: Number, required: true },
        levelAtTime: { type: Number, required: true },
        durationMinutes: { type: Number, default: 15 },
      },
    ],
    emailVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    verificationToken: String,
    verificationExpires: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
