import { describe, expect, it } from "vitest"
import { FIGLET_FONTS } from "@/data/figlet-fonts"
import { GET as getFont } from "@/app/api/taag-fonts/[filename]/route"
import { POST as renderTheDraw } from "@/app/api/thedraw/route"

describe("Go WTF TAAG page", () => {
  it("offers the TAAG fonts shown in the examples and a broad font list", () => {
    expect(FIGLET_FONTS).toContain("Isometric1")
    expect(FIGLET_FONTS.length).toBeGreaterThan(300)
  })

  it("serves a bundled FIGfont and rejects arbitrary file paths", async () => {
    const ok = await getFont(new Request("https://example.test"), { params: Promise.resolve({ filename: "Isometric1.flf" }) })
    expect(ok.status).toBe(200)
    expect(await ok.text()).toContain("flf2a")
    const bad = await getFont(new Request("https://example.test"), { params: Promise.resolve({ filename: "../../package.json" }) })
    expect(bad.status).toBe(404)
  })

  it("renders the Bleach TheDraw ANSI font and rejects unknown font names", async () => {
    const form = new FormData()
    form.set("text", "Hello")
    form.set("font", "bleach")
    const response = await renderTheDraw(new Request("https://example.test/api/thedraw", { method: "POST", body: form }))
    expect(response.status).toBe(200)
    const result = await response.json() as { art: string }
    expect(result.art).toContain("\u001b[")

    form.set("font", "../../package.json")
    const bad = await renderTheDraw(new Request("https://example.test/api/thedraw", { method: "POST", body: form }))
    expect(bad.status).toBe(404)
  })
})
