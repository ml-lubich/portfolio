"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { animations, gradients } from "@/lib/animations"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface ActionButtonProps {
  variant?: "gradient" | "outline"
  gradient?: keyof typeof gradients
  size?: "sm" | "lg" | "default"
  href?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
  external?: boolean
}

export function ActionButton({
  variant = "gradient",
  gradient = "primary",
  size = "lg", 
  href,
  onClick,
  children,
  className,
  external = false,
  ...props
}: ActionButtonProps) {
  const baseClasses = variant === "gradient" 
    ? `bg-gradient-to-r ${gradients[gradient]} text-white ${animations.gradientButton}`
    : `${animations.outlineButton} border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-slate-700/30`

  const buttonContent = (
    <Button
      size={size}
      onClick={onClick}
      className={cn(baseClasses, className)}
      {...props}
    >
      {children}
    </Button>
  )

  if (href) {
    return (
      <Button asChild size={size} className={cn(baseClasses, className)} {...props}>
        <Link 
          href={href} 
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          {children}
        </Link>
      </Button>
    )
  }

  return buttonContent
}
