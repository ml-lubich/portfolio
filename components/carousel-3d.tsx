"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Carousel3DProps<T> {
  items: T[]
  renderItem: (item: T, index: number, isActive: boolean) => React.ReactNode
  itemsPerView?: {
    mobile: number
    tablet: number
    desktop: number
  }
  spacing?: number
  autoPlay?: boolean
  autoPlayInterval?: number
  className?: string
  onItemClick?: (item: T, index: number) => void
}

export function Carousel3D<T>({ 
  items, 
  renderItem, 
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3 },
  spacing = 20,
  autoPlay = false,
  autoPlayInterval = 5000,
  className = "",
  onItemClick 
}: Carousel3DProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentItemsPerView, setCurrentItemsPerView] = useState(itemsPerView.desktop)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Responsive items per view
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setCurrentItemsPerView(itemsPerView.mobile)
      } else if (width < 1024) {
        setCurrentItemsPerView(itemsPerView.tablet)
      } else {
        setCurrentItemsPerView(itemsPerView.desktop)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [itemsPerView])

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay) return

    const interval = setInterval(() => {
      nextSlide()
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, currentIndex, items.length, currentItemsPerView])

  const nextSlide = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, items.length - currentItemsPerView)
      return prev >= maxIndex ? 0 : prev + 1
    })
    setTimeout(() => setIsTransitioning(false), 300)
  }, [isTransitioning, items.length, currentItemsPerView])

  const prevSlide = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, items.length - currentItemsPerView)
      return prev <= 0 ? maxIndex : prev - 1
    })
    setTimeout(() => setIsTransitioning(false), 300)
  }, [isTransitioning, items.length, currentItemsPerView])

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(Math.max(0, Math.min(index, items.length - currentItemsPerView)))
    setTimeout(() => setIsTransitioning(false), 300)
  }, [isTransitioning, items.length, currentItemsPerView])

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const threshold = 50

    if (distance > threshold) {
      nextSlide()
    } else if (distance < -threshold) {
      prevSlide()
    }
  }

  // Mouse handlers for desktop drag
  const handleMouseStart = (e: React.MouseEvent) => {
    setTouchStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (touchStart) {
      setTouchEnd(e.clientX)
    }
  }

  const handleMouseEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const threshold = 50

    if (distance > threshold) {
      nextSlide()
    } else if (distance < -threshold) {
      prevSlide()
    }
    
    setTouchStart(0)
    setTouchEnd(0)
  }

  const maxIndex = Math.max(0, items.length - currentItemsPerView)

  return (
    <div className={`relative ${className}`}>
      {/* Navigation buttons */}
      <button
        onClick={prevSlide}
        disabled={currentIndex === 0}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
      </button>

      <button
        onClick={nextSlide}
        disabled={currentIndex >= maxIndex}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
      </button>

      {/* Carousel container */}
      <div 
        ref={containerRef}
        className="overflow-hidden cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseStart}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseEnd}
        onMouseLeave={handleMouseEnd}
      >
        <div 
          className="flex transition-all duration-300 ease-out"
          style={{
            transform: `translateX(calc(-${currentIndex * (100 / currentItemsPerView)}% - ${currentIndex * spacing}px))`,
            gap: `${spacing}px`
          }}
        >
          {items.map((item, index) => {
            const isActive = index >= currentIndex && index < currentIndex + currentItemsPerView
            const distanceFromCenter = Math.abs(index - (currentIndex + currentItemsPerView / 2 - 0.5))
            const scale = isActive ? 1 - (distanceFromCenter * 0.1) : 0.8
            const opacity = isActive ? 1 : 0.6

            return (
              <div
                key={index}
                className="flex-shrink-0 transition-all duration-300 ease-out"
                style={{
                  width: `calc(${100 / currentItemsPerView}% - ${spacing * (currentItemsPerView - 1) / currentItemsPerView}px)`,
                  transform: `scale(${scale}) rotateY(${isActive ? 0 : (index < currentIndex ? -15 : 15)}deg)`,
                  opacity,
                  transformStyle: 'preserve-3d'
                }}
                onClick={() => onItemClick?.(item, index)}
              >
                {renderItem(item, index, isActive)}
              </div>
            )
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center mt-8 space-x-2">
        {Array.from({ length: maxIndex + 1 }, (_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-blue-600 dark:bg-blue-400 scale-125' 
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
} 