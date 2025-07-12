import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Misha Lubich - Software Engineer & Technical Leader",
  description:
    "Results-oriented Software Engineer with extensive experience in test automation, backend development, and CI/CD pipeline optimization at industry leaders like Apple and Walmart.",
  keywords: "software engineer, test automation, backend development, CI/CD, Apple, Walmart, UC Berkeley, misha lubich",
  authors: [{ name: "Misha Lubich" }],
  openGraph: {
    title: "Misha Lubich - Software Engineer & Technical Leader",
    description:
      "Results-oriented Software Engineer with extensive experience in test automation, backend development, and CI/CD pipeline optimization.",
    url: "https://mishalubich.com",
    siteName: "Misha Lubich Portfolio",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
