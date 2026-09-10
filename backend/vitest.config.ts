import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    globalSetup: ["./tests/setup.ts"],
    testTimeout: 20000,
    hookTimeout: 30000,
    // All test files share one in-memory MongoDB instance (see tests/setup.ts) and each
    // test clears the database in beforeEach, so files must run sequentially, not in
    // parallel workers, or they will wipe each other's data mid-test.
    fileParallelism: false,
  },
});
