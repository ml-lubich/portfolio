"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Users, Zap, Shield, GitBranch } from "lucide-react"
import { useInView } from "react-intersection-observer"
import Link from "next/link"
import { Carousel3D } from "./carousel-3d"

interface Project {
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
    title: "Open Source Contributions",
    description:
      "Active contributor to various open-source projects, focusing on performance optimization and developer experience improvements.",
    icon: GitBranch,
    impact: "Multiple repositories enhanced",
    technologies: ["Open Source", "Performance", "Developer Experience", "Community"],
    gradient: "from-orange-500 to-red-500",
  },
]

export function ProjectsCarousel() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const renderProject = (project: Project, index: number, isActive: boolean) => {
    const IconComponent = project.icon
    return (
      <Card className="h-full group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-3 mb-3">
            <div
              className={`p-3 rounded-xl bg-gradient-to-r ${project.gradient} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
            >
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg lg:text-xl text-gray-900 dark:text-white leading-tight">
                {project.title}
              </CardTitle>
              <div
                className={`text-sm font-bold bg-gradient-to-r ${project.gradient} bg-clip-text text-transparent mt-1`}
              >
                {project.impact}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col pt-0">
          <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1 leading-relaxed text-sm">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.technologies.map((tech, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-xs bg-gray-100 dark:bg-slate-700 hover:scale-105 transition-transform duration-200 px-2 py-1"
              >
                {tech}
              </Badge>
            ))}
          </div>

          {project.link && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white transition-all duration-300 bg-transparent"
            >
              <Link href={project.link} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Project
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <section ref={ref} className="py-20 bg-white dark:bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Featured{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Projects
            </span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Innovative solutions with measurable impact and real-world applications
          </p>
        </div>

        <Carousel3D
          items={projects}
          renderItem={renderProject}
          itemsPerView={{
            mobile: 1,
            tablet: 2,
            desktop: 3
          }}
          spacing={24}
          autoPlay={true}
          autoPlayInterval={6000}
          className="max-w-6xl mx-auto"
        />
      </div>
    </section>
  )
}
