import type { Metadata } from "next"
import { HallucinationGame } from "@/components/games/hallucination-game"

export const metadata: Metadata = {
  title: "Hallucination Detector | Games | Misha Lubich",
  description: "Detect AI hallucinations before they corrupt your context.",
}

export default function HallucinationDetectorPage() {
  return (
    <main className="min-h-screen bg-background">
      <HallucinationGame />
    </main>
  )
}
