"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { Carousel3D } from "./carousel-3d"

interface Experience {
  title: string
  company: string
  location: string
  period: string
  highlights: string[]
  technologies: string[]
  gradient: string
}

const experiences: Experience[] = [
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
    title: "Software Engineer Intern",
    company: "Verizon",
    location: "Basking Ridge, NJ",
    period: "July 2021 – August 2021",
    highlights: [
      "Designed technology solutions to reduce hiring discrimination by 25%",
      "Developed machine learning models for bias detection in recruitment",
      "Collaborated with HR teams to implement fair hiring practices",
      "Created documentation and training materials for diversity initiatives",
    ],
    technologies: ["Python", "Machine Learning", "HR Tech", "Data Analysis"],
    gradient: "from-orange-500 to-red-500",
  },
]

export function ExperienceCarousel() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const renderExperience = (exp: Experience, index: number, isActive: boolean) => (
    <Card className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle className="text-xl lg:text-2xl text-gray-900 dark:text-white mb-2 leading-tight">
              {exp.title}
            </CardTitle>
            <p
              className={`text-lg lg:text-xl font-bold bg-gradient-to-r ${exp.gradient} bg-clip-text text-transparent`}
            >
              {exp.company}
            </p>
          </div>
          <div className="flex flex-col lg:items-end gap-2">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <CalendarDays className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-xs lg:text-sm">{exp.period}</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-xs lg:text-sm">{exp.location}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
          {exp.highlights.map((highlight, idx) => (
            <li key={idx} className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0">•</span>
              <span className="text-sm lg:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                {highlight}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-1 lg:gap-2">
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
  )

  return (
    <section ref={ref} className="py-20 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Professional{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Experience
            </span>
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Building scalable solutions and innovating within teams at industry-leading companies
          </p>
        </div>

        <Carousel3D
          items={experiences}
          renderItem={renderExperience}
          itemsPerView={{
            mobile: 1,
            tablet: 1,
            desktop: 1
          }}
          spacing={32}
          autoPlay={true}
          autoPlayInterval={8000}
          className="max-w-6xl mx-auto"
        />
      </div>
    </section>
  )
}
