"use client"

import { PortfolioCard, IconContainer, CardContent, CardHeader, CardTitle } from "@/components/ui/portfolio-card"
import { TechBadge } from "@/components/ui/tech-badge"
import { Button } from "@/components/ui/button"
import { Carousel3D } from "@/components/ui/carousel-3d"
import { ExternalLink, Users, Zap, Shield, GitBranch } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { LazyReveal } from "@/components/ui/lazy-reveal"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import Link from "next/link"
import { animations } from "@/lib/animations"

type Project = {
  title: string
  description: string
  icon: typeof Users | typeof Zap | typeof Shield | typeof GitBranch
  impact: string
  technologies: string[]
  gradient: string
  link?: string
}

const projects: Project[] = [
  {
    title: "Equiverse.ml",
    description:
      "AI-driven platform to improve educational equity, enhancing resource accessibility for over 5,000 underrepresented students through scalable, data-driven solutions.",
    icon: Users,
    impact: "5,000+ students impacted",
    technologies: ["AI/ML", "Python", "Data Analytics", "Educational Technology"],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Flyoneo.ml",
    description:
      "Co-founded startup specializing in AI/ML-driven solutions. Led a team of 8 interns, successfully launching an MVP with over 1,500 active users.",
    icon: Zap,
    impact: "1,500+ active users",
    technologies: ["AI/ML", "Startup", "Team Leadership", "MVP Development"],
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Verizon - Unbiased",
    description:
      "Designed technology solutions to reduce hiring discrimination by 25%, improving diversity and fairness in recruitment pipelines.",
    icon: Shield,
    impact: "25% reduction in hiring bias",
    technologies: ["Machine Learning", "Bias Detection", "HR Technology", "Data Analysis"],
    gradient: "from-teal-500 to-green-500",
  },
  {
    title: "Encrypted File Sharing System",
    description:
      "Built a secure file-sharing system with end-to-end encryption, achieving a 50% increase in data transfer speeds.",
    icon: Shield,
    impact: "50% faster transfers",
    technologies: ["Encryption", "Security", "File Systems", "Performance Optimization"],
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "Gitlet Version Control System",
    description:
      "Implemented a lightweight, efficient Git version control system, reducing commit times by 66% and enhancing performance.",
    icon: GitBranch,
    impact: "66% faster commits",
    technologies: ["Version Control", "Git", "System Design", "Performance"],
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "Pintos Operating System",
    description:
      "Refactored and expanded core OS functionality, achieving a 40% performance improvement through optimized code architecture.",
    icon: Zap,
    impact: "40% performance boost",
    technologies: ["Operating Systems", "C", "System Programming", "Performance Optimization"],
    gradient: "from-pink-500 to-rose-500",
  },
]

function ProjectCard({ project, isActive }: { project: Project; isActive: boolean }) {
  const IconComponent = project.icon

  return (
    <PortfolioCard
      variant="static"
      size="full"
      className="w-full h-full overflow-visible"
    >
      <CardHeader className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <IconContainer 
            gradient={project.gradient}
            size="sm"
            className="h-12 w-12 flex-shrink-0"
          >
            <IconComponent className="h-5 w-5 text-white" />
          </IconContainer>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg text-gray-900 dark:text-white leading-tight mb-1">
              {project.title}
            </CardTitle>
            <div
              className={`text-sm font-bold bg-gradient-to-r ${project.gradient} bg-clip-text text-transparent`}
            >
              {project.impact}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed flex-1">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {project.technologies.slice(0, 4).map((tech, idx) => (
            <TechBadge key={idx} className="px-2 py-1 text-xs">
              {tech}
            </TechBadge>
          ))}
        </div>

        {project.link && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className={`w-full hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white bg-transparent ${animations.allTransition}`}
          >
            <Link href={project.link} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Project
            </Link>
          </Button>
        )}
      </CardContent>
    </PortfolioCard>
  )
}

export function ProjectsCarousel() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const renderProjectCard = (project: Project, index: number, isActive: boolean) => (
    <ProjectCard project={project} isActive={isActive} />
  )

  return (
    <section id="projects" className="py-20 px-4" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <LazyReveal direction="up" duration={500}>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Featured{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Projects
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Innovative solutions that drive impact and create value
            </p>
          </div>
        </LazyReveal>
        {/* If you want cards to lock-in on scroll down, wrap them with ScrollReveal lockOnScrollDown={true} like Publications */}

        <Carousel3D
          items={projects}
          renderCard={renderProjectCard}
        />
      </div>
    </section>
  )
}