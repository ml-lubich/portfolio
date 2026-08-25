"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import { Mail, Phone, MapPin, Calendar, Linkedin, Github, GraduationCap } from "lucide-react"
import { AnimatedSection } from "../animations/animated-section"
import { SectionHeader } from "../layout/section-header"

const ParticleField = dynamic(
  () => import("../three/scene-backgrounds").then((mod) => mod.ParticleField),
  { ssr: false }
)

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "michaelle.lubich@gmail.com",
    href: "mailto:michaelle.lubich@gmail.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (415) 275-0094",
    href: "tel:+14152750094",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "San Francisco Bay Area",
    href: null,
  },
]

const socialLinks = [
  { icon: Calendar, label: "Schedule a Call", href: "https://calendar.app.google/T2VGkBsBAUzGABRB7" },
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/misha-lubich/" },
  { icon: Github, label: "GitHub", href: "https://github.com/ml-lubich" },
  { icon: GraduationCap, label: "Google Scholar", href: "https://scholar.google.com/citations?hl=en&user=Be6ZA78AAAAJ" },
]

export function Contact() {
  return (
    <AnimatedSection id="contact" className="relative section-y overflow-hidden">
      {/* 3D particle field background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-15" aria-hidden="true">
        <ParticleField color="#a855f7" speed={0.08} />
      </div>

      <div className="relative mx-auto max-w-5xl px-3 md:px-6">
        <SectionHeader
          label="Let's Connect"
          title={<>Ready to collaborate on{" "}<span className="gradient-text">innovative projects</span></>}
          subtitle="Ready to collaborate on innovative projects and drive technical excellence"
        />

        <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {/* Portrait — puts a face on the section people actually act from.
              A portrait column, not a wide band: the source is 4:5, so a
              letterbox crop would take the top of the head off. */}
          <AnimatedSection delay={50} className="sm:col-span-2 lg:col-span-1">
            <div className="group/photo relative mx-auto aspect-[4/5] w-full max-w-[20rem] overflow-hidden rounded-2xl border border-white/20 shadow-2xl shadow-black/50 ring-1 ring-inset ring-white/10 sm:max-w-[22rem] lg:max-w-none">
              <Image
                src="/misha-loft-window.png"
                alt="Misha Lubich in the studio"
                width={1120}
                height={1400}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover/photo:scale-105"
                style={{ objectPosition: "center center" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden />
            </div>
          </AnimatedSection>

          {/* Contact info */}
          <AnimatedSection delay={100}>
            <div className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-6">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
                    <item.icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="block break-all text-sm font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Social + Calendar */}
          <AnimatedSection delay={200}>
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold text-foreground">Schedule a Meeting</h3>
              <p className="text-sm text-muted-foreground">
                {"Book a time that works best for you - let's discuss your project or collaboration opportunities"}
              </p>

              <div className="flex flex-1 flex-col justify-end gap-3">
                <p className="text-xs text-muted-foreground">Or find me on these platforms</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-xs text-white/80 transition-colors hover:border-white/20 hover:text-white"
                    >
                      <link.icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate whitespace-nowrap">{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </AnimatedSection>
  )
}
