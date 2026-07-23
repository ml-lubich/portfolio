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
    /** Optional card hero under `public/` (e.g. `/images/projects/lupfr-hero.jpg`) */
    coverImage?: string
    /** Brand/press impact highlights shown as chips on the card (the card links to `href`) */
    impact?: string[]
    /** Short, approved client proof shown on the engagement card. */
    quote?: string
}

export const consultingClients: ConsultingClient[] = [
    {
        id: "enrichdata",
        name: "EnrichData",
        href: "https://www.enrichdata.net/",
        coverImage: "/images/projects/enrichdata-hero.jpg",
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
        coverImage: "/images/projects/lupfr-hero.jpg",
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
            "Built the public site and a searchable layer over 965 live recruiting roles, with client identities masked to protect the firm's relationships and every response routed back to its principal.",
        impact: ["965 roles indexed", "Client identities protected"],
        quote: "Incredible work—can't believe you did that so fast.",
        tags: ["Web", "Recruiting", "Next.js"],
        gradient: g.primaryToCyan,
        accent: accentCycle[2],
    },
    {
        id: "eria",
        name: "ERIA Events",
        href: "https://www.eria.co/",
        coverImage: "/images/projects/eria-hero.jpg",
        summary:
            "Web presence for the San Francisco Bay's most coveted venues and experiences—a luxury events brand featured in Forbes and trusted by Google, Anthropic, Samsung, and Hilton. Live at eria.co and eriaevents.co.",
        impact: [
            "Offsites for Anthropic, Google & J&J",
            "Featured in Forbes",
        ],
        quote: "This looks so amazing. The collaboration was 1000× appreciated.",
        tags: ["Web", "Events", "Luxury"],
        gradient: g.primaryToRose,
        accent: accentCycle[3],
    },
]
