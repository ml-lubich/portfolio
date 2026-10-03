import { LATEST_POST, SUBSTACK_URL, type SubstackPost } from "./substack"

export const SUBSTACK_FEED_URL = `${SUBSTACK_URL}/feed`

const unwrap = (s: string) =>
  s.replace(/^\s*<!\[CDATA\[/, "").replace(/\]\]>\s*$/, "").trim()

const tag = (item: string, name: string) =>
  unwrap(item.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1] ?? "")

/** Parse Substack RSS into posts, newest first (feed order). Items missing a
 *  title or link are dropped. */
export function parseSubstackFeed(xml: string, limit = 12): SubstackPost[] {
  const posts: SubstackPost[] = []
  for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const title = tag(item, "title")
    const url = tag(item, "link")
    if (!title || !url) continue
    const d = new Date(tag(item, "pubDate"))
    posts.push({
      title,
      url,
      description: tag(item, "description"),
      date: Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10),
    })
    if (posts.length >= limit) break
  }
  return posts
}

/** Live feed, cached an hour. Substack down → the hand-kept LATEST_POST, logged. */
export async function getSubstackPosts(): Promise<SubstackPost[]> {
  try {
    const res = await fetch(SUBSTACK_FEED_URL, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const posts = parseSubstackFeed(await res.text())
    if (posts.length) return posts
    throw new Error("feed had no items")
  } catch (err) {
    console.error(`substack feed ${SUBSTACK_FEED_URL} failed, using LATEST_POST:`, err)
    return [LATEST_POST]
  }
}
