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
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
