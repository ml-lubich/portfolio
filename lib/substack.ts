/**
 * Substack publication — a hand-maintained pointer, not a live feed.
 *
 * One post exists today. A fetch/parse/cache layer for an RSS feed is a lot
 * of surface for "link the latest post" — Misha updates this constant when
 * he publishes again.
 */

export const SUBSTACK_URL = "https://mlubich.substack.com"
export const SUBSTACK_SUBSCRIBE_URL = `${SUBSTACK_URL}/subscribe`

export interface SubstackPost {
  title: string
  url: string
  description: string
  date: string
}

export const LATEST_POST: SubstackPost = {
  title: "The Craft Did Not Die, It Got Repriced",
  url: `${SUBSTACK_URL}/p/the-craft-did-not-die-it-got-repriced`,
  description:
    "AI code generation commoditized syntax work; the craft now lives in state design, hardware understanding, and architectural restraint.",
  date: "2026-09-24",
}
