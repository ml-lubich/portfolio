"use client"

import { PortfolioCard, IconContainer, CardContent, CardHeader, CardTitle } from "@/components/ui/portfolio-card"
import { TechBadge } from "@/components/ui/tech-badge"
import { BookOpen, ExternalLink } from "lucide-react"
import { animations } from "@/lib/animations"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface ResearchCardProps {
  title: string
  journal: string
  year: string
  volume: string
  type: "Journal Article" | "Conference Abstract"
  gradient: string
  href: string
  inView?: boolean
}

export function ResearchCard({
  title,
  journal,
  year,
  volume,
  type,
  gradient,
  href,
  inView = true
}: ResearchCardProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full"
    >
      <PortfolioCard
        variant="interactive"
        size="full"
        inView={inView}
        showAnimation={true}
        className="h-64 flex flex-col"
      >
        <CardHeader>
          <div className="flex items-start gap-3">
            <IconContainer gradient={gradient}>
              <BookOpen className="h-6 w-6 text-white" />
            </IconContainer>
            <div className="flex-1">
              <CardTitle className={cn(
                "text-lg mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400",
                animations.allTransition
              )}>
                {title}
              </CardTitle>
              <div className="flex items-center gap-2 mb-2">
                <TechBadge variant="outline">
                  {type}
                </TechBadge>
                <TechBadge variant="secondary">
                  {year}
                </TechBadge>
              </div>
            </div>
            <div className={cn(
              "flex-shrink-0 opacity-0 group-hover:opacity-100",
              animations.allTransition
            )}>
              <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {journal}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {volume}
            </p>
          </div>
        </CardContent>
      </PortfolioCard>
    </Link>
  )
}
