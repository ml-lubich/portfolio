"use client"

import { ReactNode, useEffect, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"
import { FloatingAnimationConfig, getFloatingAnimation } from "@/lib/floating-animations"
import { ScrollWaveAnimation } from "./scroll-wave-animation"

interface ScrollSynchronizedFloatProps {
  children: ReactNode
  config: FloatingAnimationConfig
  className?: string
  triggerOnce?: boolean
  threshold?: number
}

export function ScrollSynchronizedFloat({
  children,
  config,
  className = "",
  triggerOnce = false,
  threshold = 0.1
}: ScrollSynchronizedFloatProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [animationClass, setAnimationClass] = useState("")
  
  const { ref, inView } = useInView({
    triggerOnce,
    threshold,
    rootMargin: '10px 0px -10px 0px'
  })

  useEffect(() => {
    if (config.scrollSync === 'always') {
      setIsVisible(true)
      setAnimationClass(getFloatingAnimation(config))
    } else if (config.scrollSync === 'onView') {
      setIsVisible(inView)
      if (inView) {
        setAnimationClass(getFloatingAnimation(config))
      } else if (!triggerOnce) {
        setAnimationClass("")
      }
    } else if (config.scrollSync === 'onScroll') {
      // Start animation when element comes into view and synchronize with scroll
      if (inView && !isVisible) {
        setIsVisible(true)
        setAnimationClass(getFloatingAnimation(config))
      }
    } else if (config.scrollSync === 'wave') {
      // Use wave animation for smooth scroll-based transitions
      setIsVisible(inView)
      if (inView) {
        setAnimationClass(getFloatingAnimation(config))
      }
    }
  }, [inView, config, triggerOnce, isVisible])

  // Use wave animation if specified
  if (config.scrollSync === 'wave') {
    return (
      <ScrollWaveAnimation
        className={className}
        delay={config.delay}
        threshold={threshold}
        triggerOnce={triggerOnce}
      >
        <div className={animationClass}>
          {children}
        </div>
      </ScrollWaveAnimation>
    )
  }

  return (
    <div 
      ref={ref}
      className={`${animationClass} ${className} ${
        isVisible ? 'opacity-100' : 'opacity-80'
      } transition-opacity duration-500`}
    >
      {children}
    </div>
  )
}

/**
 * Higher-order component to wrap elements with scroll-synchronized floating
 */
export function withScrollSyncFloat<T extends object>(
  Component: React.ComponentType<T>,
  config: FloatingAnimationConfig
) {
  return function WrappedComponent(props: T & { className?: string }) {
    const { className, ...rest } = props
    
    return (
      <ScrollSynchronizedFloat config={config} className={className}>
        <Component {...(rest as T)} />
      </ScrollSynchronizedFloat>
    )
  }
}

/**
 * Utility function to create scroll-synchronized floating animations for icons
 */
export function createScrollSyncIconFloat(
  variant: FloatingAnimationConfig['variant'],
  delay: number = 0
) {
  return {
    variant,
    delay,
    scrollSync: 'onView' as const
  }
}