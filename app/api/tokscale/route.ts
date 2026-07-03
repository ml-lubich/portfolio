import { NextResponse } from "next/server"
import { stripTokscaleBackground } from "@/lib/tokscale-svg"

/** Server-cached tokscale embed proxy — strips the SVG's opaque card
 *  background so the stats render on the site's liquid-glass panel. */
export const revalidate = 1800

const EMBED_URL = "https://tokscale.ai/api/embed/ml-lubich/svg?sort=cost&compact=1"

export async function GET() {
  try {
    const res = await fetch(EMBED_URL, { next: { revalidate: 1800 } })
    if (!res.ok) return new NextResponse(null, { status: 502 })
    const svg = await res.text()
    return new NextResponse(stripTokscaleBackground(svg), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=900, stale-while-revalidate=3600",
      },
    })
  } catch {
    return new NextResponse(null, { status: 502 })
  }
}
