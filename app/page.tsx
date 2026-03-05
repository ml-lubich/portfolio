import dynamic from "next/dynamic"
import Link from "next/link"
import { Navigation } from "@/components/nav"
import { Hero } from "@/components/hero"
import { LogoScroll, ProfileIntro } from "@/components/sections"
import { LazySection } from "@/components/layout"

/* ── Skeleton placeholder while chunks load ─────────────────────────── */
function SectionSkeleton({ height = "40vh" }: { height?: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: height }}
      aria-hidden="true"
    >
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground/60" />
    </div>
  )
}

/* ── Below-fold sections: code-split & deferred ─────────────────────── */
const LiveTerminal = dynamic(() => import("@/components/terminal").then(m => m.LiveTerminal), {
  loading: () => <SectionSkeleton height="50vh" />,
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
const Projects = dynamic(() => import("@/components/sections/projects").then(m => m.Projects), {
  loading: () => <SectionSkeleton />,
})
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

export default function Home() {
  return (
    <main id="main-content" className="relative z-10 min-h-screen max-w-full" role="main">
      <Navigation />
      <Hero />

      {/* ── Dark scrim below hero ────────────────────────────────────
       *  Dims the fixed BackgroundOrbs behind all below-fold content
       *  so text is crisp & readable — cursor.com-style dark sections
       *  with just a whisper of colour bleeding through.
       *  The gradient fades from transparent → dark over 120px, then
       *  holds solid for the rest of the page.
       * ─────────────────────────────────────────────────────────────── */}
      <div
        className="relative"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, hsl(220 20% 4% / 0.88) 120px)",
        }}
      >
        <LogoScroll />

        {/* Each LazySection defers rendering until near viewport,
            preventing 6+ WebGL canvases from booting at once */}
        <LazySection>
          <LiveTerminal />
        </LazySection>
        <ProfileIntro />
        <LazySection>
          <AIExpertise />
        </LazySection>
        <LazySection>
          <About />
        </LazySection>
        <LazySection>
          <Journey />
        </LazySection>
        <LazySection>
          <Projects />
        </LazySection>
        <LazySection>
          <Skills />
        </LazySection>
        <LazySection>
          <GitHubStats />
        </LazySection>
        <LazySection>
          <Publications />
        </LazySection>
        <LazySection minHeight="30vh">
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
        <h2>Misha Lubich — Senior AI Engineer & Technical Leader</h2>
        <p>
          Misha Lubich is a Senior AI Engineer and Technical Leader with production
          experience at Apple, GitHub, Braintrust Data, Walmart, and Lawrence Berkeley
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
            <li><a href="#journey">Professional Experience — Apple, GitHub, Braintrust Data</a></li>
            <li><a href="#research">Research Publications</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><Link href="/blog">AI Engineering Blog — Perspectives on LLMs, MLOps & Production ML</Link></li>
          </ul>
        </nav>
      </section>
    </main>
  )
}
