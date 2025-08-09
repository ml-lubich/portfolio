"use client"

import { useState, useEffect, useRef } from "react"
import { PortfolioCard, CardContent, CardHeader, CardTitle } from "@/components/ui/portfolio-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarDays, MapPin } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { TechBadge } from "@/components/ui/tech-badge"
import { animations } from "@/lib/animations"

const experiences = [
  {
    title: "Software Development Engineer in Test & Developer",
    company: "Polaris Wireless",
    period: "September 2024 - Present",
    location: "San Francisco, CA",
    highlights: [
      "Engineered robust CI/CD pipelines using Jenkins, reducing deployment time by 50%",
      "Led and mentored a cross-functional team of 4 engineers across QA, DevOps, and backend",
      "Designed scalable data ingestion pipelines processing over 10 million records daily",
      "Developed comprehensive testing frameworks increasing test coverage by 35%",
      "Migrated Ant-based build systems to Maven, optimizing dependency management by 25%",
    ],
    technologies: ["Jenkins", "Python", "Maven", "Apache Spark", "Hadoop", "PyTest", "JUnit", "Ansible"],
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Software Development Engineer in Test, CoreOS - File Systems",
    company: "Apple",
    period: "January 2023 - July 2024",
    location: "Cupertino, CA",
    highlights: [
      "Migrated and optimized 20+ legacy test scripts achieving 300% automation efficiency improvement",
      "Managed and resolved over 1,100 high-priority tickets for APFS updates impacting 100M+ macOS users",
      "Implemented streamlined workflows using Ansible, reducing manual intervention by 30%",
      "Designed modular Python test suites, enhancing code reusability by 40%",
      "Authored technical documentation reducing onboarding time for new hires by 50%",
    ],
    technologies: ["Python", "Ansible", "APFS", "macOS", "Git", "Automated Testing", "CI/CD"],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Software Engineer Intern",
    company: "Walmart",
    period: "May 2022 - August 2022",
    location: "Sunnyvale, CA",
    highlights: [
      "Built and optimized REST APIs managing over 50,000 data items daily with 60% latency reduction",
      "Enhanced backend performance by 300% using optimization techniques in Java and Spring Boot",
      "Designed user flows using Figma and implemented them in Angular, achieving 25% increase in user satisfaction",
      "Developed scalable advertisement delivery systems increasing revenue by $2 million annually",
      "Automated recurring tasks, saving over 1,400 work hours annually and reducing costs by $4 million",
    ],
    technologies: ["Java", "Spring Boot", "Angular", "REST APIs", "Figma", "AdTech"],
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Software Engineer Intern, Machine Learning",
    company: "Lawrence Berkeley National Laboratory",
    period: "May 2021 - August 2021",
    location: "Berkeley, CA",
    highlights: [
      "Enhanced ML model clustering accuracy from 82% to 87% using K-Means and hierarchical clustering",
      "Performed extensive data correlation analysis, identifying trends and improving hypothesis testing",
      "Streamlined data processing workflows, saving over 200 hours annually in repetitive tasks",
      "Built reusable data visualization libraries, improving reporting efficiency across multiple projects",
    ],
    technologies: ["Python", "Machine Learning", "K-Means", "Data Analysis", "Visualization", "Jupyter"],
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "Software Engineer Intern",
    company: "Honda Innovations",
    period: "January 2021 - May 2021",
    location: "Mountain View, CA",
    highlights: [
      "Engineered fleet optimization solutions achieving 500% improvement in medical supply delivery rates",
      "Implemented Agile methodologies and facilitated stand-ups, increasing team productivity by 30%",
      "Automated CI/CD workflows using GitHub Actions, improving code integration efficiency by 35%",
      "Led high-impact Capstone Project delivering $1 million cost-saving outcome through data-driven decisions",
      "Collaborated with cross-functional teams ensuring alignment on strategic goals",
    ],
    technologies: ["GitHub Actions", "Agile", "Fleet Optimization", "Data Analytics", "CI/CD"],
    gradient: "from-orange-500 to-red-500",
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
            From Apple to Walmart, delivering impactful solutions across diverse tech environments
          </p>
        </div>

        <div className="relative">
          {/* Desktop Navigation */}
          <div className="hidden md:flex justify-between items-center mb-6">
            <Button
              variant="outline"
              size="lg"
              onClick={prevSlide}
              className={`p-3 ${animations.buttonHover}`}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="flex space-x-2">
              {experiences.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-100 ${
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
              className={`p-3 ${animations.buttonHover}`}
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
                          <TechBadge key={idx}>
                            {tech}
                          </TechBadge>
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
              className={`p-2 ${animations.buttonHover}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex space-x-2">
              {experiences.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-100 ${
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
              className={`p-2 ${animations.buttonHover}`}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
