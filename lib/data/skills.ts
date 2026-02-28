import { Code, Database, Cloud, Cog, Users, Lightbulb } from "lucide-react"

export interface SkillCategory {
  title: string
  icon: typeof Code | typeof Database | typeof Cloud | typeof Cog | typeof Users | typeof Lightbulb
  skills: string[]
  gradient: string
}

export const skillCategories: SkillCategory[] = [
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
