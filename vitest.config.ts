import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    include: ["__tests__/**/*.test.ts"],
    testTimeout: 30_000, // external URL checks need time
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      // Scope coverage to pure-logic libs that are realistically unit-testable
      // without a DOM. UI components (.tsx) are exercised by the SSR / smoke
      // suites in __tests__/ rather than line-coverage tests.
      include: [
        "lib/viewport-resize.ts",
        "lib/scroll-stack-layout.ts",
        "lib/nav-hero-surface.ts",
        "lib/mdx-chart-fences.ts",
        "lib/blog-chart-schema.ts",
        "lib/blog-format.ts",
        "lib/blog-shared.ts",
        "lib/snake-game.ts",
      ],
      thresholds: {
        // 80% line / statement / function coverage on covered files.
        // Branch threshold is lower because Zod schema branches and
        // snake-game state-machine guards have many defensive paths
        // that are not worth synthesizing in tests.
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 70,
      },
    },
  },
})
