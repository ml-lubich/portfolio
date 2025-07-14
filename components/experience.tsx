import { PortfolioCard, CardContent, CardHeader, CardTitle } from "@/components/ui/portfolio-card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin } from "lucide-react"

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
  },
]

export function Experience() {
  return (
    <section id="experience" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Professional{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Experience
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Building scalable solutions at industry-leading companies
          </p>
        </div>

        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <PortfolioCard key={index} variant="minimal" size="auto">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">{exp.title}</CardTitle>
                    <p className="text-lg font-semibold text-blue-600 mt-1">{exp.company}</p>
                  </div>
                  <div className="flex flex-col md:items-end gap-2">
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
                <ul className="space-y-2 mb-4">
                  {exp.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {exp.technologies.map((tech, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </PortfolioCard>
          ))}
        </div>
      </div>
    </section>
  )
}
