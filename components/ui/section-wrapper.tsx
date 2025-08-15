"use client"

import { forwardRef } from "react"
import { SectionReveal } from "./unified-reveal"
import { cn } from "@/lib/utils"

interface SectionWrapperProps {
  id: string
  children: React.ReactNode
  className?: string
  containerClassName?: string
  maxWidth?: "4xl" | "5xl" | "6xl" | "7xl"
  delay?: number
}

export const SectionWrapper = forwardRef<HTMLElement, SectionWrapperProps>(
  ({ id, children, className, containerClassName, maxWidth = "6xl", delay = 0 }, ref) => {
    const maxWidthClasses = {
      "4xl": "max-w-4xl",
      "5xl": "max-w-5xl", 
      "6xl": "max-w-6xl",
      "7xl": "max-w-7xl"
    }

    return (
      <SectionReveal delay={delay}>
        <section 
          id={id} 
          className={cn("py-20 px-4", className)} 
          ref={ref}
        >
          <div className={cn(`${maxWidthClasses[maxWidth]} mx-auto`, containerClassName)}>
            {children}
          </div>
        </section>
      </SectionReveal>
    )
  }
)

SectionWrapper.displayName = "SectionWrapper"