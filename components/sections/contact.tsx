"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import { Mail, Phone, MapPin, Calendar, Linkedin, Github, GraduationCap, BookOpen } from "lucide-react"
import { AnimatedSection } from "../animations/animated-section"
import { SectionHeader } from "../layout/section-header"
import { XIcon } from "../social-icons"

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

function OrcidIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.016-5.325 5.016h-3.919V7.416zm1.444 1.306v7.428h2.244c2.531 0 3.822-1.444 3.822-3.712 0-2.016-1.169-3.716-3.8-3.716h-2.266z" />
    </svg>
  )
}

const socialLinks = [
  { icon: Calendar, label: "Schedule a Call", href: "https://calendar.app.google/T2VGkBsBAUzGABRB7" },
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/misha-lubich/" },
  { icon: XIcon, label: "X", href: "https://x.com/Machine_Lubich" },
  { icon: BookOpen, label: "Substack", href: "https://mlubich.substack.com" },
  { icon: Github, label: "GitHub", href: "https://github.com/ml-lubich" },
  { icon: GraduationCap, label: "Google Scholar", href: "https://scholar.google.com/citations?hl=en&user=Be6ZA78AAAAJ" },
  { icon: OrcidIcon, label: "ORCID", href: "https://orcid.org/0000-0003-2329-4454" },
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
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/2wBDACgcHiMeGSgjISMtKygwPGRBPDc3PHtYXUlkkYCZlo+AjIqgtObDoKrarYqMyP/L2u71////m8H////6/+b9//j/2wBDASstLTw1PHZBQXb4pYyl+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj/wAARCAAUABADASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAABAACA//EABcQAQEBAQAAAAAAAAAAAAAAAAABAgP/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/ADYpPPQWa7Y2ijSty1IH/9k="
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
