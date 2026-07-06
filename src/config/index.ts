import "dotenv/config";

const requiredEnvVars = ["DB_URL", "JWT_SECRET"] as const;

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`);
    process.exit(1);
  }
});

const config = {
  env: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
  server: {
    port: Number(process.env.PORT) || 3000,
  },
  db: {
    url: process.env.DB_URL as string,
  },
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn:
      process.env.NODE_ENV === "production"
        ? ("15m" as const)
        : ("7d" as const),
    // mirrors expiresIn above, but as a number — res.cookie's maxAge needs ms, not a string
    accessTokenMaxAge:
      process.env.NODE_ENV === "production"
        ? 15 * 60 * 1000
        : 7 * 24 * 60 * 60 * 1000,
    refreshTokenExpiresIn:
      process.env.NODE_ENV === "production"
        ? 30 * 24 * 60 * 60 * 1000
        : 1 * 60 * 1000, // for testing, 1 minute in development
    //: 7 * 24 * 60 * 60 * 1000, // 30 days in production, 7 days in development
  },
  aws: {
    bucket: process.env.AWS_BUCKET,
  },
  api: {
    prefix: "/api/v1",
  },
};

export default config;
