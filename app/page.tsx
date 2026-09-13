import dynamic from "next/dynamic"
import Link from "next/link"
import { Navigation } from "@/components/nav"
import { Hero } from "@/components/hero"
import { ProfileIntro, LogoScroll, WorkMarquee } from "@/components/sections"
import { LazySection } from "@/components/layout"

/* ── Skeleton placeholder while chunks load ─────────────────────────────
 *  Deliberately empty. A spinner here fires for a chunk that is loading
 *  400px+ below the fold — the reader never sees it resolve, only the flash
 *  as it is replaced. The div exists purely to hold the height its
 *  `LazySection` already reserved, so the swap moves nothing.
 * ─────────────────────────────────────────────────────────────────────── */
function SectionSkeleton({ height = "30vh" }: { height?: string }) {
  return <div style={{ minHeight: height }} aria-hidden="true" />
}

/* ── Below-fold sections: code-split & deferred ─────────────────────── */
const LiveTerminal = dynamic(() => import("@/components/terminal").then(m => m.LiveTerminal), {
  loading: () => <SectionSkeleton height="36vh" />,
})
const AIExpertise = dynamic(() => import("@/components/sections/ai-expertise").then(m => m.AIExpertise), {
  loading: () => <SectionSkeleton />,
})
const About = dynamic(() => import("@/components/sections/about").then(m => m.About), {
  loading: () => <SectionSkeleton />,
})
const Journey = dynamic(() => import("@/components/sections/journey").then(m => m.Journey), {
  loading: () => <SectionSkeleton />,
})
const ConsultingClients = dynamic(
  () => import("@/components/sections/consulting-clients").then(m => m.ConsultingClients),
  { loading: () => <SectionSkeleton /> },
)
const ClientTestimonials = dynamic(
  () => import("@/components/sections/client-testimonials").then(m => m.ClientTestimonials),
  { loading: () => <SectionSkeleton /> },
)
const Projects = dynamic(() => import("@/components/sections/projects").then(m => m.Projects), {
  loading: () => <SectionSkeleton />,
})
const MacAppDemos = dynamic(
  () => import("@/components/sections/mac-app-demos").then(m => m.MacAppDemos),
  { loading: () => <SectionSkeleton /> },
)
const OpenSourceShowcase = dynamic(
  () => import("@/components/sections/open-source-showcase").then(m => m.OpenSourceShowcase),
  { loading: () => <SectionSkeleton /> },
)
const Skills = dynamic(() => import("@/components/sections/skills").then(m => m.Skills), {
  loading: () => <SectionSkeleton />,
})
const GitHubStats = dynamic(() => import("@/components/sections/github-stats").then(m => m.GitHubStats), {
  loading: () => <SectionSkeleton height="30vh" />,
})
const Publications = dynamic(() => import("@/components/sections/publications").then(m => m.Publications), {
  loading: () => <SectionSkeleton />,
})
const Contact = dynamic(() => import("@/components/sections/contact").then(m => m.Contact), {
  loading: () => <SectionSkeleton height="30vh" />,
})
const Footer = dynamic(() => import("@/components/sections/footer").then(m => m.Footer), {
  loading: () => <SectionSkeleton height="10vh" />,
})
/* Each LazySection reserves a floor close to its real height per viewport
 * (`min-h-[phone] md:min-h-[desktop]`: the mounted WRAPPER's height — padding
 * and child margins included, not just the <section> — measured at 393px and
 * 1440px wide, then trimmed 2% so a slightly-shorter render never leaves a gap). A short floor is a page-height
 * jump on mount; before these, every section reserved 320px and the page grew
 * 16k px (desktop) / 24k px (phone) as the reader scrolled, which Safari —
 * no scroll anchoring — shows as the page scrolling by itself. Literal
 * utilities only: Tailwind drops arbitrary values it can't see verbatim.
 * Re-measure with `scratchpad/diag/lazy-heights.mjs`-style scripts when a
 * section changes size. */
/** Shared top rhythm for every LazySection boundary — keep this the single spacing knob. */
const LAZY_SECTION_TOP = "pt-4 md:pt-8 lg:pt-10"

