import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/hero"
import { AIExpertise } from "@/components/ai-expertise"
import { About } from "@/components/about"
import { Journey } from "@/components/journey"
import { Projects } from "@/components/projects"
import { Skills } from "@/components/skills"
import { Publications } from "@/components/publications"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"
import { StackingSections } from "@/components/stacking-sections"

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navigation />
      <Hero />
      {/* Hen-ry.com–style stacking sections */}
      <StackingSections stickyTop={70} stackGap={10}>
        <AIExpertise />
        <About />
        <Journey />
        <Projects />
        <Skills />
        <Publications />
        <Contact />
      </StackingSections>
      <Footer />
    </main>
  )
}
