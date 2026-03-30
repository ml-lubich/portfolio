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
}

export const consultingClients: ConsultingClient[] = [
    {
        id: "lupfr",
        name: "LUPFR Entertainment",
        href: "https://lupfr.com",
        summary:
            "Consulting on web presence and digital experience for a San Francisco music events and talent platform — event pages, bookings flow, and brand storytelling online.",
        tags: ["Web", "Events", "Next.js"],
        gradient: g.primaryToAccent,
        accent: accentCycle[0],
    },
    {
        id: "going",
        name: "Going",
        href: null,
        statusLabel: "Site launching soon",
        summary:
            "Active consulting engagement — product web experience, performance, and integrations. Public URL will be linked here once the build is live.",
        tags: ["Consulting", "Web", "In progress"],
        gradient: g.accentToCyan,
        accent: accentCycle[2],
    },
]
