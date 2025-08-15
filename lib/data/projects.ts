import { Users, Zap, Shield, GitBranch } from "lucide-react"

export interface Project {
  title: string
  description: string
  icon: typeof Users | typeof Zap | typeof Shield | typeof GitBranch
  impact: string
  technologies: string[]
  gradient: string
  link?: string
}

export const projects: Project[] = [
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
