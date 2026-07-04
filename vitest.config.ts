import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

process.env.NODE_ENV = "test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    // mongodb-memory-server downloads a binary on first run — give it room
    testTimeout: 20000,
    hookTimeout: 20000,
    include: ["tests/**/*.test.ts"],
  },
});
