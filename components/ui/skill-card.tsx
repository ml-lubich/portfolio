"use client"

import { PortfolioCard, IconContainer, CardContent, CardHeader, CardTitle } from "@/components/ui/portfolio-card"
import { TechBadge } from "@/components/ui/tech-badge"
import { LucideIcon } from "lucide-react"

interface SkillCardProps {
  title: string
  icon: LucideIcon
  skills: string[]
  gradient: string
  animationDelay?: number
  inView?: boolean
}

export function SkillCard({
  title,
  icon: IconComponent,
  skills,
  gradient,
  animationDelay = 0,
  inView = true
}: SkillCardProps) {
  return (
    <PortfolioCard
      variant="default"
      inView={inView}
      animationDelay={animationDelay}
      showAnimation={true}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <IconContainer gradient={gradient}>
            <IconComponent className="h-6 w-6 text-white" />
          </IconContainer>
          <CardTitle className="text-lg text-gray-900 dark:text-white">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
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
