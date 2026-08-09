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
        setTilt({ x: y * -10, y: x * 10 })
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
        <section id="profile" className="relative py-12 sm:py-24 overflow-hidden">
            <div className="mx-auto max-w-5xl px-3 md:px-6">
                <AnimatedSection>
                    {/* Sleek liquid glass card container with subtle 3D tilt */}
                    <div
                        ref={cardRef}
                        onMouseMove={handleMouseMove}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onTouchEnd={handleTouchEnd}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-card/60 p-6 backdrop-blur-2xl transition-all duration-500 sm:p-10 md:p-12 will-change-transform shadow-2xl shadow-black/40"
                        style={{
                            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${isHovered ? -6 : 0}px)`,
                            background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.05) 100%)",
                        }}
                    >
                        {/* Specular edge sheen */}
                        <div
                            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            aria-hidden="true"
                        />

                        {/* Corner ambient glow */}
                        <div
                            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
                            style={{ background: profileOrbs.topRight }}
                            aria-hidden="true"
                        />

                        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center">
                            {/* Portrait — one photo only. The rest of the set is
                                spread down the page (About, Research, Contact)
                                rather than piled into a thumbnail strip here.
                                The frame's aspect tracks the source image so
                                object-cover never crops the top of the head. */}
                            <div className="shrink-0 lg:w-[22rem]">
                                {/* aspect-[4/5] matches the source exactly, so
                                    object-cover has nothing to crop at ANY
                                    width. A fixed height cannot do this: the
                                    frame's ratio drifts as the column narrows
                                    and the crop eats the top of the head. */}
                                <div className="group/photo relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/20 shadow-2xl shadow-black/50">
                                    <Image
                                        src="/misha-headshot.png"
                                        alt="Misha Lubich"
                                        width={600}
                                        height={750}
                                        className="h-full w-full object-cover object-top transition-transform duration-700 group-hover/photo:scale-105"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                                    <div className="absolute bottom-3 left-3 text-xs font-medium tracking-wide text-white/90">
                                        Engineering &amp; Client Solutions
                                    </div>
                                </div>
                            </div>

                            {/* Professional intro copy & stats */}
                            <div className="flex-1 text-center lg:text-left">
                                <h2 className="section-title font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                    <AnimatedText text="Hello, I'm Misha" variant="blur-slide" stagger={70} duration={800} />
                                </h2>

                                <div className="mx-auto mt-3.5 h-1 w-16 rounded-full bg-gradient-to-r from-primary via-accent to-primary lg:mx-0" />

                                <p className="mt-6 text-base font-normal leading-relaxed text-foreground/90 sm:text-lg">
                                    <AnimatedText variant="fade-up" delay={300} stagger={20} duration={600}>
                                        I architect production AI-driven, cloud-native applications that scale to millions of users&mdash;from
                                        multi-agent orchestration and RAG pipelines to systems shipping at{" "}
                                        <span className="font-semibold text-foreground">Apple</span> and{" "}
                                        <span className="font-semibold text-foreground">Walmart</span>.{" "}
                                        {"Whether you're scaling intelligent software or building custom AI infrastructure, I'd love to connect."}
                                    </AnimatedText>
                                </p>

                                <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
                                    <div className="text-center lg:text-left">
                                        <div className="font-mono text-lg font-bold text-primary sm:text-xl">Berkeley CS</div>
                                        <div className="mt-0.5 text-xs text-muted-foreground">Degree</div>
                                    </div>
                                    <div className="text-center lg:text-left">
                                        <div className="font-mono text-lg font-bold text-primary sm:text-xl">6 Papers</div>
                                        <div className="mt-0.5 text-xs text-muted-foreground">Published</div>
                                    </div>
                                    <div className="text-center lg:text-left">
                                        <div className="font-mono text-lg font-bold text-primary sm:text-xl">100M+</div>
                                        <div className="mt-0.5 text-xs text-muted-foreground">Users Impacted</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    )
}
