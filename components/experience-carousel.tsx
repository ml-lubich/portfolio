"use client"

import { useState, useEffect, useRef } from "react"
import { PortfolioCard, CardContent, CardHeader, CardTitle } from "@/components/ui/portfolio-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarDays, MapPin } from "lucide-react"
import { useInView } from "react-intersection-observer"

const experiences = [
  {
    title: "Software Engineer",
    company: "Apple Inc.",
    period: "2023 - Present",
    location: "Cupertino, CA",
    highlights: [
      "Developed and maintained high-performance macOS systems serving 100M+ users",
      "Optimized backend performance by 300% through advanced caching and database optimization",
      "Implemented CI/CD pipelines reducing deployment time by 50%",
      "Led cross-functional collaboration with design and product teams",
    ],
    technologies: ["Swift", "Objective-C", "Python", "C++", "XCode", "Git"],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Software Engineer",
    company: "GitHub",
    period: "2022 - 2023",
    location: "San Francisco, CA (Remote)",
    highlights: [
      "Enhanced platform reliability and performance for millions of developers",
      "Contributed to open-source projects with focus on developer experience",
      "Implemented features that improved user engagement by 25%",
      "Mentored junior developers and conducted code reviews",
    ],
    technologies: ["Ruby", "Rails", "JavaScript", "React", "PostgreSQL", "Redis"],
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Research Assistant",
    company: "UC Berkeley",
    period: "2021 - 2022",
    location: "Berkeley, CA",
    highlights: [
      "Published 6 research papers in machine learning and environmental science",
      "Developed ML models for stream temperature prediction with 95% accuracy",
      "Collaborated with interdisciplinary teams on climate change research",
      "Presented findings at international conferences",
    ],
    technologies: ["Python", "TensorFlow", "PyTorch", "R", "MATLAB", "Jupyter"],
    gradient: "from-teal-500 to-green-500",
  },
]

export function ExperienceCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % experiences.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + experiences.length) % experiences.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        nextSlide()
      }, 8000) // Change slide every 8 seconds
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlaying])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
    setIsAutoPlaying(false) // Pause auto-play on touch
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const threshold = 50

    if (distance > threshold) {
      nextSlide()
    } else if (distance < -threshold) {
      prevSlide()
    }

    setTouchStart(0)
    setTouchEnd(0)
    
    // Resume auto-play after 5 seconds
    setTimeout(() => setIsAutoPlaying(true), 5000)
  }

  const handleMouseEnter = () => {
    setIsAutoPlaying(false)
  }

  const handleMouseLeave = () => {
    setIsAutoPlaying(true)
  }

  return (
    <section id="experience" className="py-20 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Professional{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Experience
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Building scalable solutions at industry-leading companies
          </p>
        </div>

        <div className="relative">
          {/* Desktop Navigation */}
          <div className="hidden md:flex justify-between items-center mb-6">
            <Button
              variant="outline"
              size="lg"
              onClick={prevSlide}
              className="p-3 hover:scale-105 transition-transform duration-200"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="flex space-x-2">
              {experiences.map((_, index) => (
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
              className="p-3 hover:scale-105 transition-transform duration-200"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          <div 
            className="overflow-hidden rounded-2xl"
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {experiences.map((exp, index) => (
                <div key={index} className="w-full flex-shrink-0 px-2 sm:px-4">
                  <PortfolioCard variant="minimal" size="full">
                    <CardHeader className="p-4 sm:p-6">
                      <div className="flex flex-col gap-4">
                        <div>
                          <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gray-900 dark:text-white mb-2 leading-tight">
                            {exp.title}
                          </CardTitle>
                          <p
                            className={`text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r ${exp.gradient} bg-clip-text text-transparent`}
                          >
                            {exp.company}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <CalendarDays className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">{exp.period}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">{exp.location}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                        {exp.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0">•</span>
                            <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                              {highlight}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {exp.technologies.map((tech, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs bg-gray-100 dark:bg-slate-700 hover:scale-105 transition-transform duration-200"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </PortfolioCard>
                </div>
              ))}
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
              {experiences.map((_, index) => (
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
