"use client"

import Image from "next/image"
import { SiApple, SiGithub, SiHonda } from "react-icons/si"

type Logo = {
  name: string
  href: string
  mark: React.ReactNode
}

const iconClass = "h-7 w-7 sm:h-8 sm:w-8"
const imageClass = "h-7 w-auto object-contain sm:h-8"

const LOGOS: Logo[] = [
  { name: "Apple", href: "https://www.apple.com", mark: <SiApple className={iconClass} /> },
  { name: "GitHub", href: "https://github.com", mark: <SiGithub className={iconClass} /> },
  {
    name: "UC Berkeley",
    href: "https://www.berkeley.edu",
    mark: <Image src="/logos/uc-berkeley.svg" alt="" width={430} height={135} className={imageClass} />,
  },
  { name: "Honda Innovations", href: "https://www.hondainnovations.com", mark: <SiHonda className={iconClass} /> },
  {
    name: "LUPFR Entertainment",
    href: "https://lupfr.com",
    mark: <Image src="/logos/lupfr-mark.png" alt="" width={256} height={256} className={imageClass} />,
  },
  {
    name: "EnrichData",
    href: "https://www.enrichdata.net/",
    mark: <Image src="/logos/enrichdata.png" alt="" width={256} height={256} className={imageClass} />,
  },
  {
    name: "W3 Sourcing",
    href: "https://www.w3sourcing.com/",
    mark: <Image src="/logos/w3sourcing.png" alt="" width={920} height={360} className={imageClass} />,
  },
  {
    name: "ERIA",
    href: "https://www.eria.co/",
    mark: <Image src="/logos/eria.png" alt="" width={256} height={256} className={imageClass} />,
  },
  {
    name: "Seaside",
    href: "https://seaside.la",
    mark: <Image src="/logos/seaside.svg" alt="" width={256} height={256} className={imageClass} />,
  },
]

const STRIP = [...LOGOS, ...LOGOS, ...LOGOS]

function LogoSet({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {STRIP.map((logo, i) => (
        <a
          key={`${logo.name}-${i}`}
          href={logo.href}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={hidden ? -1 : undefined}
          className="flex h-16 min-w-32 shrink-0 items-center justify-center px-8 text-foreground opacity-55 grayscale transition duration-300 hover:opacity-90 hover:grayscale-0 sm:min-w-40 sm:px-10"
          aria-label={logo.name}
        >
          {logo.mark}
        </a>
      ))}
    </div>
  )
}

export function LogoScroll() {
  return (
    <section
      id="partners"
      className="relative overflow-hidden border-y border-white/[0.055] bg-background py-1"
      aria-label="Companies and institutions"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-28" />
      <div className="logo-marquee-track flex w-max will-change-transform">
        <LogoSet />
        <LogoSet hidden />
      </div>
    </section>
  )
}
