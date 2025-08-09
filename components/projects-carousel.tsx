"use client"

import { useState, useEffect, useRef } from "react"
import { PortfolioCard, IconContainer, CardContent, CardHeader, CardTitle } from "@/components/ui/portfolio-card"
import { TechBadge } from "@/components/ui/tech-badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ExternalLink, Users, Zap, Shield, GitBranch } from "lucide-react"
import { useInView } from "react-intersection-observer"
import Link from "next/link"

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

export function ProjectsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchOffset, setTouchOffset] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  // Responsive items per view
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setItemsPerView(1) // Mobile: 1 item
      } else if (width < 1024) {
        setItemsPerView(2) // Tablet: 2 items
      } else {
        setItemsPerView(3) // Desktop: 3 items
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Reset current index when items per view changes
  useEffect(() => {
    const maxIndex = Math.max(0, projects.length - itemsPerView)
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex)
    }
  }, [itemsPerView, currentIndex])

  const maxIndex = Math.max(0, projects.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(projects.length / itemsPerView))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(projects.length / itemsPerView)) % Math.ceil(projects.length / itemsPerView))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchOffset(e.touches[0].clientX - touchStart)
  }

  const handleTouchEnd = () => {
    if (!touchStart) return
    
    const distance = touchStart - touchOffset
    const threshold = 50

    if (distance > threshold) {
      nextSlide()
    } else if (distance < -threshold) {
      prevSlide()
    }
  }

  return (
    <section id="projects" className="py-20 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Featured{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Projects
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Innovative solutions that drive impact and create value
          </p>
        </div>

        <div className="relative">
          {/* Desktop Navigation */}
          <div className="hidden md:flex justify-between items-center mb-6">
            <Button
              variant="outline"
              size="lg"
              onClick={prevSlide}
              className="p-3 hover:scale-105 transition-transform duration-100"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="flex space-x-2">
              {Array.from({ length: Math.ceil(projects.length / itemsPerView) }).map((_, index) => (
                                 <button
                   key={index}
                   onClick={() => goToSlide(index)}
                   className={`w-3 h-3 rounded-full transition-all duration-300 ${
                     index === currentIndex ? "bg-blue-600 scale-125" : "bg-gray-300 hover:bg-gray-400"
                   }`}
                   aria-label={`Go to slide ${index + 1}`}
                 />
              ))}
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={nextSlide}
              className="p-3 hover:scale-105 transition-transform duration-100"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Carousel Container */}
                      <div 
              className="overflow-hidden rounded-2xl"
              ref={containerRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%) translateX(${dragOffset + touchOffset}px)`,
              }}
            >
              {projects.map((project, index) => {
                const IconComponent = project.icon
                return (
                  <div 
                    key={index} 
                    className={`w-full ${itemsPerView === 1 ? "px-2" : itemsPerView === 2 ? "md:w-1/2 px-2" : "md:w-1/3 px-2"} flex-shrink-0`}
                  >
                    <PortfolioCard
                      variant="carousel"
                      size="full"
                      className="group"
                    >
                      <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                        <div className="flex items-start gap-3 mb-3">
                          <IconContainer 
                            gradient={project.gradient}
                            size="sm"
                            className="sm:h-16 sm:w-16 sm:p-3"
                          >
                            <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </IconContainer>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base sm:text-lg text-gray-900 dark:text-white leading-tight mb-1">
                              {project.title}
                            </CardTitle>
                            <div
                              className={`text-xs sm:text-sm font-bold bg-gradient-to-r ${project.gradient} bg-clip-text text-transparent`}
                            >
                              {project.impact}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col pt-0 p-4 sm:p-6">
                        <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1 leading-relaxed text-sm sm:text-base">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-4">
                          {project.technologies.map((tech, idx) => (
                            <TechBadge key={idx} className="px-2 py-1">
                              {tech}
                            </TechBadge>
                          ))}
                        </div>

                        {project.link && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white transition-all duration-100 bg-transparent"
                          >
                            <Link href={project.link} target="_blank">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Project
                            </Link>
                          </Button>
                        )}
                      </CardContent>
                    </PortfolioCard>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mobile navigation buttons */}
          <div className="md:hidden flex justify-center items-center mt-6 gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              className="p-2 hover:scale-105 transition-transform duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex space-x-2">
              {Array.from({ length: Math.ceil(projects.length / itemsPerView) }).map((_, index) => (
                <button
                  key={index}
                   onClick={() => goToSlide(index)}
                   className={`w-2 h-2 rounded-full transition-all duration-300 ${
                     index === currentIndex ? "bg-blue-600 scale-125" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                   aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              className="p-2 hover:scale-105 transition-transform duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
