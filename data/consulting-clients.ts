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
    /** Sector line shown on the card's HUD strip */
    sector: string
    /** What the engagement actually covered — listed on the card's flipped back face */
    deliverables: string[]
}

export const consultingClients: ConsultingClient[] = [
    {
        id: "enrichdata",
        name: "EnrichData",
        href: "https://www.enrichdata.net/",
        coverImage: "/images/projects/enrichdata-hero.jpg",
        summary:
            "Public marketing and product story for a custom CRM enrichment offering—real-time-style data fills, job-change tracking, and quality maintenance for teams that want outcomes without bloated vendor contracts.",
        sector: "Data / CRM",
        impact: [
            "Real-time-style contact enrichment",
            "Job-change tracking built in",
        ],
        deliverables: [
            "Marketing site and product story from scratch",
            "Enrichment and job-change tracking product narrative",
            "Pricing and consultation booking flow",
        ],
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
        sector: "Music / Nightlife",
        impact: [
            "San Francisco music events platform",
            "Bookings flow for artists and venues",
        ],
        deliverables: [
            "Event pages and artist roster experience",
            "Bookings enquiry flow end to end",
            "Brand storytelling and web presence",
        ],
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
        sector: "Executive Search",
        impact: [
            "US, UK, EU, UAE & Asia coverage",
            "Principal-led search practice",
        ],
        deliverables: [
            "Practice, methodology, and results pages",
            "Leadership and portfolio-team positioning",
            "Enquiry capture for retained search",
        ],
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
        sector: "Luxury Events",
        impact: [
            "Offsites for Anthropic, Google & J&J",
            "Featured in Forbes",
        ],
        deliverables: [
            "Venue and experience showcase pages",
            "Enquiry and booking journey",
            "Luxury brand presentation across eria.co and eriaevents.co",
        ],
        tags: ["Web", "Events", "Luxury"],
        gradient: g.primaryToRose,
        accent: accentCycle[3],
    },
]
