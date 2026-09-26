import { ArrowUpRight, BookOpen, Github, Linkedin } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ComponentType } from "react"
import { AnimatedSection } from "../animations/animated-section"
import { SectionHeader } from "../layout/section-header"
import { XIcon } from "../social-icons"
import { SUBSTACK_SUBSCRIBE_URL } from "@/lib/substack"

/** One entry per platform. Adding a new one (e.g. YouTube later) is one
 *  object in this array — the grid below just maps over it. */
interface FollowCard {
  id: string
  icon: LucideIcon | ComponentType<{ className?: string }>
  name: string
  description: string
  actionLabel: string
  actionHref: string
  profileHref: string
}

const FOLLOW_CARDS: FollowCard[] = [
  {
    id: "x",
    icon: XIcon,
    name: "@Machine_Lubich",
    description: "Short takes on AI agents and engineering.",
    actionLabel: "Follow",
    actionHref: "https://x.com/intent/follow?screen_name=Machine_Lubich",
    profileHref: "https://x.com/Machine_Lubich",
  },
  {
    id: "linkedin",
    icon: Linkedin,
    name: "Misha Lubich",
    description: "Staff AI Engineer — posts and professional updates.",
    actionLabel: "Connect",
    actionHref: "https://www.linkedin.com/in/misha-lubich/",
    profileHref: "https://www.linkedin.com/in/misha-lubich/",
  },
  {
    id: "substack",
    icon: BookOpen,
    name: "@mlubich",
    description: "Essays on AI, engineering, and production ML.",
    actionLabel: "Subscribe",
    actionHref: SUBSTACK_SUBSCRIBE_URL,
    profileHref: "https://substack.com/@mlubich",
  },
  {
    id: "github",
    icon: Github,
    name: "@ml-lubich",
    description: "Open-source projects, tools, and experiments.",
    actionLabel: "Follow",
    actionHref: "https://github.com/ml-lubich",
    profileHref: "https://github.com/ml-lubich",
  },
]

/** Standalone "find me online" section — one card per platform, no live
 *  feed embeds (X's logged-out timeline is unreliable, LinkedIn has no
 *  public feed embed). Each card links out to the real profile. */
export function Follow() {
  return (
    <AnimatedSection id="follow" className="py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        <SectionHeader
          label="Follow"
          title={
            <>
              Find me <span className="gradient-text">online</span>
            </>
          }
          subtitle="Where to follow along — short-form notes, essays, and the work itself."
          compact
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {FOLLOW_CARDS.map((card) => (
            <div
              key={card.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-foreground">
                  <card.icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <a
                    href={card.profileHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm font-medium text-foreground hover:text-primary"
                  >
                    {card.name}
                  </a>
                </div>
              </div>

              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                {card.description}
              </p>

              <a
                href={card.actionHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/[0.12] px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
              >
                {card.actionLabel} <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
