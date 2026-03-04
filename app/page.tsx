import dynamic from "next/dynamic"
import { Navigation } from "@/components/nav"
import { Hero } from "@/components/hero"
import { LogoScroll, ProfileIntro } from "@/components/sections"
import { LazySection } from "@/components/layout"

/* ── Below-fold sections: code-split & deferred ─────────────────────── */
const LiveTerminal = dynamic(() => import("@/components/terminal").then(m => m.LiveTerminal))
const AIExpertise = dynamic(() => import("@/components/sections/ai-expertise").then(m => m.AIExpertise))
const About = dynamic(() => import("@/components/sections/about").then(m => m.About))
const Journey = dynamic(() => import("@/components/sections/journey").then(m => m.Journey))
const Projects = dynamic(() => import("@/components/sections/projects").then(m => m.Projects))
const Skills = dynamic(() => import("@/components/sections/skills").then(m => m.Skills))
const GitHubStats = dynamic(() => import("@/components/sections/github-stats").then(m => m.GitHubStats))
const Publications = dynamic(() => import("@/components/sections/publications").then(m => m.Publications))
const Contact = dynamic(() => import("@/components/sections/contact").then(m => m.Contact))
const Footer = dynamic(() => import("@/components/sections/footer").then(m => m.Footer))

export default function Home() {
  return (
    <main id="main-content" className="relative min-h-screen max-w-full bg-background" role="main">
      <Navigation />
      <Hero />
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
    </main>
  )
}
