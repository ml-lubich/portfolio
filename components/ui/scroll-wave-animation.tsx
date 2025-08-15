"use client"

import { ReactNode, useEffect, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"

interface ScrollWaveAnimationProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
  threshold?: number
  triggerOnce?: boolean
  rootMargin?: string
}

/**
 * Creates a smooth wave-like animation that responds to scroll position
 * Elements fade in and float up with a natural wave progression
 */
export function ScrollWaveAnimation({
  children,
  className = "",
  delay = 0,
  duration = 800,
  easing = 'ease-out',
  threshold = 0.1,
  triggerOnce = true,
  rootMargin = '0px 0px -50px 0px'
}: ScrollWaveAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  const elementRef = useRef<HTMLDivElement>(null)
  
  const { ref, inView, entry } = useInView({
    triggerOnce,
    threshold,
    rootMargin
  })

  useEffect(() => {
    if (inView && !isVisible) {
      setTimeout(() => {
        setIsVisible(true)
      }, delay)
    } else if (!triggerOnce && !inView && isVisible) {
      setIsVisible(false)
    }
  }, [inView, isVisible, delay, triggerOnce])

  // Calculate scroll-based progress for wave effect
  useEffect(() => {
    if (!entry || !elementRef.current) return

    const calculateProgress = () => {
      const rect = elementRef.current?.getBoundingClientRect()
      if (!rect) return

      const windowHeight = window.innerHeight
      const elementTop = rect.top
      const elementHeight = rect.height
      
      // Calculate how much of the element is visible
      const visibleTop = Math.max(0, windowHeight - elementTop)
      const visibleBottom = Math.min(elementHeight, windowHeight - Math.max(0, elementTop))
      const visibleHeight = Math.max(0, visibleBottom - Math.max(0, -elementTop))
      
      // Convert to progress (0 to 1)
      const progress = Math.min(1, Math.max(0, visibleHeight / (elementHeight * 0.5)))
      setAnimationProgress(progress)
    }

    const handleScroll = () => {
      requestAnimationFrame(calculateProgress)
    }

    if (inView || !triggerOnce) {
      calculateProgress()
      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('resize', calculateProgress, { passive: true })
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', calculateProgress)
    }
  }, [inView, triggerOnce])

  // Generate CSS custom properties for smooth animation
  const animationStyles = {
    '--wave-opacity': isVisible ? 1 : 0,
    '--wave-transform-y': isVisible ? '0px' : '30px',
    '--wave-transform-scale': isVisible ? 1 : 0.95,
    '--wave-progress': animationProgress,
    '--wave-duration': `${duration}ms`,
    '--wave-delay': `${delay}ms`,
    '--wave-easing': easing,
    transform: `translateY(var(--wave-transform-y)) scale(var(--wave-transform-scale))`,
    opacity: `var(--wave-opacity)`,
    transition: `transform var(--wave-duration) var(--wave-easing) var(--wave-delay), 
                opacity var(--wave-duration) var(--wave-easing) var(--wave-delay)`,
  } as React.CSSProperties

  return (
    <div
      ref={(node) => {
        ref(node)
        if (elementRef) {
          elementRef.current = node
        }
      }}
      className={`${className}`}
      style={animationStyles}
    >
      {children}
    </div>
  )
}

/**
 * Wave container for multiple elements with staggered delays
 */
interface ScrollWaveContainerProps {
  children: ReactNode[]
  className?: string
  staggerDelay?: number
  baseDelay?: number
  duration?: number
}

export function ScrollWaveContainer({
  children,
  className = "",
  staggerDelay = 100,
  baseDelay = 0,
  duration = 600
}: ScrollWaveContainerProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <ScrollWaveAnimation
          key={index}
          delay={baseDelay + (index * staggerDelay)}
          duration={duration}
          threshold={0.05}
          rootMargin="0px 0px -20px 0px"
        >
          {child}
        </ScrollWaveAnimation>
      ))}
    </div>
  )
}

/**
 * Utility function to create wave animations for sections
 */
export function createSectionWave(elements: ReactNode[], options?: {
  staggerDelay?: number
  baseDelay?: number
  duration?: number
}) {
  const { staggerDelay = 150, baseDelay = 0, duration = 700 } = options || {}
  
  return (
    <ScrollWaveContainer
      staggerDelay={staggerDelay}
      baseDelay={baseDelay}
      duration={duration}
    >
      {elements}
    </ScrollWaveContainer>
  )
}