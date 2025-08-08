"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface CodeParticle {
  id: number
  x: number
  y: number
  speed: number
  character: string
  opacity: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
}

const codeCharacters = [
  // Simplified character set for performance
  "0", "1", "01", "10", "101", "110",
  "{", "}", "[", "]", "(", ")",
  "if", "for", "var", "let", "fn", "def",
  "==", "!=", "&&", "||", "++", "=>",
  "$", "#", "&", "*", "+", "-",
  "AI", "ML", "API", "CSS", "JS", "TS",
]

const colors = [
  "#60a5fa", "#a78bfa", "#34d399", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#10b981", "#f97316", "#ec4899"
]

// Performance utilities
const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
const isLowEndDevice = () => {
  if (typeof navigator === 'undefined') return false
  const deviceMemory = (navigator as any).deviceMemory
  const hardwareConcurrency = (navigator as any).hardwareConcurrency
  return (hardwareConcurrency && hardwareConcurrency <= 2) || (deviceMemory && deviceMemory <= 4)
}

export function FallingCode() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const particlesRef = useRef<CodeParticle[]>([])
  const [isEnabled, setIsEnabled] = useState(true)
  const [performance, setPerformance] = useState<'high' | 'medium' | 'low'>('high')

  // Performance-based configuration with reduced initial load
  const getConfig = useCallback(() => {
    const mobile = isMobile()
    const lowEnd = isLowEndDevice()
    
    if (lowEnd || performance === 'low') {
      return {
        maxParticles: mobile ? 15 : 25,
        spawnRate: 0.04,
        enableEffects: false,
        frameSkip: 3,
        batchSize: 5
      }
    } else if (mobile || performance === 'medium') {
      return {
        maxParticles: mobile ? 30 : 45,
        spawnRate: 0.06,
        enableEffects: false,
        frameSkip: 2,
        batchSize: 8
      }
    } else {
      return {
        maxParticles: 60,
        spawnRate: 0.08,
        enableEffects: true,
        frameSkip: 1,
        batchSize: 12
      }
    }
  }, [performance])

  const createParticle = useCallback((id: number): CodeParticle => {
    const canvas = canvasRef.current
    if (!canvas) return null as any
    
    return {
      id,
      x: Math.random() * canvas.width,
      y: -50 - Math.random() * 100, // Stagger spawn positions
      speed: 1 + Math.random() * 3, // Increased speed range
      character: codeCharacters[Math.floor(Math.random() * codeCharacters.length)],
      opacity: 0.4 + Math.random() * 0.6, // Much more visible
      size: 14 + Math.random() * 12, // Larger size range
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 3, // Faster rotation
    }
  }, [])

  const updateParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const config = getConfig()
    const particles = particlesRef.current

    // Update existing particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i]
      
      // Add subtle horizontal drift
      particle.x += Math.sin(particle.y * 0.01) * 0.3
      particle.y += particle.speed
      particle.rotation += particle.rotationSpeed
      
      // Pulsing effect
      const pulse = Math.sin(Date.now() * 0.005 + particle.id * 0.1) * 0.1
      particle.opacity *= 0.998 // Slower fade for more visibility
      
      // Dynamic size variation
      particle.size += pulse * 0.5

      // Remove off-screen particles
      if (particle.y > canvas.height + 100 || particle.opacity < 0.1) {
        particles.splice(i, 1)
      }
    }

    // Add new particles more frequently
    if (Math.random() < config.spawnRate && particles.length < config.maxParticles) {
      const newParticle = createParticle(Date.now() + Math.random())
      if (newParticle) {
        particles.push(newParticle)
      }
    }
  }, [createParticle, getConfig])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // Clear canvas efficiently
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const config = getConfig()
    const particles = particlesRef.current

    // Render particles
    particles.forEach(particle => {
      ctx.save()
      
      // Set basic properties
      ctx.globalAlpha = particle.opacity
      ctx.fillStyle = particle.color
      ctx.font = `bold ${particle.size}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Apply transformation
      ctx.translate(particle.x, particle.y)
      ctx.rotate(particle.rotation * Math.PI / 180)

      // Enhanced effects
      if (config.enableEffects) {
        // Multi-layer glow effect
        ctx.shadowColor = particle.color
        ctx.shadowBlur = particle.size * 0.8
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        
        // Additional glow layer
        ctx.strokeStyle = particle.color
        ctx.lineWidth = 1
        ctx.strokeText(particle.character, 0, 0)
      }

      // Draw main character
      ctx.fillText(particle.character, 0, 0)
      
      // Add trailing effect for some particles
      if (particle.id % 5 === 0) {
        ctx.globalAlpha = particle.opacity * 0.3
        ctx.fillStyle = particle.color
        ctx.fillText(particle.character, 0, -particle.size * 0.5)
      }
      
      ctx.restore()
    })
  }, [getConfig])

  const animate = useCallback(() => {
    if (!isEnabled) return

    const config = getConfig()
    
    // Frame throttling and performance monitoring
    const now = Date.now()
    const frameTime = now - (animationRef.current || 0)
    
    // Skip frames if running too slow (< 30fps)
    if (frameTime < 33) {
      animationRef.current = requestAnimationFrame(animate)
      return
    }
    
    // Batch operations to reduce main-thread work
    const startTime = Date.now()
    
    updateParticles()
    render()
    
    // Monitor performance and adapt
    const executionTime = Date.now() - startTime
    if (executionTime > 16) { // Over 16ms is too slow
      setPerformance('low')
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }, [isEnabled, updateParticles, render, getConfig])

  // Initialize and cleanup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Set up canvas
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize particles
    const config = getConfig()
    particlesRef.current = Array.from({ length: Math.min(config.maxParticles, 40) }, (_, i) => ({
      ...createParticle(i),
      y: Math.random() * canvas.height,
    })).filter(Boolean)

    // Start animation
    animate()

    // Performance monitoring
    const checkPerformance = () => {
      const mobile = isMobile()
      const lowEnd = isLowEndDevice()
      
      if (lowEnd) {
        setPerformance('low')
      } else if (mobile) {
        setPerformance('medium')
      }
    }

    checkPerformance()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      particlesRef.current = []
    }
  }, [animate, createParticle, getConfig])

  // Visibility API for performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsEnabled(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          imageRendering: 'pixelated',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
          transform: 'translateZ(0)', // Force hardware acceleration
          willChange: 'transform'
        }}
      />
      
      {/* Performance controls (hidden by default) */}
      <div className="fixed bottom-4 right-4 z-10 opacity-0 hover:opacity-100 transition-opacity">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-2">
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className="text-xs text-white/70 hover:text-white mr-2"
          >
            {isEnabled ? 'Disable' : 'Enable'} Animation
          </button>
          <select
            value={performance}
            onChange={(e) => setPerformance(e.target.value as any)}
            className="text-xs bg-transparent text-white/70 border-none outline-none"
            title="Performance Level"
            aria-label="Performance Level"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
    </div>
  )
} 