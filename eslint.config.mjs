import nextCoreWebVitals from "eslint-config-next/core-web-vitals"

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    ignores: [
      ".next/**",
      ".next.stale*/**",
      /* The e2e harness builds here; linting its minified output produced
         ~26k warnings and 2MB of noise on every pre-commit run. */
      ".next-e2e/**",
      /* Agent scratch: nested worktrees carry their own node_modules/.next. */
      ".claude/**",
      "coverage/**",
      "node_modules/**",
      "tsconfig.tsbuildinfo",
    ],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "warn",
      "prefer-const": "warn",
      /* R3F / Three.js use refs and imperative buffer updates; compiler-style rules are too strict here. */
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]

export default config
