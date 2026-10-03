import { describe, it, expect } from "vitest"
import { parseSubstackFeed } from "@/lib/substack-feed"

const item = (t: string, l: string, d = "Wed, 24 Sep 2026 10:00:00 GMT") =>
  `<item><title><![CDATA[${t}]]></title><description><![CDATA[sum]]></description><link>${l}</link><pubDate>${d}</pubDate></item>`

describe("parseSubstackFeed", () => {
  it("parses CDATA titles, links and ISO dates in feed order", () => {
    const posts = parseSubstackFeed(`<channel>${item("A & B", "https://x/p/a")}${item("C", "https://x/p/c")}</channel>`)
    expect(posts.map((p) => p.title)).toEqual(["A & B", "C"])
    expect(posts[0]).toMatchObject({ url: "https://x/p/a", date: "2026-09-24", description: "sum" })
  })
  it("drops items missing title or link, and bad dates become empty", () => {
    const xml = `${item("", "https://x/p/a")}${item("T", "")}${item("Ok", "https://x/p/ok", "nope")}`
    expect(parseSubstackFeed(xml)).toEqual([{ title: "Ok", url: "https://x/p/ok", description: "sum", date: "" }])
  })
  it("respects the limit and handles empty/invalid input", () => {
    expect(parseSubstackFeed(item("1", "u") + item("2", "u"), 1)).toHaveLength(1)
    expect(parseSubstackFeed("")).toEqual([])
    expect(parseSubstackFeed("<html>not rss</html>")).toEqual([])
  })
})
