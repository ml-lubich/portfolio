import dynamic from "next/dynamic"
import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/hero"
import { LogoScroll } from "@/components/logo-scroll"
import { LazySection } from "@/components/lazy-section"
import { ProfileIntro } from "@/components/profile-intro"

/* ── Below-fold sections: code-split & deferred ─────────────────────── */
const LiveTerminal = dynamic(() => import("@/components/live-terminal").then(m => m.LiveTerminal))
const AIExpertise = dynamic(() => import("@/components/ai-expertise").then(m => m.AIExpertise))
const About = dynamic(() => import("@/components/about").then(m => m.About))
const Journey = dynamic(() => import("@/components/journey").then(m => m.Journey))
const Projects = dynamic(() => import("@/components/projects").then(m => m.Projects))
const Skills = dynamic(() => import("@/components/skills").then(m => m.Skills))
const Publications = dynamic(() => import("@/components/publications").then(m => m.Publications))
const Contact = dynamic(() => import("@/components/contact").then(m => m.Contact))
const Footer = dynamic(() => import("@/components/footer").then(m => m.Footer))

export default function Home() {
  return (
    <main id="main-content" className="relative min-h-screen bg-background" role="main">
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
        <Publications />
      </LazySection>
      <LazySection minHeight="30vh">
        <Contact />
      </LazySection>
      <Footer />
    </main>
  )
}
