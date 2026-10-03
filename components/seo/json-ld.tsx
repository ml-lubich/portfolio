/** Renders the site JSON-LD @graph from lib/seo.ts as one script tag. */

import { jsonLd } from "@/lib/seo"

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  )
}
