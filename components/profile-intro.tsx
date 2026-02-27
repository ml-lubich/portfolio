"use client"

import Image from "next/image"
import { AnimatedSection } from "./animated-section"

export function ProfileIntro() {
    return (
        <section className="relative py-16 sm:py-24">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
                <AnimatedSection>
                    {/* Translucent glass card */}
                    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-xl sm:p-10 md:p-12">
                        {/* Subtle corner accent */}
                        <div
                            className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-30 blur-3xl"
                            style={{ background: "radial-gradient(circle, hsl(217 91% 60% / 0.2), transparent 70%)" }}
                            aria-hidden="true"
                        />
                        <div
                            className="pointer-events-none absolute -bottom-16 -left-16 h-32 w-32 rounded-full opacity-20 blur-3xl"
                            style={{ background: "radial-gradient(circle, hsl(280 70% 55% / 0.15), transparent 70%)" }}
                            aria-hidden="true"
                        />

                        <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-10">
                            {/* Profile photo — elongated vertical oval */}
                            <div className="relative shrink-0">
                                <div
                                    className="h-36 w-24 overflow-hidden border border-white/[0.08] shadow-lg shadow-black/20 sm:h-44 sm:w-28"
                                    style={{ borderRadius: "50% / 46%" }}
                                >
                                    <Image
                                        src="/profile.jpg"
                                        alt="Misha Lubich"
                                        width={112}
                                        height={176}
                                        className="h-full w-full object-cover object-top"
                                        priority={false}
                                    />
                                </div>
                            </div>

                            {/* Open letter intro */}
                            <div className="text-center sm:text-left">
                                {/* Header — clean display font */}
                                <h2 className="font-display text-2xl font-light tracking-tight text-foreground sm:text-3xl">
                                    Hello, I&rsquo;m Misha
                                </h2>

                                {/* Thin separator */}
                                <div className="mx-auto mt-3 h-px w-12 bg-gradient-to-r from-transparent via-primary/40 to-transparent sm:mx-0 sm:w-16" />

                                {/* Body — clean sans-serif (Geist Sans) */}
                                <p className="mt-5 text-base font-light leading-relaxed tracking-normal text-muted-foreground sm:text-lg">
                                    I architect AI-driven, cloud-native applications that scale to millions of users&mdash;from
                                    multi-agent orchestration and RAG pipelines to production systems shipping at{" "}
                                    <span className="font-normal text-foreground/90">Braintrust Data</span>,{" "}
                                    <span className="font-normal text-foreground/90">Apple</span>, and{" "}
                                    <span className="font-normal text-foreground/90">Walmart</span>.
                                    If you&rsquo;re exploring the frontier of intelligent software, I&rsquo;d love to connect.
                                </p>

                                {/* Signature line */}
                                <p className="mt-5 font-mono text-xs tracking-widest uppercase text-muted-foreground/50">
                                    Berkeley CS &nbsp;&middot;&nbsp; 6 published papers &nbsp;&middot;&nbsp; 100 M+ users impacted
                                </p>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    )
}
