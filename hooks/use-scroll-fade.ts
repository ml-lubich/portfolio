"use client"

import { useEffect, useState } from "react"

export function useScrollFade() {
  const [scrollY, setScrollY] = useState(0)
  const [isScrollingUp, setIsScrollingUp] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrollY(currentScrollY)
      
      // Detect scroll direction
      if (currentScrollY > lastScrollY) {
        setIsScrollingUp(false) // Scrolling down
      } else if (currentScrollY < lastScrollY) {
        setIsScrollingUp(true) // Scrolling up
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  // Calculate fade opacity based on scroll position and direction
  const getFadeOpacity = (elementTop: number, fadeDistance: number = 200) => {
    if (isScrollingUp && scrollY > 100) {
      // Fade out elements when scrolling up
      const fadeStart = scrollY - fadeDistance
      const fadeEnd = scrollY + fadeDistance
      
      if (elementTop < fadeStart) {
        return Math.max(0, 1 - (fadeStart - elementTop) / fadeDistance)
      } else if (elementTop > fadeEnd) {
        return Math.max(0, 1 - (elementTop - fadeEnd) / fadeDistance)
      }
    }
    
    return 1 // Full opacity by default
  }

  return {
    scrollY,
    isScrollingUp,
    getFadeOpacity,
    // Helper function to get scroll-based transform
    getScrollTransform: (intensity: number = 0.5) => {
      return isScrollingUp ? `translateY(${scrollY * intensity * 0.1}px)` : 'translateY(0)'
    }
  }
}
