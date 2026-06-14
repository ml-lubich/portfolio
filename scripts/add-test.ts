#!/usr/bin/env bun
/**
 * CLI to scaffold a new regression/behavior test file in __tests__/.
 *
 * Usage:
 *   bun run test:add <slug> [--describe "what you are guarding"]
 *
 * Examples:
 *   bun run test:add nav-scroll
 *   bun run test:add blog-cover-images --describe "every post has a unique cover"
 *
 * The generated file is ready to run immediately:
 *   bun run test -- __tests__/<slug>.test.ts
 */

import { existsSync, writeFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const TESTS_DIR = join(ROOT, "__tests__")

function usage(): never {
  console.error(`
Usage: bun run test:add <slug> [--describe "description"]

  slug         kebab-case name for the test file (no .test.ts extension needed)
  --describe   optional one-line description of what the test guards

Examples:
  bun run test:add nav-scroll
  bun run test:add blog-cover-images --describe "every post has a unique cover"
`)
  process.exit(1)
}

function parseArgs(argv: string[]): { slug: string; describe: string } {
  const args = argv.slice(2)
  const slugArg = args.find((a) => !a.startsWith("--"))
  if (!slugArg) usage()

  const descIdx = args.indexOf("--describe")
  const describe =
    descIdx !== -1 && args[descIdx + 1]
      ? args[descIdx + 1]
      : `regression guard for ${slugArg}`

  return { slug: slugArg.replace(/\.test\.ts$/, ""), describe }
}

function scaffold(slug: string, describeLabel: string): string {
  return `import { describe, it, expect } from "vitest"

/**
 * ${describeLabel}
 *
 * Add your test cases below. Each \`it\` block should have exactly one
 * \`expect\` assertion (MAX_ASSERTS_PER_TEST = 1).
 *
 * Run this file in isolation:
 *   bun run test -- __tests__/${slug}.test.ts
 *
 * Run the full suite:
 *   bun run test
 */

describe("${slug}", () => {
  it("placeholder — replace with your first behavior", () => {
    // TODO: import the module under test and assert its behavior
    expect(true).toBe(true)
  })
})
`
}

function main() {
  const { slug, describe } = parseArgs(process.argv)

  const dest = join(TESTS_DIR, `${slug}.test.ts`)
  if (existsSync(dest)) {
    console.error(`Error: __tests__/${slug}.test.ts already exists.`)
    process.exit(1)
  }

  writeFileSync(dest, scaffold(slug, describe), "utf8")
  console.log(`
✓ Created __tests__/${slug}.test.ts

Next steps:
  1. Open __tests__/${slug}.test.ts in your editor
  2. Import the module or source file you want to guard
  3. Replace the placeholder with a real assertion
  4. Run: bun run test -- __tests__/${slug}.test.ts

To run all tests:
  bun run test

Where to put test data / fixtures:
  - Data files:       data/
  - Public assets:    public/
  - MDX content:      content/blog/
  - Source under test: components/, lib/, app/

Test naming convention: __tests__/<area>-<what-it-guards>.test.ts
`)
}

main()
