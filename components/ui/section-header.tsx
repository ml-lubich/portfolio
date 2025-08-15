"use client"

import { HeaderReveal } from "./unified-reveal"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  title: string
  subtitle?: string
  highlightedWord?: string
  description?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function SectionHeader({ 
  title, 
  subtitle, 
  highlightedWord, 
  description, 
  size = "md", 
  className 
}: SectionHeaderProps) {
  const sizeClasses = {
    sm: {
      title: "text-3xl sm:text-4xl",
      spacing: "mb-12"
    },
    md: {
      title: "text-4xl sm:text-5xl",
      spacing: "mb-16"
    },
    lg: {
      title: "text-5xl sm:text-6xl",
      spacing: "mb-20"
    }
  }

  const { title: titleClass, spacing } = sizeClasses[size]

  const renderTitle = () => {
    if (highlightedWord) {
      const parts = title.split(highlightedWord)
      return (
        <>
          {parts[0]}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {highlightedWord}
          </span>
          {parts[1]}
        </>
      )
    }
    return title
  }

  return (
    <HeaderReveal>
      <div className={cn(`text-center ${spacing}`, className)}>
        <h2 className={cn(`${titleClass} font-bold text-gray-900 dark:text-white mb-6`)}>
          {renderTitle()}
          {subtitle && (
            <>
              {" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {subtitle}
              </span>
            </>
          )}
        </h2>
        {description && (
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            {description}
          </p>
        )}
      </div>
    </HeaderReveal>
  )
}