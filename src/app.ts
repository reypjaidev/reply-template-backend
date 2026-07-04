// src/app.ts
import cors from "cors";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import config from "./config/index.ts";
import { authMiddleware } from "./middleware/auth.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import { authLimiter, globalLimiter } from "./middleware/rateLimiter.ts";
import { requestLogger } from "./middleware/requestLogger.ts";
import authRouter from "./modules/auth/auth.router.ts";
import usersRouter from "./modules/users/users.router.ts";

const app: Application = express();

// ── 1. SECURITY ──────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // your React app
    credentials: true, // allow cookies
  }),
);

// ── 2. RATE LIMITING ─────────────────────────────────────
app.use(globalLimiter);

// ── 3. PARSING ───────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── 4. LOGGING ───────────────────────────────────────────
app.use(requestLogger);

// ── 5. HEALTH CHECK ──────────────────────────────────────
// no auth, no rate limit — for Docker/monitoring to ping
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
// ── 6. PUBLIC ROUTES ─────────────────────────────────────
app.use(`${config.api.prefix}/auth`, authLimiter, authRouter);

// ── 7. PROTECTED ROUTES ──────────────────────────────────
app.use(`${config.api.prefix}/users`, authMiddleware, usersRouter);

// ── 8. 404 ───────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── 9. ERROR HANDLER ─────────────────────────────────────
app.use(errorHandler);

export default app;
