"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarDays, MapPin } from "lucide-react"
import { useInView } from "react-intersection-observer"

const experiences = [
  {
    title: "Software Development Engineer in Test & Developer",
    company: "Polaris Wireless",
    location: "San Francisco, CA",
    period: "September 2024 – Present",
    highlights: [
      "Engineered CI/CD pipelines using Jenkins, reducing deployment time by 50%",
      "Collaborated with cross-functional team of 4 engineers across QA, DevOps, and backend",
      "Designed scalable data ingestion pipelines processing 10M+ records daily",
      "Increased test coverage by 35% and reduced bugs by 30%",
    ],
    technologies: ["Jenkins", "Apache Spark", "Hadoop", "PyTest", "JUnit", "Maven"],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Software Development Engineer in Test, CoreOS - File Systems",
    company: "Apple",
    location: "Cupertino, CA",
    period: "January 2023 – July 2024",
    highlights: [
      "Migrated 20+ legacy test scripts achieving 300% improvement in automation efficiency",
      "Managed 1,100+ high-priority tickets for APFS updates impacting 100M+ macOS users",
      "Implemented Ansible workflows reducing manual intervention by 30%",
      "Reduced onboarding time for new hires by 50% through technical documentation",
    ],
    technologies: ["Python", "Ansible", "APFS", "macOS", "Automation"],
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Software Engineer Intern",
    company: "Walmart",
    location: "Sunnyvale, CA",
    period: "May 2022 – August 2022",
    highlights: [
      "Built REST APIs managing 50,000+ data items daily with 60% latency reduction",
      "Enhanced backend performance by 300% using Java and Spring Boot",
      "Designed UX workflows in Figma achieving 25% increase in user satisfaction",
      "Developed AdTech systems increasing revenue by $2M annually",
    ],
    technologies: ["Java", "Spring Boot", "Angular", "Figma", "REST APIs"],
    gradient: "from-teal-500 to-green-500",
  },
  {
    title: "Software Engineer Intern, Machine Learning",
    company: "Lawrence Berkeley National Laboratory",
    location: "Berkeley, CA",
    period: "May 2021 – August 2021",
    highlights: [
      "Enhanced ML model clustering accuracy from 82% to 87%",
      "Performed data correlation analysis identifying key trends",
      "Streamlined data processing workflows saving 200+ hours annually",
      "Built reusable data visualization libraries",
    ],
    technologies: ["Python", "K-Means", "Machine Learning", "Data Analysis"],
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "Software Engineer Intern",
    company: "Honda Innovations",
    location: "Mountain View, CA",
    period: "January 2021 – May 2021",
    highlights: [
      "Engineered fleet optimization achieving 500% improvement in delivery rates",
      "Implemented Agile methodologies increasing team productivity by 30%",
      "Automated CI/CD workflows improving code integration efficiency by 35%",
      "Contributed to Capstone Project delivering $1M cost-saving outcome",
    ],
    technologies: ["GitHub Actions", "Agile", "Fleet Optimization", "CI/CD"],
    gradient: "from-indigo-500 to-purple-500",
  },
]

export function ExperienceCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
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

  return (
    <section id="experience" className="py-20 px-4 bg-white/50 dark:bg-slate-900/50" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Professional{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Experience
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Building scalable solutions and innovating within teams at industry-leading companies
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {experiences.map((exp, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                          <CardTitle className="text-2xl text-gray-900 dark:text-white mb-2">{exp.title}</CardTitle>
                          <p
                            className={`text-xl font-bold bg-gradient-to-r ${exp.gradient} bg-clip-text text-transparent`}
                          >
                            {exp.company}
                          </p>
                        </div>
                        <div className="flex flex-col lg:items-end gap-2">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <CalendarDays className="h-4 w-4 mr-2" />
                            <span className="text-sm">{exp.period}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="text-sm">{exp.location}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {exp.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1">•</span>
                            <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap gap-2">
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
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={prevSlide}
              className="rounded-full hover:scale-110 transition-all duration-200 bg-transparent"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex space-x-2">
              {experiences.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 scale-125"
                      : "bg-gray-300 dark:bg-gray-600 hover:scale-110"
                  }`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={nextSlide}
              className="rounded-full hover:scale-110 transition-all duration-200 bg-transparent"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
