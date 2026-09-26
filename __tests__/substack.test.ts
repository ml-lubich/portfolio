/**
 * Substack "Writing" pointer — constants, and that it's actually wired up
 * (nav, page, social icons, JSON-LD, MLBot's system prompt).
 */

import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"
import { SUBSTACK_URL, SUBSTACK_SUBSCRIBE_URL, LATEST_POST } from "@/lib/substack"
import { navLinks } from "@/components/nav/nav-links"
import { SOCIAL_LINKS } from "@/components/social-icons"

const ROOT = path.resolve(__dirname, "..")
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8")

describe("Substack constants", () => {
  it("points at Misha's real publication", () => {
    expect(SUBSTACK_URL).toBe("https://mlubich.substack.com")
    expect(SUBSTACK_SUBSCRIBE_URL).toBe("https://mlubich.substack.com/subscribe")
  })

  it("the latest post has a title, a URL under the publication, and a summary", () => {
    expect(LATEST_POST.title).toBeTruthy()
    expect(LATEST_POST.url.startsWith(SUBSTACK_URL)).toBe(true)
    expect(LATEST_POST.description.length).toBeGreaterThan(10)
    expect(LATEST_POST.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe("wiring", () => {
  it("Writing is a nav link pointing at #writing", () => {
    expect(navLinks.some((l) => l.href === "#writing")).toBe(true)
  })

  it("the homepage mounts the writing section with a nav-reachable id", () => {
    const page = read("app/page.tsx")
    expect(page).toContain('sectionId="writing"')
    expect(page).toContain("Writing")
  })

  it("Substack is listed as a social/profile link", () => {
    expect(SOCIAL_LINKS.some((l) => l.href === SUBSTACK_URL)).toBe(true)
  })

  it("Substack is in the Person schema's sameAs", () => {
    expect(read("components/seo/json-ld.tsx")).toContain("mlubich.substack.com")
  })

  it("the section links the latest post and embeds Substack's subscribe box, no popup/modal", () => {
    const section = read("components/sections/substack.tsx")
    expect(section).toContain("LATEST_POST.url")
    expect(section).toContain("SUBSTACK_SUBSCRIBE_URL")
    expect(section).toContain('src={`${SUBSTACK_URL}/embed`}')
    expect(section).toContain("Subscribe to Misha Lubich on Substack")
    expect(section).not.toMatch(/role=["']dialog["']/)
    expect(section).not.toContain("Dialog")
  })

  it("MLBot's system prompt can point visitors to the publication", () => {
    const prompt = read("lib/ai/profile-tools.ts")
    expect(prompt).toContain("mlubich.substack.com")
    expect(prompt).toContain(LATEST_POST.title)
  })
})

describe("Follow section", () => {
  it("Follow is a nav link pointing at #follow", () => {
    expect(navLinks.some((l) => l.href === "#follow")).toBe(true)
  })

  it("the homepage mounts the follow section with a nav-reachable id", () => {
    const page = read("app/page.tsx")
    expect(page).toContain('sectionId="follow"')
    expect(page).toContain("Follow")
  })

  it("cards X, LinkedIn, Substack, and GitHub, driven by one array", () => {
    const section = read("components/sections/follow.tsx")
    expect(section).toContain("FOLLOW_CARDS")
    expect(section).toContain("x.com/Machine_Lubich")
    expect(section).toContain("linkedin.com/in/misha-lubich")
    expect(section).toContain("substack.com/@mlubich")
    expect(section).toContain("github.com/ml-lubich")
    expect(section).not.toContain("youtube")
  })
})

describe("X (Twitter) presence", () => {
  it("X is listed in SOCIAL_LINKS", () => {
    expect(SOCIAL_LINKS.some((l) => l.href === "https://x.com/Machine_Lubich")).toBe(true)
  })

  it("X is in the Person schema's sameAs, alongside a fixed LinkedIn URL", () => {
    const jsonLd = read("components/seo/json-ld.tsx")
    expect(jsonLd).toContain("https://x.com/Machine_Lubich")
    expect(jsonLd).toContain("https://substack.com/@mlubich")
    expect(jsonLd).toContain("https://www.linkedin.com/in/misha-lubich/")
    expect(jsonLd).not.toContain("https://linkedin.com/in/mishalubich")
  })

  it("the contact section lists X and Substack alongside the other profiles", () => {
    const contact = read("components/sections/contact.tsx")
    expect(contact).toContain("https://x.com/Machine_Lubich")
    expect(contact).toContain("https://mlubich.substack.com")
  })

  it("MLBot's profile tools expose an X URL alongside LinkedIn and GitHub", () => {
    const tools = read("lib/ai/profile-tools.ts")
    expect(tools).toContain('X_URL = "https://x.com/Machine_Lubich"')
  })
})
