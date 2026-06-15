import { NextResponse } from "next/server"

export const revalidate = 3600

export async function GET() {
  try {
    const res = await fetch("https://www.llm-prices.com/current-v1.json", {
      next: { revalidate: 3600 },
    })
    if (!res.ok) {
      return NextResponse.json({ error: "upstream unavailable" }, { status: 502 })
    }
    const data: unknown = await res.json()
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    })
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 500 })
  }
}
