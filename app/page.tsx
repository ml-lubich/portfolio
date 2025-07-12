import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { ExperienceCarousel } from "@/components/experience-carousel"
import { ProjectsCarousel } from "@/components/projects-carousel"
import { Skills } from "@/components/skills"
import { Publications } from "@/components/publications"
import { Contact } from "@/components/contact"
import { Navigation } from "@/components/navigation"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 transition-colors duration-500">
      <Navigation />
      <Hero />
      <About />
      <ExperienceCarousel />
      <ProjectsCarousel />
      <Skills />
      <Publications />
      <Contact />
    </main>
  )
}
