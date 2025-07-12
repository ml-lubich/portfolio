import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin } from "lucide-react"

const experiences = [
  {
    title: "Software Development Engineer in Test & Developer",
    company: "Polaris Wireless",
    location: "San Francisco, CA",
    period: "September 2024 – Present",
    highlights: [
      "Engineered CI/CD pipelines using Jenkins, reducing deployment time by 50%",
      "Led cross-functional team of 4 engineers across QA, DevOps, and backend",
      "Designed scalable data ingestion pipelines processing 10M+ records daily",
      "Increased test coverage by 35% and reduced bugs by 30%",
    ],
    technologies: ["Jenkins", "Apache Spark", "Hadoop", "PyTest", "JUnit", "Maven"],
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
      "Led Capstone Project delivering $1M cost-saving outcome",
    ],
    technologies: ["GitHub Actions", "Agile", "Fleet Optimization", "CI/CD"],
  },
]

export function Experience() {
  return (
    <section id="experience" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Professional Experience</h2>
          <p className="text-lg text-gray-600">
            Building scalable solutions and leading teams at industry-leading companies
          </p>
        </div>

        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-gray-900">{exp.title}</CardTitle>
                    <p className="text-lg font-semibold text-blue-600 mt-1">{exp.company}</p>
                  </div>
                  <div className="flex flex-col md:items-end gap-2">
                    <div className="flex items-center text-gray-600">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      <span className="text-sm">{exp.period}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
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
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-gray-700">{highlight}</span>
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
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
