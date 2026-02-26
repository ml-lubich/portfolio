"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { gradients, animations } from "@/lib/animations"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  // Show button when user scrolls down significantly
  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when user has scrolled more than 300px from top
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    // Add scroll event listener
    window.addEventListener("scroll", toggleVisibility)

    // Cleanup
    return () => {
      window.removeEventListener("scroll", toggleVisibility)
    }
  }, [])

  // Smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  return (
    <>
      {isVisible && (
        <Button
          onClick={scrollToTop}
          size="lg"
          className={`fixed bottom-8 right-8 z-50 bg-gradient-to-r ${gradients.primary} text-white border-0 shadow-2xl hover:shadow-2xl rounded-full p-4 w-14 h-14 ${animations.allTransition} ${animations.hoverScaleLarge} transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      )}
    </>
  )
} 