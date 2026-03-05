/**
 * One-time migration script: extracts blog posts from blog-data.ts
 * into individual MDX files in content/blog/
 *
 * Handles:
 *  - Template literal backtick escaping (\` → `)
 *  - Converts ```chart blocks to ```mermaid
 *  - Preserves all markdown content
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")

const raw = fs.readFileSync(path.join(ROOT, "lib/blog-data.ts"), "utf-8")

const lines = raw.split("\n")
const posts = []
let currentPost = null
let contentLines = []
let inContent = false

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]

  const slugMatch = line.match(/^\s*slug:\s*"([^"]+)"/)
  if (slugMatch) {
    currentPost = { slug: slugMatch[1], title: "", excerpt: "", date: "", category: "", tags: [], coverImage: "", content: "" }
    inContent = false
    continue
  }

  if (!currentPost) continue

  if (!inContent) {
    const titleMatch = line.match(/^\s*title:\s*"((?:[^"\\]|\\.)*)"/)
    if (titleMatch) { currentPost.title = titleMatch[1]; continue }

    const excerptStartMatch = line.match(/^\s*excerpt:\s*$/)
    if (excerptStartMatch) {
      let excerpt = ""
      i++
      while (i < lines.length) {
        const l = lines[i].trim()
        if (l.endsWith('",') || (l.endsWith('"') && !l.endsWith('\\"'))) {
          excerpt += " " + l.replace(/^"/, "").replace(/",?\s*$/, "")
          break
        }
        excerpt += " " + l.replace(/^"/, "").replace(/"$/, "")
        i++
      }
      currentPost.excerpt = excerpt.trim()
      continue
    }
    const excerptInline = line.match(/^\s*excerpt:\s*"((?:[^"\\]|\\.)*)"/)
    if (excerptInline) { currentPost.excerpt = excerptInline[1]; continue }

    const dateMatch = line.match(/^\s*date:\s*"([^"]+)"/)
    if (dateMatch) { currentPost.date = dateMatch[1]; continue }

    const categoryMatch = line.match(/^\s*category:\s*"([^"]+)"/)
    if (categoryMatch) { currentPost.category = categoryMatch[1]; continue }

    const tagsMatch = line.match(/^\s*tags:\s*\[([^\]]+)\]/)
    if (tagsMatch) {
      currentPost.tags = tagsMatch[1].split(",").map(t => t.trim().replace(/"/g, ""))
      continue
    }

    const coverMatch = line.match(/^\s*coverImage:\s*"([^"]+)"/)
    if (coverMatch) { currentPost.coverImage = coverMatch[1]; continue }

    if (line.match(/^\s*content:\s*`/)) {
      inContent = true
      contentLines = []
      const afterBacktick = line.replace(/^\s*content:\s*`/, "")
      if (afterBacktick) contentLines.push(afterBacktick)
      continue
    }
  }

  if (inContent) {
    if (line.match(/^`\s*,?\s*$/)) {
      let content = contentLines.join("\n")
      // Unescape template literal
      content = content.replace(/\\`/g, "`")
      content = content.replace(/\\\$/g, "$")
      // Convert ```chart to ```mermaid
      content = content.replace(/```chart/g, "```mermaid")

      currentPost.content = content
      inContent = false

      if (currentPost.slug) {
        posts.push({ ...currentPost })
      }
      currentPost = null
      continue
    }
    contentLines.push(line)
  }
}

console.log(`Found ${posts.length} posts`)

const outDir = path.join(ROOT, "content/blog")
fs.mkdirSync(outDir, { recursive: true })

for (const post of posts) {
  const safeExcerpt = post.excerpt.replace(/"/g, '\\"')
  const safeTitle = post.title.replace(/"/g, '\\"')

  const frontmatter = `---
title: "${safeTitle}"
excerpt: "${safeExcerpt}"
date: "${post.date}"
category: "${post.category}"
tags: [${post.tags.map(t => `"${t}"`).join(", ")}]
coverImage: "${post.coverImage}"
---`

  const mdxContent = `${frontmatter}\n\n${post.content.trim()}\n`
  const filePath = path.join(outDir, `${post.slug}.mdx`)
  fs.writeFileSync(filePath, mdxContent)
  console.log(`  ✓ ${post.slug}.mdx (${post.content.length} chars)`)
}

console.log(`\nDone! Created ${posts.length} MDX files in content/blog/`)
