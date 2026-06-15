import type { Metadata } from "next"
import { ToolsClient } from "./tools-client"

export const metadata: Metadata = {
  title: "AI Tools | Misha Lubich",
  description:
    "Interactive AI project cost estimator and system prompt linter for planning production-ready AI products.",
  keywords: [
    "AI project estimator", "LLM cost estimator", "prompt linter", "AI consulting",
    "system prompt review", "AI product planning", "Misha Lubich tools",
  ],
  openGraph: {
    title: "AI Tools | Misha Lubich",
    description: "Plan AI product scope and lint system prompts with practical interactive tools.",
    type: "website",
  },
}

export default function ToolsPage() {
  return (
    <main className="relative z-10 min-h-screen bg-background">
      <ToolsClient />
    </main>
  )
}
