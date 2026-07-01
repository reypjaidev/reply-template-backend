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
  },
  aws: {
    bucket: process.env.AWS_BUCKET,
  },
};

export default config;
