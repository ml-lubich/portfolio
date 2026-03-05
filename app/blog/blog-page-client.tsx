"use client"

import React, { useState, useMemo, useCallback, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import type { BlogPost } from "@/lib/blog-shared"
import { getTagsFromPosts } from "@/lib/blog-shared"
import { BlogCard } from "@/components/blog/blog-card"
import { BlogFilter, BlogSearch, BlogTagFilter } from "@/components/blog/blog-filter"
import { ArrowUpDown, ArrowUp, ArrowDown, Eye } from "lucide-react"

type SortOrder = "newest" | "oldest" | "popular"

function BlogPageInner({ blogPosts, totalViews }: { blogPosts: BlogPost[]; totalViews: string }) {
    const searchParams = useSearchParams()
    const router = useRouter()

    // Read category from URL (synced with BlogHeader nav links)
    const urlCategory = searchParams.get("category") ?? "All"
    const [category, setCategory] = useState(urlCategory)
    const [search, setSearch] = useState("")
    const [activeTags, setActiveTags] = useState<string[]>([])
    const [showTags, setShowTags] = useState(false)
    const [sortOrder, setSortOrder] = useState<SortOrder>("newest")

    // Sync category from URL when nav links are clicked
    useEffect(() => {
        setCategory(urlCategory)
    }, [urlCategory])

    // Update URL when category changes from the inline filter
    const handleCategoryChange = useCallback((cat: string) => {
        setCategory(cat)
        if (cat === "All") {
            router.push("/blog", { scroll: false })
        } else {
            router.push(`/blog?category=${encodeURIComponent(cat)}`, { scroll: false })
        }
    }, [router])

    const handleTagToggle = useCallback((tag: string) => {
        setActiveTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        )
    }, [])

    const cycleSortOrder = useCallback(() => {
        setSortOrder((prev) => {
            if (prev === "newest") return "oldest"
            if (prev === "oldest") return "popular"
            return "newest"
        })
    }, [])

    const filtered = useMemo(() => {
        let posts = [...blogPosts]

        // Category filter
        if (category !== "All") {
            posts = posts.filter((p) => p.category === category)
        }
        // Tag filter
        if (activeTags.length > 0) {
            posts = posts.filter((p) => activeTags.some((t) => p.tags.includes(t)))
        }
        // Search filter
        if (search.trim()) {
            const q = search.toLowerCase()
            posts = posts.filter(
                (p) =>
                    p.title.toLowerCase().includes(q) ||
                    p.excerpt.toLowerCase().includes(q) ||
                    p.tags.some((t) => t.toLowerCase().includes(q))
            )
        }

        // Sort
        if (sortOrder === "newest") {
            posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        } else if (sortOrder === "oldest") {
            posts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        } else if (sortOrder === "popular") {
            posts.sort((a, b) => parseInt(b.views) - parseInt(a.views))
        }

        return posts
    }, [category, search, activeTags, sortOrder])

    const [featured, ...remainingPosts] = filtered

    const sortLabel = sortOrder === "newest" ? "Newest first" : sortOrder === "oldest" ? "Oldest first" : "Most popular"
    const SortIcon = sortOrder === "newest" ? ArrowDown : sortOrder === "oldest" ? ArrowUp : Eye

    return (
        <div className="relative min-h-screen">
            {/* Subtle gradient orbs */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
                <div className="absolute -top-[300px] -left-[200px] h-[600px] w-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />
                <div className="absolute -bottom-[200px] -right-[200px] h-[500px] w-[500px] rounded-full bg-accent/[0.04] blur-[120px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-12"
                >
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                            blog.mishalubich.com
                        </div>
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
                            <Eye className="h-3 w-3" aria-hidden="true" />
                            <span suppressHydrationWarning>{totalViews} total views</span>
                        </div>
                    </div>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                        AI Engineering{" "}
                        <span className="gradient-text">Perspectives</span>
                    </h1>
                    <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
                        Controversial takes, hard-won lessons, and unfiltered opinions on modern
                        AI engineering. No hype — just what actually works in production.
                    </p>
                </motion.div>

                {/* Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="mb-6"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <BlogFilter activeCategory={category} onCategoryChange={handleCategoryChange} />
                        <div className="flex items-center gap-2">
                            <button
                                onClick={cycleSortOrder}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/20 hover:text-foreground"
                                aria-label={`Sort: ${sortLabel}`}
                            >
                                <SortIcon className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">{sortLabel}</span>
                            </button>
                            <div className="w-full sm:w-64">
                                <BlogSearch value={search} onChange={setSearch} />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tag toggle & filter */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.1 }}
                    className="mb-10"
                >
                    <button
                        onClick={() => setShowTags(!showTags)}
                        className="mb-3 inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-accent/20 hover:text-foreground"
                        aria-expanded={showTags}
                        aria-controls="tag-filters"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Filter by Tags
                        {activeTags.length > 0 && (
                            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">
                                {activeTags.length}
                            </span>
                        )}
                        <svg
                            className={`h-3 w-3 transition-transform duration-200 ${showTags ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <AnimatePresence>
                        {showTags && (
                            <motion.div
                                id="tag-filters"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-md">
                                    <BlogTagFilter activeTags={activeTags} onTagToggle={handleTagToggle} allTags={getTagsFromPosts(blogPosts)} />
                                    {activeTags.length > 0 && (
                                        <button
                                            onClick={() => setActiveTags([])}
                                            className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Clear all tags
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Featured post */}
                <AnimatePresence mode="wait">
                    {featured && (
                        <motion.div
                            key={featured.slug}
                            initial={{ opacity: 0, y: 10, scale: 0.99 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -5, scale: 0.99 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="mb-10"
                        >
                            <BlogCard post={featured} featured />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Grid */}
                {remainingPosts.length > 0 && (
                    <motion.div
                        layout
                        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        <AnimatePresence mode="popLayout">
                            {remainingPosts.map((post, i) => (
                                <motion.div
                                    key={post.slug}
                                    layout
                                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{
                                        duration: 0.2,
                                        delay: i * 0.03,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                >
                                    <BlogCard post={post} onTagClick={handleTagToggle} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Empty state */}
                {filtered.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-24 text-center"
                    >
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
                            <svg className="h-8 w-8 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No posts found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Try adjusting your search, category, or tag filters.
                        </p>
                        <button
                            onClick={() => {
                                handleCategoryChange("All")
                                setSearch("")
                                setActiveTags([])
                                setSortOrder("newest")
                            }}
                            className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/20 hover:text-foreground"
                        >
                            Reset all filters
                        </button>
                    </motion.div>
                )}

                {/* Post count */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-12 flex items-center justify-center gap-3 text-sm text-muted-foreground"
                >
                    <span>Showing {filtered.length} of {blogPosts.length} articles</span>
                    <span className="text-white/10">|</span>
                    <span className="inline-flex items-center gap-1">
                        <SortIcon className="h-3 w-3" />
                        {sortLabel}
                    </span>
                </motion.div>
            </div>
        </div>
    )
}

export function BlogPageClient({ blogPosts, totalViews }: { blogPosts: BlogPost[]; totalViews: string }) {
    return (
        <Suspense fallback={<div className="min-h-screen" />}>
            <BlogPageInner blogPosts={blogPosts} totalViews={totalViews} />
        </Suspense>
    )
}
