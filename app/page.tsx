import dynamic from "next/dynamic"
import Link from "next/link"
import { Navigation } from "@/components/nav"
import { Hero } from "@/components/hero"
import { ProfileIntro, LogoScroll, WorkMarquee } from "@/components/sections"
import { LazySection } from "@/components/layout"
import { SectionSkeleton } from "@/components/ui/skeleton"


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
const Writing = dynamic(() => import("@/components/sections/substack").then(m => m.Writing), {
  loading: () => <SectionSkeleton />,
})
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
 * 1440px wide, rounded UP to 10px: any shortfall is a page-height jump on mount,
 * while a few px of slack is invisible). A short floor is a page-height
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
        <LazySection className="min-h-[730px] md:min-h-[870px]">
          <LiveTerminal />
        </LazySection>
        <LazySection sectionId="ai-expertise" className={`min-h-[2630px] md:min-h-[2180px] ${LAZY_SECTION_TOP}`}>
          <AIExpertise />
        </LazySection>
        <LazySection sectionId="about" className={`min-h-[2190px] md:min-h-[1050px] ${LAZY_SECTION_TOP}`}>
          <About />
        </LazySection>
        <LazySection sectionId="journey" className={`min-h-[3510px] md:min-h-[2590px] ${LAZY_SECTION_TOP}`}>
          <Journey />
        </LazySection>
        <LazySection sectionId="consulting" className={`min-h-[1540px] md:min-h-[1500px] ${LAZY_SECTION_TOP}`}>
          <ConsultingClients />
        </LazySection>
        <WorkMarquee />
        <LazySection sectionId="testimonials" className={`min-h-[810px] md:min-h-[890px] ${LAZY_SECTION_TOP}`}>
          <ClientTestimonials />
        </LazySection>
        <LazySection sectionId="writing" className={`min-h-[760px] md:min-h-[620px] ${LAZY_SECTION_TOP}`}>
          <Writing />
        </LazySection>
        <LazySection
          sectionId="projects"
          className={`min-h-[1660px] md:min-h-[1870px] border-t border-white/[0.06] ${LAZY_SECTION_TOP}`}
        >
          <Projects />
        </LazySection>
        <LazySection sectionId="open-source" className={`min-h-[3600px] md:min-h-[2000px] ${LAZY_SECTION_TOP}`}>
          <OpenSourceShowcase />
        </LazySection>
        <LazySection sectionId="mac-demos" className={`min-h-[850px] md:min-h-[750px] ${LAZY_SECTION_TOP}`}>
          <MacAppDemos />
        </LazySection>
        <LazySection sectionId="skills" className={`min-h-[3410px] md:min-h-[1110px] ${LAZY_SECTION_TOP}`}>
          <Skills />
        </LazySection>
        <LazySection sectionId="github" className={`min-h-[4100px] md:min-h-[2570px] ${LAZY_SECTION_TOP}`}>
          <GitHubStats />
        </LazySection>
        <LazySection sectionId="research" className={`min-h-[2350px] md:min-h-[2400px] ${LAZY_SECTION_TOP}`}>
          <Publications />
        </LazySection>
        <LazySection
          sectionId="contact"
          className={`min-h-[1180px] md:min-h-[800px] ${LAZY_SECTION_TOP}`}
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
            <li><a href="#writing">Writing — essays on Substack about AI and engineering</a></li>
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
