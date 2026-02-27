import { NextRequest, NextResponse } from "next/server"

/**
 * Middleware for subdomain routing.
 *
 * Routes requests from blog.mishalubich.com → /blog/*
 * while keeping the main domain routes intact.
 */
export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || ""
  const { pathname } = request.nextUrl

  // Check if this is a blog subdomain request
  const isBlogSubdomain =
    hostname.startsWith("blog.") ||
    hostname.startsWith("blog-")

  if (isBlogSubdomain) {
    // If already on /blog path, let it through
    if (pathname.startsWith("/blog")) {
      return NextResponse.next()
    }

    // Rewrite root and other paths to /blog
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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
