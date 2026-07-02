import mongoose from "mongoose";
import config from "./index.ts";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.db.url);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
}
