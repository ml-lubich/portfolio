"use client"

import React from "react"
import { BLOG_CATEGORIES } from "@/lib/blog-shared"
import { shadows } from "@/lib/theme"

interface BlogFilterProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function BlogFilter({ activeCategory, onCategoryChange }: BlogFilterProps) {
  return (
    <div
      className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto overscroll-x-contain px-1 py-0.5 [scrollbar-width:none] sm:-mx-0 sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Filter posts by category"
    >
      {BLOG_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          role="tab"
          aria-selected={activeCategory === cat}
          aria-label={`Filter by ${cat}`}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${activeCategory === cat
            ? `bg-primary text-primary-foreground shadow-[${shadows.filterActive}]`
            : "border border-white/[0.06] bg-white/[0.03] text-muted-foreground backdrop-blur-sm hover:border-primary/30 hover:text-foreground hover:bg-white/[0.06]"
            }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

interface BlogTagFilterProps {
  activeTags: string[]
  onTagToggle: (tag: string) => void
  allTags: string[]
}

export function BlogTagFilter({ activeTags, onTagToggle, allTags }: BlogTagFilterProps) {

  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter posts by tag">
      {allTags.map((tag) => {
        const isActive = activeTags.includes(tag)
        return (
          <button
            key={tag}
            onClick={() => onTagToggle(tag)}
            aria-pressed={isActive}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-300 ${isActive
              ? `bg-accent/20 text-accent border border-accent/40 shadow-[${shadows.filterTag}]`
              : "border border-white/[0.04] bg-white/[0.02] text-muted-foreground/70 backdrop-blur-sm hover:border-accent/20 hover:text-muted-foreground hover:bg-white/[0.04]"
              }`}
          >
            #{tag}
          </button>
        )
      })}
    </div>
  )
}

interface BlogSearchProps {
  value: string
  onChange: (value: string) => void
}

export function BlogSearch({ value, onChange }: BlogSearchProps) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder="Search articles..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search blog articles"
        className="h-10 w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2 pl-10 pr-4 text-sm text-foreground backdrop-blur-sm placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
      />
    </div>
  )
}
