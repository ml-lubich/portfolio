import type { Metadata } from "next"
import { ContextTetrisGame } from "@/components/games/context-tetris-game"

export const metadata: Metadata = {
  title: "Context Tetris | Games | Misha Lubich",
  description: "Arrange falling token blocks before hitting the context limit. LLM-themed Tetris.",
}

export default function ContextTetrisPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <ContextTetrisGame />
    </main>
  )
}
