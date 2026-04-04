"use client"

import Image from "next/image"

/** Single source of truth for header-style logo markup (SSR + client must match). */
export function SiteLogoMark({
  width,
  height,
  sizes,
  className = "h-full w-full object-cover",
  alt = "Misha Lubich logo",
  loading,
  suppressHydrationWarning,
}: {
  width: number
  height: number
  sizes: string
  className?: string
  alt?: string
  loading?: "lazy" | "eager"
  suppressHydrationWarning?: boolean
}) {
  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      {...(loading ? { loading } : {})}
      {...(suppressHydrationWarning ? { suppressHydrationWarning: true } : {})}
    />
  )
}
