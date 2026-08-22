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
      required: false, // Set during registration completion step (pending users have no password)
    },
    isPending: {
      type: Boolean,
      default: true, // true until email verified + password set
    },
    lastVerificationSent: {
      type: Date, // Cooldown: 60s between resend attempts
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
    username: {
      type: String,
      required: [
        function () {
          return !this.isPending;
        },
        "Username is required",
      ],
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9_]{3,20}$/,
        "Username must be 3-20 chars, letters/numbers/underscore only",
      ],
    },
    // --- User Profile Details ---
    profile: {
      displayName: { type: String, required: false, trim: true },
      age: { type: Number, required: false, min: 10, max: 120 },
      weight: { type: Number, required: false, min: 20, max: 500 },
      weightUnit: { type: String, enum: ["kg", "lbs"], default: "kg" },
      height: { type: Number, required: false, min: 50, max: 300 },
      heightUnit: { type: String, enum: ["cm", "ft"], default: "cm" },
      goal: {
        type: String,
        enum: ["muscle", "fat_loss", "maintain", "endurance", "custom"],
        default: "maintain",
      },
      customGoal: { type: String, required: false, trim: true },
    },
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
