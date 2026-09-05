import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8")

/* The intro portrait is aspect-[4/5] and only got a width cap at `lg:`. Between
 * sm and lg — iPad held upright — it therefore ran the full column width, so a
 * 768px-wide viewport rendered a 960px-tall face and nothing else fit on screen. */
describe("profile intro portrait", () => {
    const source = read("components/sections/profile-intro.tsx")
    const frame = source.slice(source.indexOf("{/* Portrait"), source.indexOf("misha-headshot"))

    it("caps its width below the lg breakpoint, not only at it", () => {
        expect(frame).toMatch(/max-w-\[\d+(\.\d+)?rem\]/)
    })

    it("still centres once it is narrower than its column", () => {
        expect(frame).toContain("mx-auto")
    })

    it("keeps the 4:5 frame so object-cover never crops the head", () => {
        expect(frame).toContain("aspect-[4/5]")
    })
})
