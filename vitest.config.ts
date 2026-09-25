import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    globals: false,
    restoreMocks: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
