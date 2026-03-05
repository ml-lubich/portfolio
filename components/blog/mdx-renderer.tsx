"use client"

import React from "react"
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote"
import { mdxComponents } from "@/components/blog/mdx-components"

interface MdxRendererProps {
    source: MDXRemoteSerializeResult
}

/**
 * Client-side MDX renderer. Takes pre-serialized MDX and renders it
 * with all custom components (Callout, Video, Figure, etc.) and
 * beautiful prose styling.
 */
export function MdxRenderer({ source }: MdxRendererProps) {
    return (
        <div className="blog-prose mdx-content">
            <MDXRemote {...source} components={mdxComponents} />
        </div>
    )
}
