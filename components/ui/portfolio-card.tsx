"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

// Import card components with explicit path
import { Card, CardContent, CardHeader, CardTitle } from "./card"

// Unified card variants following existing patterns
const portfolioCardVariants = cva(
  "group transition-all duration-300 border-gray-200/20 dark:border-gray-700/20 backdrop-blur-sm",
  {
    variants: {
      variant: {
        // Standard card with moderate transparency
        default: "bg-white/80 dark:bg-slate-800/80 hover:shadow-2xl hover:scale-105",
        // Softer transparency for about section
        soft: "bg-white/50 dark:bg-slate-800/50 hover:shadow-2xl hover:scale-105",
        // Minimal hover for experience cards
        minimal: "bg-white/80 dark:bg-slate-800/80 hover:shadow-lg",
        // Interactive cards with cursor pointer
        interactive: "bg-white/80 dark:bg-slate-800/80 hover:shadow-2xl hover:scale-105 cursor-pointer",
        // Carousel cards with enhanced mobile responsiveness
        carousel: "bg-white/80 dark:bg-slate-800/80 hover:shadow-2xl hover:scale-105"
      },
      size: {
        default: "h-full",
        auto: "h-auto",
        full: "h-full flex flex-col"
      },
      animation: {
        fast: "transition-all duration-150",
        normal: "transition-all duration-300",
        slow: "transition-all duration-500"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "normal"
    }
  }
)

// Icon container variants for consistent gradient icons
const iconContainerVariants = cva(
  "flex-shrink-0 rounded-xl bg-gradient-to-r p-3 group-hover:scale-110 transition-transform duration-300",
  {
    variants: {
      size: {
        sm: "h-12 w-12 p-2",
        default: "h-16 w-16 p-3",
        lg: "h-20 w-20 p-4"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

export interface PortfolioCardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof portfolioCardVariants> {
  children: React.ReactNode
  inView?: boolean
  animationDelay?: number
  // For intersection observer animations
  showAnimation?: boolean
}

export interface IconContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof iconContainerVariants> {
  gradient: string
  children: React.ReactNode
}

// Main unified card component
export const PortfolioCard = React.forwardRef<
  HTMLDivElement,
  PortfolioCardProps
>(({ 
  className, 
  variant, 
  size, 
  animation, 
  inView = true, 
  animationDelay = 0,
  showAnimation = false,
  children, 
  ...props 
}, ref) => {
  const animationClasses = showAnimation 
    ? inView 
      ? "opacity-100 translate-y-0" 
      : "opacity-0 translate-y-10"
    : ""

  return (
    <Card
      ref={ref}
      className={cn(
        portfolioCardVariants({ variant, size, animation }),
        animationClasses,
        className
      )}
      style={animationDelay > 0 ? { transitionDelay: `${animationDelay}ms` } : undefined}
      {...props}
    >
      {children}
    </Card>
  )
})

// Icon container component for consistent gradient icons
export const IconContainer = React.forwardRef<
  HTMLDivElement,
  IconContainerProps
>(({ className, size, gradient, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      iconContainerVariants({ size }),
      `bg-gradient-to-r ${gradient}`
    )}
    {...props}
  >
    {children}
  </div>
))

// Compound component exports
PortfolioCard.displayName = "PortfolioCard"
IconContainer.displayName = "IconContainer"

// Re-export Card components for convenience
export { CardContent, CardHeader, CardTitle } from "./card" 