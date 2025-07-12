"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ExternalLink, Users, Zap, Shield, GitBranch } from "lucide-react"
import { useInView } from "react-intersection-observer"
import Link from "next/link"

const projects = [
  {
    title: "Equiverse.ml",
    description:
      "AI-driven platform to improve educational equity, enhancing resource accessibility for over 5,000 underrepresented students through scalable, data-driven solutions.",
    icon: Users,
    impact: "5,000+ students impacted",
    technologies: ["AI/ML", "Python", "Data Analytics", "Educational Technology"],
    link: "https://equiverse.ml",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Flyoneo.ml",
    description:
      "Co-founded startup specializing in AI/ML-driven solutions. Led a team of 8 interns, successfully launching an MVP with over 1,500 active users.",
    icon: Zap,
    impact: "1,500+ active users",
    technologies: ["AI/ML", "Startup", "Team Leadership", "MVP Development"],
    link: "https://flyoneo.ml",
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

export function ProjectsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const itemsPerView = 3
  const maxIndex = Math.max(0, projects.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  return (
    <section id="projects" className="py-20 px-4" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Featured{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Projects</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Innovative solutions with measurable impact and real-world applications
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out gap-6"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
            >
              {projects.map((project, index) => {
                const IconComponent = project.icon
                return (
                  <div key={index} className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0">
                    <Card className="h-full group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`p-3 rounded-xl bg-gradient-to-r ${project.gradient} group-hover:scale-110 transition-transform duration-300`}
                          >
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <CardTitle className="text-xl text-gray-900 dark:text-white">{project.title}</CardTitle>
                        </div>
                        <div
                          className={`text-sm font-bold bg-gradient-to-r ${project.gradient} bg-clip-text text-transparent`}
                        >
                          {project.impact}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1 leading-relaxed">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.map((tech, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs bg-gray-100 dark:bg-slate-700 hover:scale-105 transition-transform duration-200"
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
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="rounded-full hover:scale-110 transition-all duration-200 disabled:opacity-50 bg-transparent"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex space-x-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 scale-125"
                      : "bg-gray-300 dark:bg-gray-600 hover:scale-110"
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={nextSlide}
              disabled={currentIndex === maxIndex}
              className="rounded-full hover:scale-110 transition-all duration-200 disabled:opacity-50 bg-transparent"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
