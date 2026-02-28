"use client"

import { PortfolioCard, IconContainer, CardContent } from "./portfolio-card"
import { LucideIcon } from "lucide-react"

interface AboutCardProps {
  icon: LucideIcon
  title: string
  subtitle: string
  description: string
  gradient: string
  inView?: boolean
}

export function AboutCard({
  icon: IconComponent,
  title,
  subtitle,
  description,
  gradient,
  inView = true
}: AboutCardProps) {
  return (
    <PortfolioCard
      variant="soft"
      size="full"
      inView={inView}
      showAnimation={true}
      className="text-center p-6 h-64 flex flex-col overflow-hidden"
    >
      <CardContent className="pt-6 flex-1 flex flex-col items-center justify-center">
        <IconContainer 
          gradient={gradient}
          size="default"
          className="mx-auto mb-4"
        >
          <IconComponent className="h-7 w-7 text-white" strokeWidth={1.5} />
        </IconContainer>
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{title}</h3>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{subtitle}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </CardContent>
    </PortfolioCard>
  )
}
