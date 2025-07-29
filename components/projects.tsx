import { PortfolioCard, CardContent, CardHeader, CardTitle } from "@/components/ui/portfolio-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, Users, Zap, Shield, GitBranch } from "lucide-react"
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
  },
  {
    title: "Flyoneo.ml",
    description:
      "Co-founded startup specializing in AI/ML-driven solutions. Led a team of 8 interns, successfully launching an MVP with over 1,500 active users.",
    icon: Zap,
    impact: "1,500+ active users",
    technologies: ["AI/ML", "Startup", "Team Leadership", "MVP Development"],
    link: "https://flyoneo.ml",
  },
  {
    title: "Verizon - Unbiased",
    description:
      "Designed technology solutions to reduce hiring discrimination by 25%, improving diversity and fairness in recruitment pipelines.",
    icon: Shield,
    impact: "25% reduction in hiring bias",
    technologies: ["Machine Learning", "Bias Detection", "HR Technology", "Data Analysis"],
  },
  {
    title: "Encrypted File Sharing System",
    description:
      "Built a secure file-sharing system with end-to-end encryption, achieving a 50% increase in data transfer speeds.",
    icon: Shield,
    impact: "50% faster transfers",
    technologies: ["Encryption", "Security", "File Systems", "Performance Optimization"],
  },
  {
    title: "Open Source Contributions",
    description:
      "Active contributor to Django and other open-source projects, helping maintain code quality and implement new features for the community.",
    icon: GitBranch,
    impact: "Community impact",
    technologies: ["Django", "Open Source", "Python", "Community"],
    link: "https://github.com/ml-lubich",
  },
  {
    title: "CI/CD Pipeline Optimization",
    description:
      "Developed automated deployment pipelines that reduced deployment time by 50% and increased reliability across multiple environments.",
    icon: Zap,
    impact: "50% faster deployments",
    technologies: ["Jenkins", "Docker", "Kubernetes", "DevOps"],
  },
]

export function Projects() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Featured{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Projects
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Innovative solutions that drive impact and create value
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => {
            const IconComponent = project.icon
            return (
              <PortfolioCard key={index} variant="default" size="full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                  </div>
                  <div className="text-sm font-semibold text-green-600">{project.impact}</div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1">{project.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  {project.link && (
                    <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                      <Link href={project.link} target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Project
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </PortfolioCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
