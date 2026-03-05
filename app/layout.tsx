import React from "react"
import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Cormorant_Garamond, Italiana } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

import './globals.css'
import { ScrollShimmer } from '@/components/scroll-shimmer'
import { BackgroundOrbs } from '@/components/background-orbs'

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

const italiana = Italiana({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-italiana',
})

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-cormorant',
})

const BASE_URL = "https://mishalubich.com"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Misha Lubich | AI Engineer & Technical Leader",
    template: "%s | Misha Lubich",
  },
  description:
    "Software Engineer and AI/ML Specialist building scalable solutions at Apple, GitHub, and beyond. Explore my portfolio of innovative projects and research.",
  keywords: [
    "AI Engineer",
    "Machine Learning",
    "Software Engineer",
    "MLOps",
    "LLM",
    "Deep Learning",
    "Full-Stack Developer",
    "Technical Leader",
    "Misha Lubich",
    "Portfolio",
  ],
  authors: [{ name: "Misha Lubich", url: BASE_URL }],
  creator: "Misha Lubich",
  publisher: "Misha Lubich",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Misha Lubich — AI Engineer",
    title: "Misha Lubich | AI Engineer & Technical Leader",
    description:
      "Software Engineer and AI/ML Specialist building scalable solutions at Apple, GitHub, and beyond.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Misha Lubich — AI Engineer & Technical Leader",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Misha Lubich | AI Engineer & Technical Leader",
    description:
      "Software Engineer and AI/ML Specialist building scalable solutions at Apple, GitHub, and beyond.",
    images: [`${BASE_URL}/og-image.png`],
  },
  alternates: {
    canonical: BASE_URL,
  },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/logo.png", type: "image/png" },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0c14',
  width: "device-width",
  initialScale: 1,
}

/* JSON-LD structured data for SEO */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Misha Lubich",
  url: BASE_URL,
  jobTitle: "AI Engineer & Technical Leader",
  sameAs: [
    "https://github.com/ml-lubich",
    "https://linkedin.com/in/mishalubich",
  ],
  knowsAbout: [
    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning",
    "MLOps",
    "Software Engineering",
    "LLM",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${jetbrains.variable} ${italiana.variable} ${cormorant.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased font-light">
        {/* Spectrum gradient background orbs */}
        <BackgroundOrbs />
        {/* Scroll-driven shine on gradient-text */}
        <ScrollShimmer />
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
