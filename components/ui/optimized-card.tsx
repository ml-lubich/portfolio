"use client"

import React from "react"
import { PortfolioCard, IconContainer, CardContent } from "./portfolio-card"
import { LucideIcon } from "lucide-react"

interface OptimizedAboutCardProps {
  icon: LucideIcon
  title: string
  subtitle: string
  description: string
  gradient: string
  inView?: boolean
}

// Memoized about card for better performance
export const OptimizedAboutCard = React.memo(function OptimizedAboutCard({
  icon: IconComponent,
  title,
  subtitle,
  description,
  gradient,
  inView = true
}: OptimizedAboutCardProps) {
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
})

// Optimized experience card with memoization
interface OptimizedExperienceCardProps {
  experience: {
    title: string
    company: string
    period: string
    location: string
    highlights: string[]
    technologies: string[]
    gradient: string
  }
  index: number
  isLeft: boolean
  inView?: boolean
}

export const OptimizedExperienceCard = React.memo(function OptimizedExperienceCard({
  experience,
  index,
  isLeft,
  inView = true
}: OptimizedExperienceCardProps) {
  const { CalendarDays, MapPin } = React.useMemo(() => require("lucide-react"), [])
  const { PortfolioCard, CardContent, CardHeader, CardTitle } = React.useMemo(() => require("./portfolio-card"), [])
  const { TechBadge } = React.useMemo(() => require("./tech-badge"), [])
  
  const cardClassName = React.useMemo(() => 
    "group overflow-visible [perspective:1200px] [transform-style:preserve-3d] transition-transform duration-100 hover:[transform:rotateX(4deg)_rotateY(2deg)_translateZ(8px)] hover:shadow-2xl", 
    []
  )
  
  const flexClassName = React.useMemo(() => 
    `flex ${isLeft ? 'justify-start pr-8' : 'justify-end pl-8'} mb-16`, 
    [isLeft]
  )
  
  const wrapperClassName = React.useMemo(() => 
    `w-full max-w-lg ${isLeft ? 'mr-8' : 'ml-8'}`, 
    [isLeft]
  )
  
  return (
    <div className="relative">
      {/* Timeline connector dot */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-0">
        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${experience.gradient} shadow border-2 border-white dark:border-gray-900`} />
      </div>
      
      {/* Card positioned left or right */}
      <div className={flexClassName}>
        <div className={wrapperClassName}>
          <PortfolioCard 
            variant="minimal" 
            size="full"
            className={cardClassName}
          >
            <CardHeader className="p-4 sm:p-6 [transform:translateZ(20px)]">
              <div className="flex flex-col gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gray-900 dark:text-white mb-2 leading-tight">
                    {experience.title}
                  </CardTitle>
                  <p className={`text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r ${experience.gradient} bg-clip-text text-transparent`}>
                    {experience.company}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <CalendarDays className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{experience.period}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{experience.location}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 [transform:translateZ(10px)]">
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {experience.highlights.slice(0, 3).map((highlight, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {highlight}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {experience.technologies.slice(0, 4).map((tech, idx) => (
                  <TechBadge key={idx}>{tech}</TechBadge>
                ))}
              </div>
            </CardContent>
          </PortfolioCard>
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.experience.title === nextProps.experience.title &&
    prevProps.index === nextProps.index &&
    prevProps.isLeft === nextProps.isLeft &&
    prevProps.inView === nextProps.inView
  )
})

// Memoized preset components for better performance
export const MemoizedSectionReveal = React.memo(function MemoizedSectionReveal({
  children,
  delay = 0,
  className = ""
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const { UnifiedReveal } = React.useMemo(() => 
    require("./unified-reveal"), []
  )
  
  return (
    <UnifiedReveal
      direction="up"
      distance={40}
      duration={800}
      delay={delay}
      threshold={0.1}
      triggerOnce={false}
      bidirectional={true}
      className={className}
    >
      {children}
    </UnifiedReveal>
  )
})

export const MemoizedCardReveal = React.memo(function MemoizedCardReveal({
  children,
  direction = "up",
  delay = 0,
  className = ""
}: {
  children: React.ReactNode
  direction?: "up" | "down" | "left" | "right" | "scale"
  delay?: number
  className?: string
}) {
  const { UnifiedReveal } = React.useMemo(() => 
    require("./unified-reveal"), []
  )
  
  return (
    <UnifiedReveal
      direction={direction}
      distance={60}
      duration={700}
      delay={delay}
      threshold={0.2}
      triggerOnce={false}
      bidirectional={true}
      className={className}
    >
      {children}
    </UnifiedReveal>
  )
})