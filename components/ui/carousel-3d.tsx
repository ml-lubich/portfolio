"use client"

import { useState, useEffect, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { animations } from "@/lib/animations"

interface Carousel3DProps {
  items: any[]
  renderCard: (item: any, index: number, isActive: boolean) => ReactNode
  className?: string
}

function Card3DWrapper({ 
  children, 
  index, 
  totalItems, 
  rotation, 
  isActive 
}: { 
  children: ReactNode
  index: number
  totalItems: number
  rotation: number
  isActive: boolean
}) {
  const radius = 350
  const cardWidth = 300
  const cardHeight = 400
  
  const angle = (index * (360 / totalItems)) + rotation
  const x = Math.sin((angle * Math.PI) / 180) * radius
  const z = Math.cos((angle * Math.PI) / 180) * radius
  
  const scale = 0.8 + (z + radius) / (radius * 2) * 0.2
  const opacity = 0.6 + (z + radius) / (radius * 2) * 0.4

  return (
    <div
      className="absolute top-1/2 left-1/2 origin-center transition-all duration-700 ease-out"
      style={{
        transform: `translate(-50%, -50%) translateX(${x}px) translateZ(${z}px) scale(${scale})`,
        opacity: opacity,
        zIndex: Math.round(z + radius),
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
      }}
    >
      <div className="w-full h-full flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0">
          {children}
        </div>
      </div>
    </div>
  )
}

export function Carousel3D({ 
  items, 
  renderCard, 
  className = ""
}: Carousel3DProps) {
  const [rotation, setRotation] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, rotation: 0 })

  const rotateToIndex = (index: number) => {
    const targetRotation = -(index * (360 / items.length))
    setRotation(targetRotation)
    setActiveIndex(index)
  }

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % items.length
    rotateToIndex(nextIndex)
  }

  const handlePrev = () => {
    const prevIndex = (activeIndex - 1 + items.length) % items.length
    rotateToIndex(prevIndex)
  }

  // Mouse drag controls
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, rotation })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragStart.x
    const deltaRotation = deltaX * 0.5
    setRotation(dragStart.rotation + deltaRotation)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Carousel Controls */}
      <div className="flex justify-center items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrev}
          className={`p-3 ${animations.buttonHover}`}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <div className="flex items-center gap-2">

          <div className="flex gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => rotateToIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex 
                    ? "bg-blue-600 scale-125" 
                    : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
                }`}
                aria-label={`Go to item ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={handleNext}
          className={`p-3 ${animations.buttonHover}`}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* 3D Carousel */}
      <div 
        className="relative h-[600px] overflow-visible cursor-grab active:cursor-grabbing px-8"
        style={{ perspective: '1200px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative w-full h-full"
          style={{ 
            transformStyle: 'preserve-3d',
            transition: isDragging ? 'none' : 'transform 0.7s ease-out'
          }}
        >
          {items.map((item, index) => (
            <Card3DWrapper
              key={index}
              index={index}
              totalItems={items.length}
              rotation={rotation}
              isActive={index === activeIndex}
            >
              {renderCard(item, index, index === activeIndex)}
            </Card3DWrapper>
          ))}
        </div>
      </div>


    </div>
  )
}
