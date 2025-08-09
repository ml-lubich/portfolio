"use client"

import { Badge } from "@/components/ui/badge"
import { animations } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface TechBadgeProps {
  children: React.ReactNode
  variant?: "secondary" | "outline"
  className?: string
}

export function TechBadge({ 
  children, 
  variant = "secondary", 
  className 
}: TechBadgeProps) {
  return (
    <Badge
      variant={variant}
      className={cn(
        // Unified badge styling and hover across app
        "text-xs bg-gray-100 dark:bg-slate-700/60 border border-transparent",
        // Standard fast hover with subtle scale
        animations.buttonHover,
        // Consistent color shift on hover
        "hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent",
        className
      )}
    >
      {children}
    </Badge>
  )
}
