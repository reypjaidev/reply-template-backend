import rateLimit from "express-rate-limit";
import config from "../config/index.ts";

// Skip rate limiting during automated tests only — a test suite legitimately
// fires more requests per IP than a real user would in 15 minutes.
// Production and dev behavior is untouched.
const skipInTest = () => process.env.NODE_ENV === "test";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per window
  message: { error: "Too many requests, please try again later" },
  skip: skipInTest,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.isDev ? 100 : 10, // stricter for login/register
  message: { error: "Too many attempts, please try again later" },
  skip: skipInTest,
});
