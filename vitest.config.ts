import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 15000, // 15 seconds timeout for tests
    coverage: {
      reporter: ["text", "lcov", "html"],
      exclude: ["node_modules/", "dist/", "__tests__/", "*.config.*", "coverage/"],
    },
    include: ["__tests__/**/*.test.ts"],
    globals: true,
    setupFiles: ["__tests__/setup.ts"],
  },
})
