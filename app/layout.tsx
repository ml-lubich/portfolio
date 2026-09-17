import React from "react"
import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Oxanium } from 'next/font/google'

import './globals.css'
import { JsonLd } from '@/components/seo/json-ld'
import { LiquidGooFilter } from '@/components/glass-blob-field'
import { MLBot } from "@/components/ai-chat/mlbot"
import { AgentsBuildEgg } from "@/components/easter/agents-build"
import { ThemeProvider } from "@/components/theme-provider"
import { LIGHT_MODE_ENABLED } from "@/lib/light-mode"

/* Two families, matching josephheupler.com. The page used to load seven, three
   of them literary serifs, which is what read as "too literate" — the wordmark
   rendered as a display serif over a wireframe brain. Oxanium is the squarish
   variable face (200–800, so real weights and no synthesis) that carries
   headings and running text alike; JetBrains Mono keeps the eyebrows, labels
   and terminals it already had. See docs/DESIGN.md for what was dropped. */

const oxanium = Oxanium({
  subsets: ['latin'],
  variable: '--font-oxanium',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

import {
  SITE_URL,
  SITE_DEFAULT_OG_IMAGE,
  SITE_DEFAULT_OG_IMAGE_SIZE,
} from "@/lib/site-config"
const BASE_URL = SITE_URL

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Misha Lubich | Staff AI Engineer — Portfolio",
    template: "%s | Misha Lubich",
  },
  description:
    "Misha Lubich is a Staff AI Engineer at EchoStar, previously Apple, Walmart and Lawrence Berkeley National Lab. Explore projects in machine learning, MLOps, LLMs, agents, and full-stack development.",
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
    siteName: "Misha Lubich — Staff AI Engineer",
    title: "Misha Lubich | Staff AI Engineer",
    description:
      "Staff AI Engineer at EchoStar building production AI pipelines, previously Apple and Walmart. Explore innovative projects, research publications, and engineering insights.",
    images: [
      {
        url: SITE_DEFAULT_OG_IMAGE,
        width: SITE_DEFAULT_OG_IMAGE_SIZE.width,
        height: SITE_DEFAULT_OG_IMAGE_SIZE.height,
        alt: "Misha Lubich — Staff AI Engineer Portfolio",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Misha Lubich | Staff AI Engineer",
    description:
      "Staff AI Engineer at EchoStar building production AI pipelines, previously Apple and Walmart. Projects, research & insights.",
    images: [
      {
        url: SITE_DEFAULT_OG_IMAGE,
        alt: "Misha Lubich — Staff AI Engineer Portfolio",
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
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon/favicon.ico",
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
    <html lang="en" dir="ltr" suppressHydrationWarning className={`${oxanium.variable} ${jetbrains.variable}`}>
      <head>
        {/* Preconnect only to origins used on initial load. Google Fonts are bundled by next/font; Unsplash is used only on blog. */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <JsonLd />
      </head>
      <body className="font-sans antialiased font-light">
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme={LIGHT_MODE_ENABLED ? undefined : "dark"}
          disableTransitionOnChange
        >
          <LiquidGooFilter />
          {children}
          <MLBot />
          <AgentsBuildEgg />
        </ThemeProvider>
      </body>
    </html>
  )
}
