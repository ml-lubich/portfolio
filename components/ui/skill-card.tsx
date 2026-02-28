"use client"

import { PortfolioCard, IconContainer, CardContent, CardHeader, CardTitle } from "@/components/ui/portfolio-card"
import { TechBadge } from "@/components/ui/tech-badge"
import { LucideIcon } from "lucide-react"

interface SkillCardProps {
  title: string
  icon: LucideIcon
  skills: string[]
  gradient: string
  inView?: boolean
  className?: string
}

export function SkillCard({
  title,
  icon: IconComponent,
  skills,
  gradient,
  inView = true,
  className = ""
}: SkillCardProps) {
  return (
    <PortfolioCard
      variant="static"
      inView={inView}
      showAnimation={true}
      className={`w-full h-full flex flex-col ${className}`}
    >
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <IconContainer gradient={gradient}>
            <IconComponent className="h-6 w-6 text-white" />
          </IconContainer>
          <CardTitle className="text-lg text-gray-900 dark:text-white">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="flex flex-wrap gap-2 content-start h-full overflow-y-auto">
          {skills.map((skill, idx) => (
            <TechBadge
              key={idx}
              variant="outline"
              className="bg-gray-50 dark:bg-slate-700/50"
            >
              {skill}
            </TechBadge>
          ))}
        </div>
      </CardContent>
    </PortfolioCard>
  )
}