export default function Home() {
  return (
    <>
      {/* Outside <main> so fixed nav + mobile overlay stack above hero/WebGL (main is z-10). */}
      <Navigation />
      <main id="main-content" className="relative z-10 min-h-screen max-w-full" role="main">
      <Hero />

      {/* Below hero: solid page bg. Rainbow orbs render only inside <Hero> (not fixed), so fast scroll doesn’t drag a full-viewport effect. */}
      <div className="page-texture relative bg-background">
        <LogoScroll />

        <ProfileIntro />
        <LazySection className="min-h-[710px] md:min-h-[840px]">
          <LiveTerminal />
        </LazySection>
        <LazySection sectionId="ai-expertise" className={`min-h-[2540px] md:min-h-[2120px] ${LAZY_SECTION_TOP}`}>
          <AIExpertise />
        </LazySection>
        <LazySection sectionId="about" className={`min-h-[2840px] md:min-h-[1420px] ${LAZY_SECTION_TOP}`}>
          <About />
        </LazySection>
        <LazySection sectionId="journey" className={`min-h-[3430px] md:min-h-[2530px] ${LAZY_SECTION_TOP}`}>
          <Journey />
        </LazySection>
        <LazySection sectionId="consulting" className={`min-h-[1500px] md:min-h-[1460px] ${LAZY_SECTION_TOP}`}>
          <ConsultingClients />
        </LazySection>
        <WorkMarquee />
        <LazySection sectionId="testimonials" className={`min-h-[790px] md:min-h-[860px] ${LAZY_SECTION_TOP}`}>
          <ClientTestimonials />
        </LazySection>
        <LazySection
          sectionId="projects"
          className={`min-h-[1620px] md:min-h-[1830px] border-t border-white/[0.06] ${LAZY_SECTION_TOP}`}
        >
          <Projects />
        </LazySection>
        <LazySection sectionId="open-source" className={`min-h-[1320px] md:min-h-[1030px] ${LAZY_SECTION_TOP}`}>
          <OpenSourceShowcase />
        </LazySection>
        <LazySection sectionId="mac-demos" className={`min-h-[830px] md:min-h-[720px] ${LAZY_SECTION_TOP}`}>
          <MacAppDemos />
        </LazySection>
        <LazySection sectionId="skills" className={`min-h-[3330px] md:min-h-[1080px] ${LAZY_SECTION_TOP}`}>
          <Skills />
        </LazySection>
        <LazySection sectionId="github" className={`min-h-[4010px] md:min-h-[2510px] ${LAZY_SECTION_TOP}`}>
          <GitHubStats />
        </LazySection>
        <LazySection sectionId="research" className={`min-h-[2290px] md:min-h-[2350px] ${LAZY_SECTION_TOP}`}>
          <Publications />
        </LazySection>
        <LazySection
          sectionId="contact"
          className={`min-h-[1150px] md:min-h-[770px] ${LAZY_SECTION_TOP}`}
        >
          <Contact />
        </LazySection>
        <Footer />
      </div>

      {/* ── Server-rendered SEO content ──────────────────────────────
       *  Visually hidden but crawlable text providing Google with
       *  a text-rich summary of the portfolio sections. This ensures
       *  the dynamically-loaded sections still contribute to indexing.
       * ─────────────────────────────────────────────────────────────── */}
      <section className="sr-only" aria-label="Portfolio summary for search engines">
        <h2>Misha Lubich — Staff AI Engineer</h2>
        <p>
          Misha Lubich is a Staff AI Engineer at EchoStar with production
          experience at Apple, GitHub, Walmart, and Lawrence Berkeley
          National Lab. Specializing in machine learning, MLOps, large language models (LLMs),
          deep learning, natural language processing, computer vision, and full-stack
          software development.
        </p>
        <nav aria-label="Portfolio sections">
          <h3>Portfolio Sections</h3>
          <ul>
            <li><a href="#about">About Misha Lubich</a></li>
            <li><a href="#projects">AI & ML Projects</a></li>
            <li><a href="#skills">Technical Skills — Python, TypeScript, React, PyTorch, TensorFlow</a></li>
            <li><a href="#journey">Professional Experience — Apple, GitHub, Walmart</a></li>
            <li><a href="#consulting">Consulting — client sites and engagements</a></li>
            <li><a href="#testimonials">Client feedback — past consulting engagements</a></li>
            <li><a href="#research">Research Publications</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><Link href="/blog">AI Engineering Blog — Perspectives on LLMs, MLOps & Production ML</Link></li>
          </ul>
        </nav>
      </section>
      </main>
    </>
  )
}
