import React, { Suspense } from "react"
import type { Metadata } from "next"
import { BlogHeader } from "@/components/blog/blog-header"
import { shadows } from "@/lib/theme"

export const metadata: Metadata = {
  title: "Blog | Misha Lubich — AI Engineering Perspectives",
  description:
    "Controversial takes and deep dives on modern AI engineering, LLMs, MLOps, and the future of software development.",
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative z-10 min-h-screen">
      <Suspense fallback={null}>
        <BlogHeader />
      </Suspense>
      <main id="main-content" className="pt-20" role="main">{children}</main>

      {/* Blog footer */}
      <footer className="border-t border-white/[0.06] py-10" role="contentinfo">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent shadow-[${shadows.blogAvatar.replace('20px', '12px')}]`}>
                <span className="text-xs font-bold text-primary-foreground">ML</span>
              </div>
              <span className="text-xs text-muted-foreground">blog.mishalubich.com</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Opinions are my own. Built with Next.js &amp; Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
