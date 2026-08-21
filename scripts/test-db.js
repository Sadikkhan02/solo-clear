const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
if (!process.env.MONGODB_URI) {
  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
}

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined in .env.local or .env");
    console.log("ℹ️  Please add your MongoDB connection string to .env.local:");
    console.log("   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/solo_clear?retryWrites=true&w=majority");
    process.exit(1);
  }

  try {
    console.log("⏳ Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    console.log("✅ MongoDB Connected Successfully!");

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📊 Collections in database:", collections.map((c) => c.name));

    await mongoose.disconnect();
    console.log("🔌 Disconnected cleanly.");
    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
}

testConnection();
