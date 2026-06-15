import type { Metadata } from "next"
import { LlmPricesClient, type PricesData } from "./llm-prices-client"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "LLM Pricing | Misha Lubich",
  description:
    "Real-time pricing for all major LLM models — GPT, Claude, Gemini, Grok, Mistral, and more. Compare input and output token costs across every major AI provider.",
  keywords: [
    "LLM pricing", "AI model costs", "token pricing", "GPT cost", "Claude pricing",
    "Gemini pricing", "LLM cost comparison", "AI API pricing", "language model pricing",
  ],
  openGraph: {
    title: "LLM Pricing | Misha Lubich",
    description: "Real-time per-million-token pricing across all major AI providers.",
    type: "website",
  },
}

async function fetchPrices(): Promise<PricesData | null> {
  try {
    const res = await fetch("https://www.llm-prices.com/current-v1.json", {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return (await res.json()) as PricesData
  } catch {
    return null
  }
}

export default async function LlmPricesPage() {
  const data = await fetchPrices()
  return (
    <main className="relative z-10 min-h-screen bg-background">
      <LlmPricesClient data={data} />
    </main>
  )
}
