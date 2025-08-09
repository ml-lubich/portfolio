"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { animations } from "@/lib/animations"

// Card components for internal structure
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-lg", className)}
    {...props}
  />
))
Card.displayName = "Card"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

// Unified card variants using standardized animations
const portfolioCardVariants = cva(
  `group border-gray-200/20 dark:border-gray-700/20 backdrop-blur-sm rounded-2xl border bg-white/80 dark:bg-slate-800/80 text-card-foreground ${animations.allTransition}`,
  {
    variants: {
      variant: {
        // Standard card with moderate transparency
        default: `${animations.hoverShadow} ${animations.hoverScale}`,
        // Softer transparency for about section
        soft: `${animations.hoverShadow} ${animations.hoverScale}`,
        // Minimal hover for experience cards
        minimal: `hover:shadow-lg ${animations.hoverScale}`,
        // Interactive cards with cursor pointer
        interactive: `${animations.hoverShadow} ${animations.hoverScale} cursor-pointer`,
        // Carousel cards with enhanced mobile responsiveness
        carousel: `${animations.hoverShadow} ${animations.hoverScale}`
      },
      size: {
        default: "h-full",
        auto: "h-auto",
        full: "h-full flex flex-col"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

// Icon container variants using standardized animations
const iconContainerVariants = cva(
  `flex-shrink-0 rounded-xl bg-gradient-to-r flex items-center justify-center ${animations.iconHover}`,
  {
    variants: {
      size: {
        sm: "h-12 w-12",
        default: "h-16 w-16", 
        lg: "h-20 w-20"
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
    <div
      className={animationClasses}
      style={animationDelay > 0 ? { transitionDelay: `${animationDelay}ms` } : undefined}
    >
      <div
        ref={ref}
        className={cn(
          portfolioCardVariants({ variant, size }),
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
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
      `bg-gradient-to-r ${gradient}`,
      "relative",
      className
    )}
    {...props}
  >
    <div className="absolute inset-0 flex items-center justify-center">
      {children}
    </div>
  </div>
))

// Compound component exports
PortfolioCard.displayName = "PortfolioCard"
IconContainer.displayName = "IconContainer"

// Export card components locally
export { CardContent, CardHeader, CardTitle } 