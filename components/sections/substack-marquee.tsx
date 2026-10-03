import { getSubstackPosts } from "@/lib/substack-feed"
import { SUBSTACK_URL } from "@/lib/substack"

/** Scrolling band of Substack post titles from the live RSS feed (server
 *  component; CSS-only marquee from globals.css, pauses on hover/focus,
 *  plain scroller under prefers-reduced-motion). */
export async function SubstackMarquee() {
  const posts = await getSubstackPosts()
  // Repeat short feeds so one half of the track always overfills the viewport.
  const set = Array.from({ length: Math.max(1, Math.ceil(8 / posts.length)) }, () => posts).flat()
  const items = (hidden: boolean) =>
    set.map((p, i) => (
      <a
        key={`${hidden ? "b" : "a"}${i}`}
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={hidden ? -1 : undefined}
        className="mr-10 whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70 transition-colors hover:text-primary sm:text-xs"
      >
        {p.date && <span className="mr-2 text-muted-foreground/40">{p.date}</span>}
        {p.title}
      </a>
    ))

  return (
    <div
      className="work-marquee-band relative border-y border-[var(--line-soft)] bg-[var(--band-fill)] py-3 sm:py-3.5"
      aria-label="Latest essays from my Substack"
    >
      <a
        href={SUBSTACK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-2 block text-center text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground/60 hover:text-primary"
      >
        Latest on Substack
      </a>
      <div className="marquee-row marquee-viewport">
        <div
          className="marquee-track marquee-track--ltr"
          style={{ ["--marquee-duration" as string]: `${Math.max(30, set.length * 6)}s` }}
        >
          <div className="flex shrink-0" >{items(false)}</div>
          <div className="flex shrink-0" aria-hidden="true">{items(true)}</div>
        </div>
      </div>
    </div>
  )
}
