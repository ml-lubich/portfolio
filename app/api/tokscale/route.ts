import { NextRequest, NextResponse } from "next/server"
import { stripTokscaleBackground, recolorForLightTheme } from "@/lib/tokscale-svg"

/** Server-cached tokscale embed proxy — strips the SVG's opaque card
 *  background so the stats render on the site's liquid-glass panel, and
 *  recolors its baked-dark text/lines when the caller is on the light theme. */
export const revalidate = 1800

const EMBED_URL = "https://tokscale.ai/api/embed/ml-lubich/svg?sort=cost&compact=1"

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(EMBED_URL, { next: { revalidate: 1800 } })
    if (!res.ok) return new NextResponse(null, { status: 502 })
    const svg = await res.text()
    const stripped = stripTokscaleBackground(svg)
    const isLight = request.nextUrl.searchParams.get("theme") === "light"
    return new NextResponse(isLight ? recolorForLightTheme(stripped) : stripped, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=900, stale-while-revalidate=3600",
      },
    })
  } catch {
    return new NextResponse(null, { status: 502 })
  }
}
