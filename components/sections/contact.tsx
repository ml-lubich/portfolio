"use client"

import dynamic from "next/dynamic"
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
  { icon: Calendar, label: "Schedule a Call", href: "https://cal.com/misha-lubich" },
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/misha-lubich/" },
  { icon: Github, label: "GitHub", href: "https://github.com/ml-lubich" },
  { icon: GraduationCap, label: "Google Scholar", href: "https://scholar.google.com/citations?hl=en&user=Be6ZA78AAAAJ" },
]

export function Contact() {
  return (
    <AnimatedSection id="contact" className="relative py-9 md:py-14 lg:py-20 overflow-hidden">
      {/* 3D particle field background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-15" aria-hidden="true">
        <ParticleField color="#a855f7" speed={0.08} />
      </div>

      <div className="relative mx-auto max-w-4xl px-3 md:px-6">
        <SectionHeader
          label="Let's Connect"
          title={<>Ready to collaborate on{" "}<span className="gradient-text">innovative projects</span></>}
          subtitle="Ready to collaborate on innovative projects and drive technical excellence"
        />

        <div className="grid gap-4 sm:grid-cols-2 md:gap-6">
          {/* Contact info */}
          <AnimatedSection delay={100}>
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
                    <item.icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm font-medium text-foreground transition-colors hover:text-primary"
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
                <div className="grid grid-cols-2 gap-2">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm text-white/80 transition-colors hover:border-white/20 hover:text-white"
                    >
                      <link.icon className="h-4 w-4" />
                      <span className="text-xs">{link.label}</span>
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
