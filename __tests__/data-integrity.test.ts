/**
 * Data integrity tests — validate all portfolio data arrays
 *
 * Ensures experiences, projects, publications, skills, blog posts, and
 * nav links are complete and well-formed. Catches missing fields,
 * duplicate IDs, empty arrays, and other data quality issues before build.
 *
 *   bun run test            # run all tests
 *   bunx vitest run __tests__/data-integrity.test.ts
 */

import { describe, it, expect } from "vitest"
import { experiences } from "@/data/experiences"
import { projects } from "@/data/projects"
import { consultingClients } from "@/data/consulting-clients"
import { clientTestimonials } from "@/data/client-testimonials"
import { workMarqueeSegments } from "@/data/work-marquee"
import { papers } from "@/data/publications"
import { skillCategories, proficiencyBars } from "@/data/skills"
import { blogPosts, BLOG_CATEGORIES, getPostBySlug, getReadingTime } from "@/lib/blog-data"
import { navLinks } from "@/components/nav/nav-links"

// ── Experiences ────────────────────────────────────────────────────────────────

describe("Experiences data", () => {
    it("should have at least one experience", () => {
        expect(experiences.length).toBeGreaterThan(0)
    })

    it("should have no duplicate IDs", () => {
        const ids = experiences.map((e) => e.id)
        expect(new Set(ids).size).toBe(ids.length)
    })

    for (const exp of experiences) {
        describe(`experience: ${exp.id}`, () => {
            it("has required fields", () => {
                expect(exp.title).toBeTruthy()
                expect(exp.company).toBeTruthy()
                expect(exp.period).toBeTruthy()
                expect(exp.summary).toBeTruthy()
                expect(exp.tags.length).toBeGreaterThan(0)
            })

            it("has a valid detail panel", () => {
                expect(exp.detail).toBeDefined()
                expect(exp.detail.title).toBeTruthy()
                expect(exp.detail.description).toBeTruthy()
                expect(exp.detail.highlights?.length).toBeGreaterThan(0)
                expect(exp.detail.techStack?.length).toBeGreaterThan(0)
            })
        })
    }
})

// ── Projects ───────────────────────────────────────────────────────────────────

describe("Projects data", () => {
    it("should have at least one project", () => {
        expect(projects.length).toBeGreaterThan(0)
    })

    it("should have no duplicate IDs", () => {
        const ids = projects.map((p) => p.id)
        expect(new Set(ids).size).toBe(ids.length)
    })

    for (const proj of projects) {
        describe(`project: ${proj.id}`, () => {
            it("has required fields", () => {
                expect(proj.name).toBeTruthy()
                expect(proj.summary).toBeTruthy()
                expect(proj.tags.length).toBeGreaterThan(0)
                expect(proj.metric).toBeTruthy()
            })

            it("has a valid detail panel", () => {
                expect(proj.detail).toBeDefined()
                expect(proj.detail.title).toBeTruthy()
                expect(proj.detail.description).toBeTruthy()
                expect(proj.detail.techStack?.length).toBeGreaterThan(0)
            })
        })
    }
})

// ── Work marquee (consulting scope strip) ─────────────────────────────────────

describe("Work marquee data", () => {
    it("has a modest number of segments", () => {
        expect(workMarqueeSegments.length).toBeGreaterThanOrEqual(6)
        expect(workMarqueeSegments.length).toBeLessThanOrEqual(24)
    })

    it("has no empty labels", () => {
        for (const s of workMarqueeSegments) {
            expect(s.trim().length).toBeGreaterThan(0)
        }
    })
})

// ── Client testimonials ─────────────────────────────────────────────────────────

describe("Client testimonials data", () => {
    it("should have at least one testimonial", () => {
        expect(clientTestimonials.length).toBeGreaterThan(0)
    })

    it("should have no duplicate IDs", () => {
        const ids = clientTestimonials.map((t) => t.id)
        expect(new Set(ids).size).toBe(ids.length)
    })

    for (const t of clientTestimonials) {
        describe(`testimonial: ${t.id}`, () => {
            it("has required fields", () => {
                expect(t.quote.length).toBeGreaterThan(20)
                expect(t.name).toBeTruthy()
                expect(t.title).toBeTruthy()
                expect(t.organization).toBeTruthy()
                expect([4, 4.5, 5]).toContain(t.rating)
            })

            it("avatar path is empty or starts with /images/", () => {
                if (t.avatarSrc == null || t.avatarSrc === "") return
                expect(t.avatarSrc.startsWith("/images/")).toBe(true)
            })
        })
    }
})

// ── Consulting clients ──────────────────────────────────────────────────────────

