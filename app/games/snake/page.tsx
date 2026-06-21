import type { Metadata } from "next"
import { SnakeTerminal } from "@/components/terminal/snake-terminal"

export const metadata: Metadata = {
  title: "Snake | Games | Misha Lubich",
  description: "Classic Snake game — terminal edition.",
}

export default function SnakePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-4 flex items-center justify-between px-1">
          <a
            href="/games"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Games
          </a>
          <span className="font-mono text-xs text-muted-foreground/50">SNAKE</span>
          <span className="font-mono text-xs text-emerald-400">classic</span>
        </div>
        <SnakeTerminal />
      </div>
    </main>
  )
}
