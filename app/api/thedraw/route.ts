import { mkdtemp, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { NextResponse } from "next/server"
import { THEDRAW_FONTS } from "@/data/thedraw-fonts"

export const runtime = "nodejs"

type TheDrawRenderer = {
  tdfont: (text: string, options: Record<string, string | number | boolean>) => string
  constants: { COLOR_ANSI: number; ENC_UNICODE: number }
}
const thedraw = require("tdfonts") as TheDrawRenderer
const FONT_DIR = path.join(process.cwd(), "node_modules/tdfonts/fonts")

export async function POST(request: Request) {
  let tempDir = ""
  try {
    const form = await request.formData()
    const text = form.get("text")
    const font = form.get("font")
    const width = Number(form.get("width") ?? 80)
    const file = form.get("fontFile")
    if (typeof text !== "string" || !text.trim() || text.length > 120) return NextResponse.json({ error: "Text must be 1–120 characters." }, { status: 400 })
    if (typeof font !== "string" || font.length > 100) return NextResponse.json({ error: "Choose a valid TheDraw font." }, { status: 400 })
    if (!Number.isInteger(width) || width < 20 || width > 160) return NextResponse.json({ error: "Width must be between 20 and 160." }, { status: 400 })

    let fontPath = font
    if (file instanceof File && file.size > 0) {
      if (file.size > 1024 * 1024 || !file.name.toLowerCase().endsWith(".tdf")) return NextResponse.json({ error: "Custom TheDraw fonts must be .tdf files under 1 MB." }, { status: 400 })
      tempDir = await mkdtemp(path.join(os.tmpdir(), "taag-tdf-"))
      fontPath = path.join(tempDir, "custom.tdf")
      await writeFile(fontPath, Buffer.from(await file.arrayBuffer()))
    } else if (!(THEDRAW_FONTS as readonly string[]).includes(font.toLowerCase())) {
      return NextResponse.json({ error: "Unknown font. Choose a listed font or upload a .tdf file." }, { status: 404 })
    }

    const art = thedraw.tdfont(text, {
      font: fontPath,
      fontDir: FONT_DIR,
      width,
      color: thedraw.constants.COLOR_ANSI,
      encoding: thedraw.constants.ENC_UNICODE,
      justify: 0,
      random: false,
    })
    return NextResponse.json({ art })
  } catch {
    return NextResponse.json({ error: "That file could not be rendered as a TheDraw font." }, { status: 400 })
  } finally {
    if (tempDir) await rm(tempDir, { recursive: true, force: true })
  }
}
