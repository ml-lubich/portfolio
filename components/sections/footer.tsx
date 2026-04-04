"use client"

import Link from "next/link"
import Image from "next/image"
import { AnimatedSection } from "../animations/animated-section"
import { AnimatedText } from "../animations/animated-text"

const footerLinks = [
  { href: "/#about", label: "About" },
  { href: "/#consulting", label: "Consulting" },
  { href: "/#testimonials", label: "Clients" },
  { href: "/#projects", label: "Projects" },
  { href: "/#skills", label: "Skills" },
  { href: "/blog", label: "Blog" },
  { href: "/#contact", label: "Contact" },
]

const socialLinks = [
  { href: "https://github.com/ml-lubich", label: "GitHub", rel: "noopener noreferrer me" },
  { href: "https://www.linkedin.com/in/misha-lubich/", label: "LinkedIn", rel: "noopener noreferrer me" },
]

export function Footer() {
  return (
    <footer role="contentinfo" aria-label="Site footer" className="border-t border-border py-10">
      <div className="mx-auto max-w-6xl px-6">
        <AnimatedSection>
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-[8px] overflow-hidden">
                <Image src="/logo.png" alt="Misha Lubich logo" width={36} height={36} sizes="36px" className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div>
                <span className="block text-sm font-medium text-white">
                  <AnimatedText text="Misha Lubich" variant="blur-slide" stagger={50} duration={600} />
                </span>
                <span className="block text-xs text-muted-foreground">
                  <AnimatedText text="AI Engineer & Technical Leader" variant="fade-up" delay={150} stagger={25} duration={500} />
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav aria-label="Footer navigation">
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {footerLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-xs text-muted-foreground transition-colors hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Social */}
            <nav aria-label="Social links">
              <ul className="flex gap-4">
                {socialLinks.map(({ href, label, rel }) => (
                  <li key={href}>
                    <a href={href} target="_blank" rel={rel} className="text-xs text-muted-foreground transition-colors hover:text-white">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/[0.04] pt-6 sm:flex-row sm:flex-wrap">
            <p className="text-xs text-muted-foreground">
              <AnimatedText text={`© ${new Date().getFullYear()} Misha Lubich. All rights reserved.`} variant="fade-up" stagger={15} duration={500} />
            </p>
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:justify-start">
              <Link href="/privacy" className="transition-colors hover:text-white">
                Privacy Policy
              </Link>
              <span className="text-border" aria-hidden="true">
                ·
              </span>
              <Link href="/terms" className="transition-colors hover:text-white">
                Terms of Use
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              <AnimatedText text="Built with Next.js & Tailwind CSS" variant="fade-up" delay={100} stagger={20} duration={500} />
            </p>
          </div>
        </AnimatedSection>
      </div>
    </footer>
  )
}
