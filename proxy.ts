import { NextRequest, NextResponse } from "next/server"

const STATIC_EXT =
  /\.(?:webm|mp4|svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|txt|xml|json)$/i

/**
 * Proxy for subdomain routing (Next.js proxy convention).
 * This project uses proxy.ts only — do not add middleware.ts (Next detects both and errors).
 *
 * Routes requests from blog.mishalubich.com → /blog/*
 * while keeping the main domain routes intact.
 *
 * Static assets under /public (e.g. /media/*, /images/*) must never be rewritten
 * to /blog/* or 404s occur for shared assets on the blog subdomain.
 */
export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") || ""
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/media/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/fonts/") ||
    STATIC_EXT.test(pathname)
  ) {
    return NextResponse.next()
  }

  const isBlogSubdomain =
    hostname.startsWith("blog.") || hostname.startsWith("blog-")

  if (isBlogSubdomain) {
    if (pathname.startsWith("/blog")) {
      return NextResponse.next()
    }

    const url = request.nextUrl.clone()
    if (pathname === "/") {
      url.pathname = "/blog"
    } else {
      url.pathname = `/blog${pathname}`
    }
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|media/|images/|fonts/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webm|mp4|woff2?|ttf|txt|xml|json)$).*)",
  ],
}
