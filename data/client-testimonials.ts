/**
 * Direct feedback from consulting / build engagements — not third‑party review platforms.
 * Quotes are paraphrased or approved summaries; attributions match real relationships.
 */

export interface ClientTestimonial {
    id: string
    quote: string
    name: string
    title: string
    organization: string
    /** Direct engagement score (not a third‑party review site) */
    rating: 4 | 4.5 | 5
    /** Optional headshot under `public/` */
    avatarSrc?: string
    avatarAlt?: string
    /** Optional landscape site-preview thumbnail under `public/` (used for org / team attributions) */
    siteImageSrc?: string
    siteImageAlt?: string
}

export const clientTestimonials: ClientTestimonial[] = [
    {
        id: "nikita-tech",
        quote:
            "Working with Misha on systems & automation is a breath of fresh air — zero fluff, bulletproof architecture, and pragmatic AI integration that actually delivers real business ROI.",
        name: "Nikita Khanderia",
        title: "Technical Partner & Lead Engineer",
        organization: "ERIA",
        rating: 5,
        avatarSrc: "/images/testimonials/nikita.webp",
        avatarAlt: "Nikita Khanderia",
    },
    {
        id: "will-lupfer",
        quote:
            "Misha got our public site somewhere we’re actually excited to send artists and venues — like, it finally feels like *us*. Lead routing + little follow-up nudges mean ops isn’t drowning in the inbox anymore. AI bits were grounded (drafting + structure for event copy), not some black-box thing. We’d gotten a couple of wild ‘AI transformation’ quotes; his rate was so much saner we’re saving real money this year vs going that route. Huge relief!!",
        name: "Will Lupfer",
        title: "Co-founder & operations",
        organization: "LUPFR Entertainment",
        rating: 5,
        avatarSrc: "/images/testimonials/will-lupfer.png",
        avatarAlt: "Will Lupfer",
    },
    {
        id: "joseph-heupler",
        quote:
            "Misha streamlined our service operations and customer tech workflows with fast, robust tooling. Technical execution was sharp, reliable, and delivered right on budget.",
        name: "Joseph Heupler",
        title: "AI Lead",
        organization: "Brio Water",
        rating: 5,
        avatarSrc: "/images/testimonials/joseph-heupler.webp",
        avatarAlt: "Joseph Heupler",
    },
    {
        id: "enrichdata-team",
        quote:
            "He tightened how we tell the enrichment story — demo, field catalog, limits — so prospects see the product, not vapor. Spec-to-handoff automation cut the copy-paste tax across tools. Enterprise data consultants and AI shops were quoting big retainers for thin output; his pricing was fair and predictable, which let us keep spend under control and steer budget back into engineering. Professional, no drama.",
        name: "Founding team",
        title: "GTM & product",
        organization: "EnrichData",
        rating: 4.5,
        siteImageSrc: "/images/testimonials/enrichdata-site.png",
        siteImageAlt: "EnrichData website",
    },
    {
        id: "going-product",
        quote:
            "Still pre-launch tbh — Misha’s been blunt in a good way about what to automate now vs later. No flashy AI layer we’d rip out in six months. Weekly architecture / perf tradeoff chats helped us dodge vendors that *look* cheap until you read the AI upsell fine print. For where we’re at, the dollars actually work; we’re not lighting runway on those vague ‘AI strategy’ retainers we kept getting quoted. Feels human, not salesy.",
        name: "Product",
        title: "Web experience",
        organization: "Going",
        rating: 4,
        siteImageSrc: "/images/testimonials/going-site.png",
        siteImageAlt: "Going website",
    },
]
