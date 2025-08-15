"use client"

import { PortfolioCard, IconContainer, CardContent, CardHeader, CardTitle } from "@/components/ui/portfolio-card"
import { TechBadge } from "@/components/ui/tech-badge"
import { Button } from "@/components/ui/button"
import { Carousel3D } from "@/components/ui/carousel-3d"
import { ExternalLink } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { CardReveal } from "@/components/ui/unified-reveal"
import { SectionWrapper } from "@/components/ui/section-wrapper"
import { SectionHeader } from "@/components/ui/section-header"
import Link from "next/link"
import { animations } from "@/lib/animations"
import { projects, type Project } from "@/lib/data"

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
    <SectionWrapper id="projects" maxWidth="7xl" delay={175} ref={ref}>
      <SectionHeader 
        title="Featured"
        subtitle="Projects"
        description="Innovative solutions that drive impact and create value"
      />

      <CardReveal delay={250}>
        <Carousel3D
          items={projects}
          renderCard={renderProjectCard}
        />
      </CardReveal>
    </SectionWrapper>
  )
}