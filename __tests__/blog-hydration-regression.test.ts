import fs from "node:fs"
import path from "node:path"
import { createElement, type AnchorHTMLAttributes, type ImgHTMLAttributes, type ReactNode } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { BlogCard } from "@/components/blog/blog-card"
import { formatBlogDate } from "@/lib/blog-shared"
import type { BlogPostListItem } from "@/lib/blog-shared"

interface MockLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string | { toString(): string }
  children?: ReactNode
  prefetch?: boolean
}

interface MockImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string | { src: string }
  fill?: boolean
  priority?: boolean
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    prefetch: () => undefined,
    push: () => undefined,
  }),
}))

vi.mock("next/link", async () => {
  const React = await vi.importActual<typeof import("react")>("react")
  return {
    default: ({ href, children, prefetch: _prefetch, ...props }: MockLinkProps) =>
      React.createElement("a", { ...props, href: href.toString() }, children),
  }
})

vi.mock("next/image", async () => {
  const React = await vi.importActual<typeof import("react")>("react")
  return {
    default: ({ src, alt, fill: _fill, priority: _priority, ...props }: MockImageProps) => {
      const resolvedSrc = typeof src === "string" ? src : src.src
      return React.createElement("img", { ...props, src: resolvedSrc, alt: alt ?? "" })
    },
  }
})

const ROOT = path.resolve(__dirname, "..")

const timezoneRegressionPost: BlogPostListItem = {
  slug: "timezone-regression",
  title: "Timezone Regression",
  excerpt: "A date-only post that must render the same text in every server timezone.",
  date: "2026-04-06",
  category: "AI Architecture",
  tags: ["hydration"],
  coverImage: "/og-image.png",
  views: "1k",
  readingTime: 3,
}

function renderBlogCardWithTimezone(timezone: string): string {
  const previousTimezone = process.env.TZ
  process.env.TZ = timezone
  try {
    return renderToString(createElement(BlogCard, { post: timezoneRegressionPost }))
  } finally {
    if (previousTimezone === undefined) {
      delete process.env.TZ
    } else {
      process.env.TZ = previousTimezone
    }
  }
}

describe("blog hydration regressions", () => {
  it("formats date-only blog dates in UTC so server and browser text match", () => {
    expect(formatBlogDate("2026-05-05")).toBe("May 5, 2026")
    expect(formatBlogDate("2026-05-05T00:00:00.000Z")).toBe("May 5, 2026")
  })

  it("renders blog card date text identically across server timezones", () => {
    const utcHtml = renderBlogCardWithTimezone("UTC")
    const pacificHtml = renderBlogCardWithTimezone("America/Los_Angeles")

    expect(utcHtml).toContain("April 6, 2026")
    expect(pacificHtml).toBe(utcHtml)
  })

  it("keeps blog render paths on the shared deterministic date formatter", () => {
    const renderFiles = [
      "app/blog/page.tsx",
      "app/blog/[slug]/blog-post-view.tsx",
      "components/blog/blog-card.tsx",
    ]

    for (const renderFile of renderFiles) {
      const source = fs.readFileSync(path.join(ROOT, renderFile), "utf8")
      expect(source, renderFile).toContain("formatBlogDate")
      expect(source, renderFile).not.toContain("toLocaleDateString")
    }
  })

  it("points the shared blog author avatar at an existing public image", () => {
    const publicPath = path.join(ROOT, "public", "profile_blog.png")
    expect(fs.existsSync(publicPath)).toBe(true)
  })
})