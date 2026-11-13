import { readFile } from "node:fs/promises"
import path from "node:path"
import { NextResponse } from "next/server"
import { FIGLET_FONTS } from "@/data/figlet-fonts"

export const runtime = "nodejs"

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params
  const name = filename.replace(/\.flf$/i, "")
  const match = FIGLET_FONTS.find((font) => font.toLowerCase() === name.toLowerCase())
  if (!match) return new NextResponse("Unknown FIGlet font", { status: 404 })
  const file = path.join(process.cwd(), "node_modules/figlet/fonts", `${match}.flf`)
  return new NextResponse(await readFile(file, "utf8"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=31536000, immutable" },
  })
}
