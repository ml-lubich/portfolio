import React from "react"
import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Cormorant_Garamond, Italiana } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

import './globals.css'
import { ScrollShimmer } from '@/components/scroll-shimmer'
import { BackgroundOrbs } from '@/components/background-orbs'
import { JsonLd } from '@/components/seo/json-ld'

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

const italiana = Italiana({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-italiana',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
})

import { SITE_URL } from "@/lib/site-config"
const BASE_URL = SITE_URL

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Misha Lubich | AI Engineer & Technical Leader — Portfolio",
    template: "%s | Misha Lubich",
  },
  description:
    "Misha Lubich is a Senior AI Engineer and Technical Leader with experience at Apple, GitHub, and top-tier startups. Explore projects in machine learning, MLOps, LLMs, deep learning, and full-stack development.",
  keywords: [
    "AI Engineer",
    "Machine Learning Engineer",
    "Software Engineer",
    "MLOps",
    "LLM",
    "Large Language Models",
    "Deep Learning",
    "Full-Stack Developer",
    "Technical Leader",
    "Misha Lubich",
    "Portfolio",
    "Artificial Intelligence",
    "Natural Language Processing",
    "Computer Vision",
    "Data Science",
    "Python",
    "TypeScript",
    "React",
    "Next.js",
    "Neural Networks",
    "Transformer Models",
    "Apple Engineer",
    "GitHub Engineer",
    "AI Portfolio",
    "ML Engineer Portfolio",
  ],
  authors: [{ name: "Misha Lubich", url: BASE_URL }],
  creator: "Misha Lubich",
  publisher: "Misha Lubich",
  category: "technology",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Misha Lubich — AI Engineer & Technical Leader",
    title: "Misha Lubich | AI Engineer & Technical Leader",
    description:
      "Senior AI Engineer building scalable ML systems at Apple, GitHub, and beyond. Explore innovative projects, research publications, and engineering insights.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Misha Lubich — AI Engineer & Technical Leader Portfolio",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Misha Lubich | AI Engineer & Technical Leader",
    description:
      "Senior AI Engineer building scalable ML systems at Apple, GitHub, and beyond. Projects, research & insights.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        alt: "Misha Lubich — AI Engineer & Technical Leader Portfolio",
      },
    ],
    creator: "@mishalubich",
  },
  alternates: {
    canonical: BASE_URL,
    types: {
      "application/rss+xml": `${BASE_URL}/feed.xml`,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/favicon/site.webmanifest",
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0c14' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" dir="ltr" className={`${GeistSans.variable} ${GeistMono.variable} ${jetbrains.variable} ${italiana.variable} ${cormorant.variable}`}>
      <head>
        {/* Preconnect only to origins used on initial load. Google Fonts are bundled by next/font; Unsplash is used only on blog. */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <JsonLd />
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
