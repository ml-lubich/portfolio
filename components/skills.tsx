"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Database, Cloud, Cog, Users, Lightbulb } from "lucide-react"
import { useInView } from "react-intersection-observer"

const skillCategories = [
  {
    title: "Languages",
    icon: Code,
    skills: ["Python", "Java", "C/C++", "Go", "JavaScript", "TypeScript", "SQL", "Bash"],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Frameworks & Libraries",
    icon: Database,
    skills: ["Spring Boot", "Express.js", "FastAPI", "Django", "React", "Angular", "PyTorch", "Apache Spark"],
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Cloud & DevOps",
    icon: Cloud,
    skills: ["AWS", "GCP", "Docker", "Kubernetes", "Jenkins", "Terraform", "Ansible", "GitHub Actions"],
    gradient: "from-teal-500 to-green-500",
  },
  {
    title: "Tools & Technologies",
    icon: Cog,
    skills: ["Git", "MySQL", "MongoDB", "Selenium", "Jupyter", "Datadog", "Prometheus", "ELK Stack"],
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "Methodologies",
    icon: Lightbulb,
    skills: ["DevOps", "CI/CD", "Agile/Scrum", "TDD", "Infrastructure as Code", "Site Reliability Engineering"],
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "Leadership & Soft Skills",
    icon: Users,
    skills: ["Team Leadership", "Mentorship", "Strategic Planning", "Public Speaking", "Technical Documentation"],
    gradient: "from-pink-500 to-rose-500",
  },
]

export function Skills() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section id="skills" className="py-20 px-4 bg-white/50 dark:bg-slate-900/50" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Technical{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Skills</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Comprehensive expertise across the full software development lifecycle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category, index) => {
            const IconComponent = category.icon
            return (
              <Card
                key={index}
                className={`group hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200/20 dark:border-gray-700/20 ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-r ${category.gradient} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-gray-900 dark:text-white">{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs hover:scale-105 transition-transform duration-200 bg-gray-50 dark:bg-slate-700/50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
