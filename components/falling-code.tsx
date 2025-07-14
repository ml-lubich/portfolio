"use client"

import { useEffect, useState } from "react"

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
  // Binary
  "0", "1", "01", "10", "101", "110", "001",
  // Code symbols
  "{", "}", "[", "]", "(", ")", "<", ">",
  // Programming keywords
  "if", "for", "var", "let", "const", "fn", "def", "class",
  // Operators
  "==", "!=", "<=", ">=", "&&", "||", "++", "--", "=>", "->",
  // Special chars
  "$", "#", "&", "*", "+", "-", "/", "\\", "|", "~", "^",
  // Tech terms
  "AI", "ML", "API", "CSS", "JS", "TS", "JSX", "SQL", "GIT",
]

const colors = [
  "#60a5fa", "#a78bfa", "#34d399", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#10b981", "#f97316", "#ec4899"
]

export function FallingCode() {
  const [particles, setParticles] = useState<CodeParticle[]>([])

  useEffect(() => {
    const createParticle = (id: number): CodeParticle => ({
      id,
      x: Math.random() * window.innerWidth,
      y: -50,
      speed: 0.5 + Math.random() * 2,
      character: codeCharacters[Math.floor(Math.random() * codeCharacters.length)],
      opacity: 0.1 + Math.random() * 0.4,
      size: 12 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
    })

    // Initialize particles
    const initialParticles = Array.from({ length: 50 }, (_, i) => ({
      ...createParticle(i),
      y: Math.random() * window.innerHeight,
    }))
    setParticles(initialParticles)

    // Animation loop
    const animate = () => {
      setParticles(prev => {
        const updated = prev.map(particle => ({
          ...particle,
          y: particle.y + particle.speed,
          rotation: particle.rotation + particle.rotationSpeed,
          opacity: particle.opacity * 0.999, // Fade out slowly
        }))

        // Remove particles that are off screen and add new ones
        const filtered = updated.filter(p => p.y < window.innerHeight + 100)
        
        // Add new particles occasionally
        if (Math.random() < 0.1 && filtered.length < 80) {
          filtered.push(createParticle(Date.now() + Math.random()))
        }

        return filtered
      })
    }

    const interval = setInterval(animate, 16) // ~60fps
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute font-mono font-bold transition-all duration-75 select-none"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            fontSize: `${particle.size}px`,
            color: particle.color,
            opacity: particle.opacity,
            transform: `rotate(${particle.rotation}deg)`,
            textShadow: `0 0 ${particle.size / 2}px ${particle.color}40`,
            filter: `blur(${Math.max(0, (particle.opacity - 0.3) * 2)}px)`,
          }}
        >
          {particle.character}
        </div>
      ))}
    </div>
  )
} 