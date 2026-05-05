/**
 * Consulting client showcases — public sites and active engagements.
 */

import { gradients as g, accentCycle } from "@/lib/theme"

export interface ConsultingClient {
    id: string
    name: string
    /** Live public URL, or null when the site is not published yet */
    href: string | null
    /** Shown when href is null (e.g. status line) */
    statusLabel?: string
    summary: string
    tags: string[]
    gradient: string
    accent: string
    /** Optional card hero under `public/` (e.g. `/images/projects/lupfr-hero.png`) */
    coverImage?: string
}

export const consultingClients: ConsultingClient[] = [
    {
        id: "enrichdata",
        name: "EnrichData",
        href: "https://www.enrichdata.net/",
        coverImage: "/images/projects/enrichdata-hero.png",
        summary:
            "Public marketing and product story for a custom CRM enrichment offering—real-time-style data fills, job-change tracking, and quality maintenance for teams that want outcomes without bloated vendor contracts.",
        tags: ["Web", "CRM", "Next.js"],
        gradient: g.accentToCyan,
        accent: accentCycle[1],
    },
    {
        id: "lupfr",
        name: "LUPFR Entertainment",
        href: "https://lupfr.com",
        coverImage: "/images/projects/lupfr-hero.png",
        summary:
            "Consulting on web presence and digital experience for a San Francisco music events and talent platform — event pages, bookings flow, and brand storytelling online.",
        tags: ["Web", "Events", "Next.js"],
        gradient: g.primaryToAccent,
        accent: accentCycle[0],
    },
    {
        id: "w3sourcing",
        name: "W3 Sourcing",
        href: "https://www.w3sourcing.com/",
        coverImage: "/images/projects/w3sourcing-hero.png",
        summary:
            "Public web experience for a principal-led executive search firm serving VC-backed technology, legal, and finance leadership markets across the US, UK, EU, UAE, and Asia.",
        tags: ["Web", "Recruiting", "Next.js"],
        gradient: g.primaryToCyan,
        accent: accentCycle[2],
    },
]
