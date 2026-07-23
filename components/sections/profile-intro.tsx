"use client"

import Image from "next/image"
import { AnimatedSection } from "../animations/animated-section"
import { AnimatedText } from "../animations/animated-text"
import { useRef, useState, useCallback } from "react"
import { profileOrbs } from "@/lib/theme"

export function ProfileIntro() {
    const cardRef = useRef<HTMLDivElement>(null)
    const [tilt, setTilt] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)

    const lastTouchRef = useRef(0)

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (Date.now() - lastTouchRef.current < 500) return
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        setTilt({ x: y * -12, y: x * 12 })
    }, [])

    const handleMouseEnter = useCallback(() => {
        if (Date.now() - lastTouchRef.current < 500) return
        setIsHovered(true)
    }, [])
    const handleMouseLeave = useCallback(() => {
        setIsHovered(false)
        setTilt({ x: 0, y: 0 })
    }, [])

    const handleTouchEnd = useCallback(() => {
        lastTouchRef.current = Date.now()
        setIsHovered(false)
        setTilt({ x: 0, y: 0 })
    }, [])

    return (
        <section id="profile" className="relative overflow-hidden py-8 sm:py-14">
            <div className="mx-auto max-w-3xl px-3 md:px-6">
                <AnimatedSection>
                    {/* Floating liquid-glass card with 3D tilt */}
                    <div
                        ref={cardRef}
                        onMouseMove={handleMouseMove}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onTouchEnd={handleTouchEnd}
                        className="group relative overflow-hidden rounded-3xl p-6 sm:p-10 md:p-12 will-change-transform"
                        style={{
                            transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${isHovered ? -8 : 0}px) scale(${isHovered ? 1.015 : 1})`,
                            transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
                            background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.04) 100%)",
                            backdropFilter: "blur(24px) saturate(1.4)",
                            WebkitBackdropFilter: "blur(24px) saturate(1.4)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            boxShadow: isHovered
                                ? "0 24px 80px -12px rgba(0,0,0,0.45), 0 8px 24px -8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)"
                                : "0 8px 32px -8px rgba(0,0,0,0.3), 0 4px 12px -4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
                        }}
                    >
                        {/* Animated glass shimmer on hover */}
                        <div
                            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                            style={{
                                background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 55%, transparent 60%)",
                                backgroundSize: "200% 100%",
                                animation: isHovered ? "glassShimmer 2s ease-in-out infinite" : "none",
                            }}
                            aria-hidden="true"
                        />

                        {/* Corner glow accents */}
                        <div
                            className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full opacity-15 blur-3xl transition-opacity duration-500 group-hover:opacity-25"
                            style={{ background: profileOrbs.topRight }}
                            aria-hidden="true"
                        />
                        <div
                            className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-20"
                            style={{ background: profileOrbs.bottomLeft }}
                            aria-hidden="true"
                        />

                        <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-10">
                            {/* Profile photo — larger, darker, with hover lift */}
                            <div className="relative shrink-0 transition-transform duration-500 ease-out group-hover:-translate-y-1">
                                {/* Glow ring behind photo */}
                                <div
                                    className="absolute inset-0 scale-110 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20"
                                    style={{ background: profileOrbs.photoRing }}
                                    aria-hidden="true"
                                />
                                <div className="h-64 w-52 overflow-hidden rounded-2xl border border-white/[0.12] shadow-xl shadow-black/30 transition-shadow duration-500 group-hover:shadow-2xl group-hover:shadow-black/40 sm:h-80 sm:w-64">
                                    <Image
                                        src="/profile_blog.png"
                                        alt="Misha Lubich"
                                        width={512}
                                        height={512}
                                        sizes="(max-width: 640px) 208px, 256px"
                                        className="h-full w-full object-cover object-center contrast-[1.02] transition-transform duration-500 group-hover:scale-[1.02]"
                                        priority={false}
                                    />
                                </div>
                            </div>

                            {/* Open letter intro */}
                            <div className="text-center sm:text-left">
                                <h2 className="section-title font-display text-2xl font-light tracking-tight text-foreground sm:text-3xl">
                                    <AnimatedText text="Engineering judgment, hands-on delivery" variant="blur-slide" stagger={45} duration={800} />
                                </h2>

                                <div className="mx-auto mt-3 h-px w-12 bg-gradient-to-r from-transparent via-primary/40 to-transparent sm:mx-0 sm:w-16" />

                                <p className="mt-5 text-base font-light leading-relaxed tracking-normal text-muted-foreground sm:text-lg">
                                    <AnimatedText variant="fade-up" delay={300} stagger={20} duration={600}>
                                        I work directly with founders and operators to turn ambiguous, high-pressure ideas into reliable software&mdash;from
                                        AI workflows and ranking systems to public product experiences. I bring the same production discipline used at{" "}
                                        <span className="font-normal text-foreground/90">Apple</span> and{" "}
                                        <span className="font-normal text-foreground/90">Walmart</span>, without the handoff layers of a large consultancy.
                                    </AnimatedText>
                                </p>

                                <blockquote className="mt-6 border-l-2 border-primary/35 pl-4 text-left text-sm leading-relaxed text-foreground/75">
                                    “This is something to be proud of. The collaboration was 1000× appreciated.”
                                    <footer className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Nikita Khandheria · ERIA</footer>
                                </blockquote>

                                <p className="mt-5 font-mono text-xs tracking-widest uppercase text-muted-foreground/50">
                                    <AnimatedText text="Berkeley CS · 6 published papers · 100 M+ users impacted" variant="fade-up" delay={600} stagger={30} duration={600} />
                                </p>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    )
}
