import type { Metadata } from "next"
import { PromptRunnerGame } from "@/components/games/prompt-runner-game"

export const metadata: Metadata = {
  title: "Prompt Runner | Games | Misha Lubich",
  description: "Dodge prompt injections. Collect grounding data. Survive.",
}

export default function PromptRunnerPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <PromptRunnerGame />
    </main>
  )
}
