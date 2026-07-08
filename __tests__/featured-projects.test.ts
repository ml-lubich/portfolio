/**
 * Regression: Featured Projects includes the live Vercel prototype builds
 * (Reviewly, ScrapeChatAI, LeadPipe) with screenshots + external links, each
 * flagged as a prototype, and the section carries a prototype disclaimer.
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"
import { projects } from "@/data/projects"

const ROOT = path.resolve(__dirname, "..")

const PROTOTYPES = [
  { id: "reviewly", url: "reviewly-self.vercel.app", cover: "reviewly-hero" },
  { id: "scrapechat", url: "scrapechat.vercel.app", cover: "scrapechat-hero" },
  { id: "leadpipe", url: "leadpipe-two.vercel.app", cover: "leadpipe-hero" },
]

describe("Featured Projects — Vercel prototypes", () => {
  PROTOTYPES.forEach(({ id, url, cover }) => {
    const project = projects.find((p) => p.id === id)

    it(`includes the ${id} project`, () => {
      expect(project, `project '${id}' must exist in data/projects.ts`).toBeTruthy()
    })

    it(`${id} links to its live deployment ${url}`, () => {
      expect(project!.detail.link?.url).toContain(url)
    })

    it(`${id} has a committed cover screenshot that exists on disk`, () => {
      expect(project!.coverImage).toBe(`/images/projects/${cover}.png`)
      expect(
        fs.existsSync(path.join(ROOT, "public", project!.coverImage!)),
        `${cover}.png must be committed under public/images/projects`,
      ).toBe(true)
    })

    it(`${id} is flagged as a prototype`, () => {
      expect(project!.prototype).toBe(true)
    })
  })

  it("client sites (real production) are NOT flagged as prototypes", () => {
    for (const realId of ["enrichdata", "lupfr", "w3sourcing", "eria"]) {
      const p = projects.find((x) => x.id === realId)
      expect(p?.prototype, `${realId} is a real client site`).not.toBe(true)
    }
  })

  it("the Projects section renders a Prototype badge and a disclaimer", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "components/sections/projects.tsx"),
      "utf8",
    )
    // Per-card badge driven by the prototype flag
    expect(src).toMatch(/project\.prototype/)
    expect(src).toContain("Prototype")
    // Section-level disclaimer explaining what "prototype" means
    expect(src.toLowerCase()).toContain("not full production")
  })
})
