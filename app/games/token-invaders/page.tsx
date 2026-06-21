import type { Metadata } from "next"
import { TokenInvadersGame } from "@/components/games/token-invaders-game"

export const metadata: Metadata = {
  title: "Token Invaders | Games | Misha Lubich",
  description: "Defend your LLM context window against AI failure modes. LLM-themed Space Invaders.",
}

export default function TokenInvadersPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <TokenInvadersGame />
    </main>
  )
}
