import dns from "dns";
import mongoose from "mongoose";
import config from "./index.ts";

// local dev-machine DNS resolver sometimes gets stuck on 127.0.0.1 (VPN clients), breaking SRV lookups
if (config.isDev) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

export async function connectDB(): Promise<void> {
    try {
        await mongoose.connect(config.db.url);
        console.log("✅ MongoDB connected");
    } catch (err) {
        console.error("❌ MongoDB connection failed:", err);
        process.exit(1);
    }
}
