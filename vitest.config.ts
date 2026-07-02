import { defineConfig } from "vitest/config";

process.env.NODE_ENV = "test";

export default defineConfig({
  test: {
    environment: "node",
    // mongodb-memory-server downloads a binary on first run — give it room
    testTimeout: 20000,
    hookTimeout: 20000,
    include: ["tests/**/*.test.ts"],
  },
});
