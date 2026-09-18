/* Free first, then a cheap paid backstop. Each entry is a different lab, so
 * one provider being down, rate-limited or retired does not take the bot with
 * it; `fetchWithFallback` in app/api/chat/route.ts walks the list on any
 * non-2xx.
 *
 * This order REVERSES an earlier one, deliberately, so the tradeoff is on the
 * record. The previous cascade was paid-first on measured first-token latency
 * (ling-3.0-flash 0.77s, glm-4.7-flash 1.45s, qwen3.7-flash 1.69s, free
 * 2.39s) — free models are the slow ones and spend budget on reasoning tokens
 * before emitting an answer. Free-first is the owner's call: the running cost
 * of a portfolio chat should be zero by default, and a free tier that 429s
 * costs one failed round-trip before the paid net catches it. So the panel is
 * slower to first token than it was, and free.
 *
 * The paid backstop is chosen for DURABILITY, not for being cheapest today.
 * All three are open-weight models served by many providers, so a single
 * host withdrawing does not retire the slug — which is exactly how the old
 * last-resort net died (OpenRouter retired `openai/gpt-oss-20b:free` and it
 * began 404ing with "This model is unavailable for free").
 * __tests__/ai-model-slugs.test.ts asserts every slug here still exists
 * upstream and advertises tools, so a retirement fails a test, not production.
 *
 * Every entry is verified for BOTH tool calling and clean output. Models that
 * stream chain-of-thought as ordinary content (nemotron-3.5-lightning,
 * nemotron-3-super-120b) leak the system prompt into the panel and are
 * excluded regardless of capability — reasoning.exclude does not stop them.
 * `nex-agi/nex-n2.5-pro:free` is excluded for worse: asked for the resume it
 * answered "it is on screen and ready to download" without calling the tool,
 * so nothing was on screen. A model that fabricates the result of a lookup is
 * more dangerous than a slow one.
 *
 * Lives outside app/api/chat/route.ts (a Next.js route file can only export
 * HTTP handlers and a small fixed set of config names) so /status can import
 * the same list instead of duplicating it. */
export const MODELS = [
    "inclusionai/ling-3.0-flash-vl:free",
    "cohere/north-mini-code:free",
    "nex-agi/nex-n2.5-mini:free",
    "mistralai/mistral-nemo",
    "openai/gpt-oss-20b",
    "meta-llama/llama-3.1-8b-instruct",
] as const