describe("Consulting clients data", () => {
    it("should have at least one client entry", () => {
        expect(consultingClients.length).toBeGreaterThan(0)
    })

    it("should have no duplicate IDs", () => {
        const ids = consultingClients.map((c) => c.id)
        expect(new Set(ids).size).toBe(ids.length)
    })

    for (const c of consultingClients) {
        describe(`consulting client: ${c.id}`, () => {
            it("has required fields", () => {
                expect(c.name).toBeTruthy()
                expect(c.summary).toBeTruthy()
                expect(c.tags.length).toBeGreaterThan(0)
                expect(c.gradient).toBeTruthy()
                expect(c.accent).toBeTruthy()
            })

            it("href is null or a valid http(s) URL", () => {
                if (c.href === null) return
                expect(c.href).toMatch(/^https:\/\//)
            })
        })
    }
})

// ── Publications ───────────────────────────────────────────────────────────────

describe("Publications data", () => {
    it("should have at least one paper", () => {
        expect(papers.length).toBeGreaterThan(0)
    })

    it("should have no duplicate IDs", () => {
        const ids = papers.map((p) => p.id)
        expect(new Set(ids).size).toBe(ids.length)
    })

    for (const paper of papers) {
        describe(`paper: ${paper.id}`, () => {
            it("has required fields", () => {
                expect(paper.title).toBeTruthy()
                expect(paper.year).toBeTruthy()
                expect(paper.venue).toBeTruthy()
                expect(paper.href).toMatch(/^https?:\/\//)
                expect(paper.tags.length).toBeGreaterThan(0)
            })

            it("has exactly 4 insight steps", () => {
                expect(paper.insights).toHaveLength(4)
                for (const step of paper.insights) {
                    expect(step.label).toBeTruthy()
                    expect(step.text).toBeTruthy()
                }
            })
        })
    }
})

// ── Skills ─────────────────────────────────────────────────────────────────────

describe("Skills data", () => {
    it("should have skill categories", () => {
        expect(skillCategories.length).toBeGreaterThan(0)
    })

    it("should have proficiency bars", () => {
        expect(proficiencyBars.length).toBeGreaterThan(0)
    })

    for (const cat of skillCategories) {
        it(`category "${cat.category}" has items`, () => {
            expect(cat.items.length).toBeGreaterThan(0)
        })
    }

    it("should not have duplicate category names", () => {
        const names = skillCategories.map((c) => c.category)
        expect(new Set(names).size).toBe(names.length)
    })
})

// ── Blog posts ─────────────────────────────────────────────────────────────────

describe("Blog posts data", () => {
    it("should have at least one blog post", () => {
        expect(blogPosts.length).toBeGreaterThan(0)
    })

    it("should have no duplicate slugs", () => {
        const slugs = blogPosts.map((p) => p.slug)
        expect(new Set(slugs).size).toBe(slugs.length)
    })

    for (const post of blogPosts) {
        describe(`post: ${post.slug}`, () => {
            it("has required fields", () => {
                expect(post.title).toBeTruthy()
                expect(post.excerpt).toBeTruthy()
                expect(post.date).toBeTruthy()
                expect(post.category).toBeTruthy()
                expect(post.content.length).toBeGreaterThan(100)
                expect(post.tags.length).toBeGreaterThan(0)
            })

            it("has a valid slug (URL-safe)", () => {
                expect(post.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
            })

            it("has a valid date", () => {
                const d = new Date(post.date)
                expect(d.toString()).not.toBe("Invalid Date")
            })

            it("belongs to a known category", () => {
                const knownCategories = BLOG_CATEGORIES.filter((c) => c !== "All")
                expect(knownCategories).toContain(post.category)
            })

            it("is retrievable by slug", () => {
                const found = getPostBySlug(post.slug)
                expect(found).toBeDefined()
                expect(found!.title).toBe(post.title)
            })

            it("has a positive reading time", () => {
                expect(getReadingTime(post.content)).toBeGreaterThan(0)
            })
        })
    }
})

// ── Navigation links ───────────────────────────────────────────────────────────

describe("Navigation links", () => {
    it("should have nav links", () => {
        expect(navLinks.length).toBeGreaterThan(0)
    })

    for (const link of navLinks) {
        it(`"${link.label}" has a valid href`, () => {
            expect(link.href).toBeTruthy()
            expect(link.href).toMatch(/^(#|\/|\/)/)
        })
    }

    it("should not have duplicate labels", () => {
        const labels = navLinks.map((l) => l.label)
        expect(new Set(labels).size).toBe(labels.length)
    })
})
