/**
 * ─── Projects Data ────────────────────────────────────────────────────
 * Single source of truth for all portfolio projects.
 * Imported by both the Projects section UI and the skill-connections utility.
 */

import type { DetailPanelData } from "@/components/detail-panel/types"
import { gradients as g, accentCycle } from "@/lib/theme"

export interface Project {
    id: string
    name: string
    metric: string
    summary: string
    tags: string[]
    gradient: string
    accent: string
    number: string
    detail: DetailPanelData
    /** Optional hero screenshot on the featured-project card (`public/` path) */
    coverImage?: string
    /** True for live demo deployments that are proof-of-concept, not full products */
    prototype?: boolean
}

export const projects: Project[] = [
    {
        id: "equiverse",
        name: "Equiverse.ml",
        metric: "5,000+ students impacted",
        summary:
            "AI-driven platform improving educational equity \u2014 scalable, data-driven solutions enhancing resource accessibility for 5,000+ underrepresented students.",
        tags: ["AI/ML", "Python", "Data Analytics", "EdTech"],
        gradient: g.primaryToAccent,
        accent: accentCycle[0],
        number: "01",
        detail: {
            title: "Equiverse.ml",
            subtitle: "AI-Driven Educational Equity Platform",
            description:
                "Designed and built an AI-powered platform to improve educational equity by enhancing resource accessibility for over 5,000 underrepresented students through scalable, data-driven solutions.",
            highlights: [
                "Built ML recommendation engine matching students with resources based on need profiles",
                "Designed data pipelines processing demographic and academic data at scale",
                "Created dashboards for administrators to track equity metrics in real-time",
                "Achieved measurable improvement in resource utilization across partner schools",
            ],
            architecture: [
                { label: "Data Pipeline", icon: "database", description: "ETL pipeline for student demographic and academic data" },
                { label: "ML Engine", icon: "cpu", description: "Recommendation model for resource-student matching" },
                { label: "Analytics", icon: "layers", description: "Real-time equity metrics and reporting dashboards" },
                { label: "API Layer", icon: "server", description: "RESTful API serving predictions and analytics" },
            ],
            techStack: ["Python", "scikit-learn", "PostgreSQL", "React", "JavaScript"],
            metrics: [
                { label: "Students Reached", value: "5,000+" },
                { label: "Domain", value: "EdTech" },
            ],
            diagramType: "pipeline",
            gradient: g.primaryToAccent,
            accent: accentCycle[0],
        },
    },
    {
        id: "flyoneo",
        name: "Flyoneo.ml",
        metric: "1,500+ active users",
        summary:
            "Co-founded AI/ML startup. Led a team of 8 interns, launched MVP with 1,500+ active users.",
        tags: ["AI/ML", "Startup", "Leadership", "MVP"],
        gradient: g.accentToCyan,
        accent: accentCycle[1],
        number: "02",
        detail: {
            title: "Flyoneo.ml",
            subtitle: "AI/ML Startup \u2014 Co-Founder",
            description:
                "Co-founded a startup specializing in AI/ML-driven solutions. Led a team of 8 interns from concept to launch, successfully delivering an MVP that attracted over 1,500 active users.",
            highlights: [
                "Led product strategy and technical architecture from zero to MVP launch",
                "Managed a team of 8 interns across engineering, design, and data science",
                "Implemented core ML features driving user engagement and retention",
                "Achieved 1,500+ active users within first three months of launch",
            ],
            architecture: [
                { label: "Frontend", icon: "layers", description: "React SPA with responsive design" },
                { label: "ML Core", icon: "cpu", description: "AI/ML models powering core product features" },
                { label: "Backend", icon: "server", description: "Node.js API with authentication and data management" },
                { label: "Infrastructure", icon: "database", description: "Cloud-hosted with CI/CD automation" },
            ],
            techStack: ["React", "JavaScript", "Python", "TensorFlow", "PostgreSQL", "AWS", "Docker"],
            metrics: [
                { label: "Active Users", value: "1,500+" },
                { label: "Team Size", value: "8" },
            ],
            diagramType: "fullstack",
            gradient: g.accentToCyan,
            accent: accentCycle[1],
        },
    },
    {
        id: "verizon",
        name: "Verizon \u2014 Unbiased",
        metric: "25% reduction in hiring bias",
        summary:
            "Designed ML solutions reducing hiring discrimination by 25%, improving diversity and fairness in recruitment pipelines.",
        tags: ["ML", "Bias Detection", "HR Tech", "Data Analysis"],
        gradient: g.cyanToPrimary,
        accent: accentCycle[2],
        number: "03",
        detail: {
            title: "Verizon \u2014 Unbiased",
            subtitle: "ML-Powered Hiring Fairness",
            description:
                "Designed technology solutions to reduce hiring discrimination by 25%, improving diversity and fairness in recruitment pipelines through machine learning bias detection.",
            highlights: [
                "Built ML models to detect and quantify bias in resume screening algorithms",
                "Designed fairness-aware scoring system reducing discrimination by 25%",
                "Created interpretable model explanations for HR stakeholders",
                "Implemented A/B testing framework to measure impact on diversity outcomes",
            ],
            architecture: [
                { label: "Bias Detection", icon: "shield", description: "ML models identifying discriminatory patterns" },
                { label: "Scoring Engine", icon: "cpu", description: "Fairness-aware candidate scoring system" },
                { label: "Analytics", icon: "layers", description: "Diversity metrics and impact dashboards" },
                { label: "Data Layer", icon: "database", description: "Anonymized candidate data processing" },
            ],
            techStack: ["Python", "scikit-learn"],
            metrics: [
                { label: "Bias Reduction", value: "25%" },
                { label: "Domain", value: "HR Tech" },
            ],
            diagramType: "ml-pipeline",
            gradient: g.cyanToPrimary,
            accent: accentCycle[2],
            link: { label: "Global Venture Catalyst", url: "https://scet.berkeley.edu/scet-students-shine-in-global-venture-catalyst-design-sprint/" },
        },
    },
    {
        id: "encrypted-fs",
        name: "Encrypted File Sharing",
        metric: "50% faster transfers",
        summary:
            "Secure file-sharing system with end-to-end encryption, achieving 50% faster data transfer speeds.",
        tags: ["Encryption", "Security", "File Systems", "Performance"],
        gradient: g.primaryToAccent,
        accent: accentCycle[0],
        number: "04",
        detail: {
            title: "Encrypted File Sharing",
            subtitle: "Secure High-Performance File Transfer",
            description:
                "Built a secure file-sharing system with end-to-end encryption, achieving a 50% increase in data transfer speeds through optimized chunking and parallel stream processing.",
            highlights: [
                "Implemented end-to-end AES-256 encryption with zero-knowledge architecture",
                "Optimized file chunking and parallel uploads for 50% speed improvement",
                "Built resumable transfer protocol for large file reliability",
                "Designed key exchange system using asymmetric cryptography",
            ],
            architecture: [
                { label: "Encryption", icon: "shield", description: "AES-256 end-to-end with zero-knowledge design" },
                { label: "Transfer Engine", icon: "zap", description: "Parallel chunked uploads with resumable protocol" },
                { label: "Key Exchange", icon: "git", description: "Asymmetric key management and distribution" },
                { label: "Storage", icon: "database", description: "Encrypted blob storage with deduplication" },
            ],
            techStack: ["Java", "Spring Boot", "Redis"],
            metrics: [
                { label: "Speed Gain", value: "+50%" },
                { label: "Encryption", value: "AES-256" },
            ],
            diagramType: "pipeline",
            gradient: g.primaryToAccent,
            accent: accentCycle[0],
        },
    },
    {
        id: "gitlet",
        name: "Gitlet Version Control",
        metric: "66% faster commits",
        summary:
            "Lightweight Git implementation with 66% faster commit times and optimized performance.",
        tags: ["Version Control", "Git", "System Design", "Performance"],
        gradient: g.accentToPrimary,
        accent: accentCycle[4],
        number: "05",
        detail: {
            title: "Gitlet Version Control",
            subtitle: "Lightweight Git Implementation",
            description:
                "Implemented a lightweight, efficient Git version control system from scratch, reducing commit times by 66% through optimized data structures and serialization.",
            highlights: [
                "Built complete Git-like VCS: init, add, commit, branch, merge, checkout, log",
                "Implemented content-addressable storage with SHA-1 hashing",
                "Optimized serialization achieving 66% faster commit performance",
                "Designed merge conflict resolution with three-way merge algorithm",
            ],
            architecture: [
                { label: "Object Store", icon: "database", description: "Content-addressable SHA-1 blob/tree/commit storage" },
                { label: "Index", icon: "layers", description: "Staging area with efficient diff computation" },
                { label: "Branching", icon: "git", description: "Branch management with three-way merge algorithm" },
                { label: "Serialization", icon: "zap", description: "Optimized object serialization/deserialization" },
            ],
            techStack: ["Java"],
            metrics: [
                { label: "Commit Speed", value: "+66%" },
                { label: "Type", value: "Full VCS" },
            ],
            diagramType: "pipeline",
            gradient: g.accentToPrimary,
            accent: accentCycle[4],
            link: { label: "GitHub", url: "https://github.com/ml-lubich" },
        },
    },
    {
        id: "pintos",
        name: "Pintos Operating System",
        metric: "40% performance boost",
        summary:
            "Refactored core OS functionality achieving 40% performance improvement through optimized architecture.",
        tags: ["OS", "C", "System Programming", "Performance"],
        gradient: g.cyanToPrimary,
        accent: accentCycle[2],
        number: "06",
        detail: {
            title: "Pintos Operating System",
            subtitle: "OS Kernel Development",
            description:
                "Refactored and expanded core OS functionality in the Pintos educational kernel, achieving a 40% performance improvement through optimized scheduling, memory management, and system call implementation.",
            highlights: [
                "Implemented priority scheduling with donation for deadlock prevention",
                "Built virtual memory system with page fault handling and swap",
                "Designed and implemented file system with buffer cache",
                "Optimized context switching and system call dispatch for 40% speedup",
            ],
            architecture: [
                { label: "Scheduler", icon: "cpu", description: "Priority scheduling with priority donation" },
                { label: "Virtual Memory", icon: "layers", description: "Page tables, fault handling, and swap space" },
                { label: "File System", icon: "database", description: "Indexed file system with buffer cache" },
                { label: "System Calls", icon: "server", description: "User-kernel interface with argument validation" },
            ],
            techStack: ["C++"],
            metrics: [
                { label: "Performance", value: "+40%" },
                { label: "Type", value: "OS Kernel" },
            ],
            diagramType: "microservices",
            gradient: g.cyanToPrimary,
            accent: accentCycle[2],
        },
    },
    {
        id: "enrichdata",
        name: "EnrichData",
        metric: "320+ enrichment fields live",
        coverImage: "/images/projects/enrichdata-hero.jpg",
        summary:
            "Live EnrichData marketing and product story—custom CRM enrichment that fills contact gaps, surfaces job changes, and keeps data fresh; built for teams and lean orgs who want serious data tooling without bloated vendor contracts.",
        tags: ["CRM", "Data Enrichment", "B2B", "Web"],
        gradient: g.primaryToMagenta,
        accent: accentCycle[3],
        number: "07",
        detail: {
            title: "EnrichData",
            subtitle: "Custom CRM data enrichment (live site)",
            description:
                "Shipped the public EnrichData experience at enrichdata.net: a custom CRM enrichment narrative—real-time-style data fills, job-change tracking, and quality maintenance—aimed at buyers who want outcomes over shelf-ware. Hero, social proof, pricing story, and the enriched-table demo are all part of the same cohesive pitch.",
            highlights: [
                "Hero and funnel copy around tailored enrichment systems, job-change awareness, and honest pricing tied to real requirements",
                "Product storytelling with the interactive CRM table visualization and green emphasis on enriched cells",
                "Contact and firmographic positioning: phones, emails, titles, dedupe, and CRM handoff without forcing a rip-and-replace",
                "Field catalog narrative (320+ points) and savings framing versus overbuilt enterprise data stacks",
            ],
            architecture: [
                { label: "Enrichment Engine", icon: "cpu", description: "Contact and company pipelines with validation and CRM handoff" },
                { label: "Integrations", icon: "server", description: "Works with existing CRMs—no forced migration" },
                { label: "Monitoring", icon: "zap", description: "Job-change detection and alert delivery" },
                { label: "Data Catalog", icon: "database", description: "Wide field catalog (contacts, companies, financials, technologies)" },
            ],
            techStack: ["TypeScript", "Next.js", "React", "Tailwind CSS", "MongoDB"],
            metrics: [
                { label: "Data fields", value: "320+" },
                { label: "Status", value: "Live" },
            ],
            diagramType: "pipeline",
            gradient: g.primaryToMagenta,
            accent: accentCycle[3],
            link: { label: "enrichdata.net", url: "https://www.enrichdata.net/" },
        },
    },
    {
        id: "lupfr",
        name: "LUPFR Entertainment",
        metric: "Bay Area events & artist platform",
        coverImage: "/images/projects/lupfr-hero.jpg",
        summary:
            "Consulting and build for LUPFR\u2019s public web presence\u2014nightlife-forward brand, event storytelling, bookings narrative, and a hero experience that matches their live San Francisco music scene.",
        tags: ["Web", "Events", "Next.js"],
        gradient: g.primaryToAccent,
        accent: accentCycle[0],
        number: "08",
        detail: {
            title: "LUPFR Entertainment",
            subtitle: "Music events & talent (live site)",
            description:
                "Partnered on web presence and digital experience for a San Francisco music events and talent platform: event pages, bookings flow, and brand storytelling aligned with their live scene and artist roster.",
            highlights: [
                "Hero and visual language tuned for nightlife: bold typography, gold accents, and full-bleed event photography",
                "Clear paths to book events and explore services, artists, and the LUPFR story",
                "Responsive layout and performance so marketing pages stay fast on mobile-first audiences",
                "Ongoing iteration with the team as the calendar and offerings evolve",
            ],
            architecture: [
                { label: "Marketing site", icon: "layers", description: "Next.js pages for events, services, artists, and contact" },
                { label: "Content", icon: "server", description: "Structured sections for promos, reels, and CTAs" },
                { label: "Brand", icon: "zap", description: "Design system aligned with in-venue and social presence" },
                { label: "Deploy", icon: "git", description: "Production hosting with CI-friendly releases" },
            ],
            techStack: ["TypeScript", "Next.js", "React", "Tailwind CSS"],
            metrics: [
                { label: "Focus", value: "Events / Web" },
                { label: "Status", value: "Live" },
            ],
            diagramType: "fullstack",
            gradient: g.primaryToAccent,
            accent: accentCycle[0],
            link: { label: "lupfr.com", url: "https://lupfr.com/" },
        },
    },
    {
        id: "w3sourcing",
        name: "W3 Sourcing",
        metric: "Global executive search live site",
        coverImage: "/images/projects/w3sourcing-hero.png",
        summary:
            "Public web experience for W3 Sourcing—principal-led executive search across VC-backed technology, legal, and finance markets with a polished founder-market hiring narrative.",
        tags: ["Web", "Executive Search", "Next.js", "B2B"],
        gradient: g.primaryToCyan,
        accent: accentCycle[2],
        number: "09",
        detail: {
            title: "W3 Sourcing",
            subtitle: "Executive search website (live site)",
            description:
                "Built the public W3 Sourcing experience at w3sourcing.com: a refined, trust-forward site for principal-led recruitment across VC-backed technology leadership, legal, and banking and finance. The site frames the difference between automation-assisted sourcing and human judgment for senior, sensitive, and cross-border hiring mandates.",
            highlights: [
                "Hero and messaging system centered on founder-market search, discretion, and accountable executive hiring",
                "Structured practice-area storytelling for technology, legal, and finance recruitment audiences",
                "Interactive methodology, comparison, results, testimonials, and FAQ sections tuned for high-trust B2B conversion",
                "Global positioning across the US, UK, EU, UAE, and Asia with clear email and LinkedIn paths",
            ],
            architecture: [
                { label: "Marketing site", icon: "layers", description: "Next.js public experience with section-driven conversion flow" },
                { label: "Content model", icon: "server", description: "Structured practice, process, results, comparison, and FAQ sections" },
                { label: "Visual system", icon: "zap", description: "Dark executive-search interface with cyan accents and product-style pipeline preview" },
                { label: "Trust signals", icon: "shield", description: "Leadership, testimonials, office details, and compliance-oriented public pages" },
            ],
            techStack: ["TypeScript", "Next.js", "React", "Tailwind CSS"],
            metrics: [
                { label: "Markets", value: "5+ regions" },
                { label: "Status", value: "Live" },
            ],
            diagramType: "fullstack",
            gradient: g.primaryToCyan,
            accent: accentCycle[2],
            link: { label: "w3sourcing.com", url: "https://www.w3sourcing.com/" },
        },
    },
    {
        id: "eria",
        name: "ERIA Events",
        metric: "800+ events across 3 Bay Area venues",
        coverImage: "/images/projects/eria-hero.jpg",
        summary:
            "Web presence for ERIA—the San Francisco Bay's most coveted venues and experiences. Luxury event brand featured in Forbes and trusted by Google, Anthropic, Samsung, and Hilton; live at eria.co and eriaevents.co.",
        tags: ["Web", "Events", "Luxury", "Next.js"],
        gradient: g.primaryToRose,
        accent: accentCycle[3],
        number: "10",
        detail: {
            title: "ERIA Events",
            subtitle: "Luxury venues & experiences — eria.co · eriaevents.co",
            description:
                "Consulting on the public web experience for ERIA, founder Nikita Khandheria's “we never say no” luxury event company: three waterfront venues (ERIA Sausalito, ERIA Marina, ERIA Corte Madera), 800+ events, and destination planning from the Bay Area to India and Thailand—live at eria.co and eriaevents.co.",
            highlights: [
                "Cinematic full-bleed video hero and gold-on-black editorial language for the Bay Area's most coveted venues",
                "Trusted-by storytelling for corporate clients including Google, Johnson & Johnson, Anthropic, Webflow, Samsung, and Hilton",
                "Press credibility surfaced up front: as seen in Forbes, Sheen Magazine, San Francisco Chronicle, and Destination I Do",
                "Portfolio, case studies (Samsung product launch, Anthropic offsite), journal, and booking funnels across both domains",
            ],
            architecture: [
                { label: "Marketing site", icon: "layers", description: "Full-bleed video hero, portfolio galleries, and venue pages" },
                { label: "Content", icon: "server", description: "Case studies, journal, press, and multi-venue location pages" },
                { label: "Brand", icon: "zap", description: "Gold-accented luxury design system across eria.co and eriaevents.co" },
                { label: "Conversion", icon: "git", description: "Booking, private-viewing, and mailing-list funnels" },
            ],
            techStack: ["TypeScript", "Next.js", "React", "Tailwind CSS"],
            metrics: [
                { label: "Events", value: "800+" },
                { label: "Venues", value: "3 waterfront" },
            ],
            diagramType: "fullstack",
            gradient: g.primaryToRose,
            accent: accentCycle[3],
            link: { label: "eria.co", url: "https://www.eria.co/" },
        },
    },
    {
        id: "reviewly",
        name: "Reviewly",
        metric: "AI Google Review automation",
        coverImage: "/images/projects/reviewly-hero.png",
        prototype: true,
        summary:
            "AI-powered Google Review management for local businesses—monitors new reviews, drafts on-brand replies with Claude, and never lets a review go unanswered. Live prototype deployment.",
        tags: ["Claude API", "Next.js", "Supabase"],
        gradient: g.primaryToAccent,
        accent: accentCycle[0],
        number: "11",
        detail: {
            title: "Reviewly",
            subtitle: "AI Google Review management (live prototype)",
            description:
                "Proof-of-concept SaaS that watches a business's Google reviews and uses Claude to draft on-brand, context-aware replies so nothing slips through—positioned around the pain of missed reviews hurting local reputation.",
            highlights: [
                "Claude-drafted review responses tuned to business tone and rating context",
                "Review monitoring and notification flow so no review goes unanswered",
                "Next.js marketing + app surface with Supabase auth and data",
                "Prototype deployment demonstrating the end-to-end product story",
            ],
            architecture: [
                { label: "AI Replies", icon: "cpu", description: "Claude API drafts context-aware review responses" },
                { label: "Monitoring", icon: "zap", description: "New-review detection and alerting" },
                { label: "Data & Auth", icon: "database", description: "Supabase for accounts, businesses, and reviews" },
                { label: "Web App", icon: "layers", description: "Next.js marketing site and dashboard" },
            ],
            techStack: ["Claude API", "Next.js", "React", "Supabase", "Tailwind CSS"],
            metrics: [
                { label: "Type", value: "Prototype" },
                { label: "Status", value: "Live demo" },
            ],
            diagramType: "fullstack",
            gradient: g.primaryToAccent,
            accent: accentCycle[0],
            link: { label: "reviewly-self.vercel.app", url: "https://reviewly-self.vercel.app/" },
        },
    },
    {
        id: "scrapechat",
        name: "ScrapeChatAI",
        metric: "Chat-driven web scraping",
        coverImage: "/images/projects/scrapechat-hero.png",
        prototype: true,
        summary:
            "Scrape any website in plain English—describe what you want, and AI writes the browser script, runs it, validates the data, and returns clean structured results. Live prototype deployment.",
        tags: ["Claude", "Playwright", "FastAPI"],
        gradient: g.accentToCyan,
        accent: accentCycle[1],
        number: "12",
        detail: {
            title: "ScrapeChatAI",
            subtitle: "LLM-powered web scraper you chat with (live prototype)",
            description:
                "Proof-of-concept where users describe a scraping goal in natural language and the system generates, executes, and validates a Playwright browser script—no code required—returning clean structured data from a chat interface.",
            highlights: [
                "Natural-language prompt to AI-generated Playwright scraping scripts",
                "Runs and validates scripts, self-correcting until data is clean",
                "FastAPI backend orchestrating the LLM + headless browser loop",
                "Prototype deployment showcasing the chat-to-data workflow",
            ],
            architecture: [
                { label: "Script Gen", icon: "cpu", description: "LLM writes Playwright scripts from plain English" },
                { label: "Browser Runtime", icon: "zap", description: "Headless Playwright execution and retries" },
                { label: "Validation", icon: "shield", description: "Structured-output checks on scraped data" },
                { label: "API", icon: "server", description: "FastAPI orchestration between chat, LLM, and browser" },
            ],
            techStack: ["Claude", "Playwright", "FastAPI", "Python", "Next.js"],
            metrics: [
                { label: "Type", value: "Prototype" },
                { label: "Status", value: "Live demo" },
            ],
            diagramType: "pipeline",
            gradient: g.accentToCyan,
            accent: accentCycle[1],
            link: { label: "scrapechat.vercel.app", url: "https://scrapechat.vercel.app/" },
        },
    },
    {
        id: "leadpipe",
        name: "LeadPipe AI",
        metric: "AI lead-gen for trades",
        coverImage: "/images/projects/leadpipe-hero.png",
        prototype: true,
        summary:
            "Finds local trade businesses with a weak digital presence, scores them, and drafts personalized consulting outreach—scrape, score, send, close. Live prototype deployment.",
        tags: ["LLM", "Next.js", "Python"],
        gradient: g.cyanToPrimary,
        accent: accentCycle[2],
        number: "13",
        detail: {
            title: "LeadPipe AI",
            subtitle: "AI lead generation for local trades (live prototype)",
            description:
                "Proof-of-concept outreach CRM that scrapes local HVAC, plumbing, electrical, roofing, and landscaping businesses, scores their online presence, and generates personalized consulting outreach through a Kanban pipeline from New to Closed.",
            highlights: [
                "Auto-scrapes trade businesses by category and city with opportunity scoring",
                "Kanban pipeline CRM: New → Researched → Contacted → Closed",
                "LLM-generated outreach email templates with smart personalization variables",
                "Prototype deployment demonstrating the scrape-score-send-close loop",
            ],
            architecture: [
                { label: "Scraper", icon: "zap", description: "Collects local trade businesses by trade + city" },
                { label: "Scoring", icon: "cpu", description: "Ranks digital-presence weakness as opportunity" },
                { label: "Outreach", icon: "server", description: "LLM email templates with personalization variables" },
                { label: "Pipeline CRM", icon: "layers", description: "Kanban board tracking leads to close" },
            ],
            techStack: ["Next.js", "Python", "React", "Tailwind CSS", "MongoDB"],
            metrics: [
                { label: "Type", value: "Prototype" },
                { label: "Status", value: "Live demo" },
            ],
            diagramType: "pipeline",
            gradient: g.cyanToPrimary,
            accent: accentCycle[2],
            link: { label: "leadpipe-two.vercel.app", url: "https://leadpipe-two.vercel.app/" },
        },
    },
    {
        id: "briopedia",
        name: "RAG Knowledge Base",
        metric: "RAG support knowledge base",
        summary:
            "Internal support knowledge base—Next.js UI over a FastAPI backend with a git-backed wiki corpus, FAISS retrieval, and provider-agnostic local or cloud LLM chat, deployed as one Docker Compose stack.",
        tags: ["RAG", "FastAPI", "Next.js", "LLM"],
        gradient: g.primaryToMagenta,
        accent: accentCycle[3],
        number: "14",
        detail: {
            title: "RAG Knowledge Base",
            subtitle: "Retrieval-augmented support knowledge base",
            description:
                "An internal support knowledge base combining a Next.js UI, a FastAPI backend, and a git-backed wiki corpus. Documents are indexed into FAISS for retrieval, and answers stream from a provider-agnostic LLM layer that runs either a local Ollama model or a cloud provider—shipped as a single Docker Compose stack that non-technical operators deploy with one command.",
            highlights: [
                "Git-backed wiki corpus with a FAISS search index that rebuilds and syncs with zero downtime",
                "Provider-agnostic chat: local Ollama (qwen3) or cloud (OpenRouter) behind one backend",
                "One-command Docker Compose deploy—web, backend, and Ollama with health checks and auto-restart",
                "Multi-user auth with per-core uvicorn workers and fully async chat so concurrent users never block",
            ],
            architecture: [
                { label: "Next.js UI", icon: "layers", description: "Chat and wiki front end for support staff" },
                { label: "FastAPI backend", icon: "server", description: "Async API serving retrieval and chat" },
                { label: "FAISS index", icon: "database", description: "Vector retrieval over the git-backed corpus" },
                { label: "LLM layer", icon: "cpu", description: "Provider-agnostic local or cloud generation" },
            ],
            techStack: ["Python", "FastAPI", "Next.js", "TypeScript", "FAISS", "Ollama", "Docker"],
            metrics: [
                { label: "Retrieval", value: "FAISS RAG" },
                { label: "LLM", value: "Local + cloud" },
            ],
            diagramType: "fullstack",
            gradient: g.primaryToMagenta,
            accent: accentCycle[3],
        },
    },
    {
        id: "brio-bot",
        name: "Case Triage Agent",
        metric: "Evidence-bound Salesforce triage",
        summary:
            "Evidence-bound Salesforce case triage agent—LangGraph orchestrates gather → reason/tools → extract → deterministic gates → optional live Salesforce write, so the model proposes and Python decides what counts as evidence.",
        tags: ["Agentic AI", "LangGraph", "Python", "Salesforce"],
        gradient: g.primaryViaAccentToCyan,
        accent: accentCycle[1],
        number: "15",
        detail: {
            title: "Case Triage Agent",
            subtitle: "Evidence-bound Salesforce triage (LangGraph)",
            description:
                "An agentic triage system for e-commerce support cases. A LangGraph graph gathers each Salesforce case, retrieves knowledge-base context, reads attached images, plans, reasons with tools, and extracts fields—then deterministic Python gates decide which fields may be written before an optional live Salesforce update. The model proposes; code decides what counts as evidence.",
            highlights: [
                "LangGraph pipeline: gather → retrieve → image-read → plan → reason/tools → extract → gates → write",
                "Evidence-bound design: deterministic Python gates decide which fields are writable",
                "Optional live Salesforce writes with dry-run mode and a safe mid-batch stop file",
                "~2,500-test verification gate with Langfuse tracing for full observability",
            ],
            architecture: [
                { label: "CaseAgent", icon: "cpu", description: "LangGraph gather→reason→extract→write graph" },
                { label: "Evidence gates", icon: "shield", description: "Deterministic checks decide writable fields" },
                { label: "Salesforce", icon: "server", description: "Live case updates with dry-run safety" },
                { label: "Observability", icon: "zap", description: "Langfuse traces and full run reports" },
            ],
            techStack: ["Python", "LangGraph", "OpenRouter", "Salesforce API", "Langfuse"],
            metrics: [
                { label: "Tests", value: "~2,500" },
                { label: "Type", value: "Agentic AI" },
            ],
            diagramType: "agents",
            gradient: g.primaryViaAccentToCyan,
            accent: accentCycle[1],
        },
    },
    {
        id: "ai-invoice-agent",
        name: "AI Invoice Agent",
        metric: "Receipts ↔ statements reconciled",
        summary:
            "Financial reconciliation pipeline—a Gemini vision model reads statements and receipts into typed transactions, a deterministic engine cross-examines them for irregularities, and exports a clean QuickBooks bank-import CSV in one pass.",
        tags: ["Vision LLM", "Python", "FinTech", "Automation"],
        gradient: g.cyanViaPrimaryToAccent,
        accent: accentCycle[2],
        number: "16",
        detail: {
            title: "AI Invoice Agent",
            subtitle: "Vision-powered financial reconciliation",
            description:
                "A single-pass reconciliation pipeline: upload a bank or credit-card statement plus the backing receipts, and Gemini 2.5 Flash reads every source—including scans and stamped totals—into typed transactions. A deterministic engine then cross-examines them, flags irregularities, and exports a QuickBooks bank-import CSV of the rows that align, with a plain-language chat layered on top for non-technical users.",
            highlights: [
                "Gemini 2.5 Flash vision extraction reads scans, stamped totals, and image-embedded fields",
                "Deterministic engine flags missing receipts, duplicates, amount/date drift, and injection attempts",
                "Exports a 3-column QuickBooks bank-import CSV of only the rows that reconcile",
                "Built-in plain-language chat lets non-technical users query the results",
            ],
            architecture: [
                { label: "Vision extract", icon: "cpu", description: "Gemini Flash reads every source into typed rows" },
                { label: "Reconcile", icon: "shield", description: "Deterministic cross-examination and anomaly flags" },
                { label: "QuickBooks CSV", icon: "database", description: "3-column bank-import export of aligned rows" },
                { label: "Chat Q&A", icon: "zap", description: "Plain-language questions over the result" },
            ],
            techStack: ["Python", "Google Gemini", "uv", "Docker"],
            metrics: [
                { label: "Model", value: "Gemini 2.5" },
                { label: "Output", value: "QuickBooks CSV" },
            ],
            diagramType: "pipeline",
            gradient: g.cyanViaPrimaryToAccent,
            accent: accentCycle[2],
        },
    },
    {
        id: "multimodal-captcha-solver",
        name: "Multimodal CAPTCHA Solver",
        metric: "Vision-model CAPTCHA solving",
        coverImage: "/images/projects/multimodal-captcha-solver-hero.png",
        summary:
            "Vision-model CAPTCHA solver that drives Chromium with Playwright, screenshots the widget or iframe, and sends the pixels to a vision model (MiniMax default, Google Vertex optional) to read text and simple-math CAPTCHAs.",
        tags: ["Vision LLM", "Playwright", "Python", "Automation"],
        gradient: g.accentViaMagentaToPrimary,
        accent: accentCycle[3],
        number: "17",
        detail: {
            title: "Multimodal CAPTCHA Solver",
            subtitle: "Playwright + vision model (authorized use only)",
            description:
                "A CLI that solves text and simple-math CAPTCHAs by driving Chromium/Chrome with Playwright, capturing viewport or MTCaptcha iframe screenshots, and sending the pixels to a vision model. MiniMax is the default backend and Google Vertex/Gemini is optional; the solution is typed back into the widget or printed for downstream use. Intended only for sites where you have permission.",
            highlights: [
                "Drives Chromium/Chrome via Playwright and captures viewport or MTCaptcha iframe images",
                "Vision backend reads text and simple-math CAPTCHAs—MiniMax default, Google Vertex optional",
                "Optionally types the solution into the widget, or prints it for downstream automation",
                "uv-based CLI with a permission-first stance—solve only where authorized",
            ],
            architecture: [
                { label: "Playwright", icon: "zap", description: "Drives the browser, screenshots widget/iframe" },
                { label: "Vision model", icon: "cpu", description: "MiniMax or Vertex reads pixels into an answer" },
                { label: "Solver", icon: "layers", description: "Parses text or evaluates simple math" },
                { label: "Autofill", icon: "server", description: "Types the solution into the widget input" },
            ],
            techStack: ["Python", "Playwright", "MiniMax", "Google Vertex"],
            metrics: [
                { label: "Backend", value: "Vision LLM" },
                { label: "Driver", value: "Playwright" },
            ],
            diagramType: "ml-pipeline",
            gradient: g.accentViaMagentaToPrimary,
            accent: accentCycle[3],
            link: { label: "GitHub", url: "https://github.com/ml-lubich/multimodal-captcha-solver" },
        },
    },
    {
        id: "synthdata-forge",
        name: "SynthData Forge",
        metric: "Multi-agent synthetic-data pipeline",
        coverImage: "/images/projects/synthdata-forge-hero.png",
        summary:
            "CrewAI multi-agent pipeline that designs, generates, audits, and reports on synthetic ML training datasets—an Architect, Generator, Auditor, and Reporter collaborate to emit a ready-to-use CSV plus a quality report.",
        tags: ["Multi-Agent", "CrewAI", "Python", "ML Data"],
        gradient: g.primaryViaSkyToAccent,
        accent: accentCycle[1],
        number: "18",
        detail: {
            title: "SynthData Forge",
            subtitle: "CrewAI pipeline for synthetic ML datasets",
            description:
                "A four-agent CrewAI pipeline for generating synthetic ML training data. A Data Architect designs the JSON schema, a Generator produces schema-respecting rows, an Auditor validates nulls, types, ranges, duplicates, and leakage—looping failing rows back for regeneration—and a Reporter compiles a polished Markdown quality report. One CLI drives the whole crew, powered by MiniMax.",
            highlights: [
                "Four CrewAI agents chain sequentially: Architect → Generator → Auditor → Reporter",
                "Auditor checks nulls, types, ranges, duplicates, and leakage, looping bad rows back to regenerate",
                "Emits a ready-to-use dataset.csv plus a polished Markdown quality report",
                "Single CLI: synthdata-forge --domain ... --rows ... --columns ...",
            ],
            architecture: [
                { label: "Architect", icon: "layers", description: "Designs the dataset JSON schema" },
                { label: "Generator", icon: "cpu", description: "Produces schema-respecting CSV rows" },
                { label: "Auditor", icon: "shield", description: "Checks nulls, types, leakage; loops failures" },
                { label: "Reporter", icon: "server", description: "Compiles a Markdown quality report" },
            ],
            techStack: ["Python", "CrewAI", "MiniMax"],
            metrics: [
                { label: "Agents", value: "4-stage crew" },
                { label: "Output", value: "CSV + report" },
            ],
            diagramType: "agents",
            gradient: g.primaryViaSkyToAccent,
            accent: accentCycle[1],
            link: { label: "GitHub", url: "https://github.com/ml-lubich/synthdata-forge" },
        },
    },
    {
        id: "imessage-exporter",
        name: "iMessage Exporter",
        metric: "Local iMessage search & export CLI",
        coverImage: "/images/projects/imessage-exporter-hero.png",
        summary:
            "A colorful Typer CLI to find, search, and export iMessages from the local macOS chat.db—date-range and text filters compiled to SQL, plus a local semantic full-text index, all running entirely on-device.",
        tags: ["CLI", "Python", "SQLite", "macOS"],
        gradient: g.accentToPrimary,
        accent: accentCycle[4],
        number: "19",
        detail: {
            title: "iMessage Exporter",
            subtitle: "Local-first macOS message search & export",
            description:
                "A Typer CLI that reads the macOS Messages chat.db to list, find, search, export, and semantically index your iMessages. Date-range and text filters compile into SQL WHERE clauses against SQLite, and a local full-text index enables searching messages by meaning. Everything runs on-device (Full Disk Access required) with two interchangeable entrypoints.",
            highlights: [
                "Typer CLI over macOS chat.db: list, find, search, semantic, export, and index commands",
                "Date-range and text filters compiled into SQL WHERE clauses against SQLite",
                "Local full-text semantic index for searching messages by meaning",
                "Two entrypoints (imsg / imessage-exporter); fully local, needs Full Disk Access",
            ],
            architecture: [
                { label: "Typer CLI", icon: "cpu", description: "list · find · search · semantic · export" },
                { label: "SQL builder", icon: "layers", description: "Date-range and LIKE filters → WHERE clauses" },
                { label: "chat.db", icon: "database", description: "Reads the local macOS Messages SQLite store" },
                { label: "FTS index", icon: "zap", description: "Local semantic full-text search" },
            ],
            techStack: ["Python", "Typer", "SQLite", "FTS"],
            metrics: [
                { label: "Interface", value: "CLI" },
                { label: "Data", value: "Local chat.db" },
            ],
            diagramType: "pipeline",
            gradient: g.accentToPrimary,
            accent: accentCycle[4],
            link: { label: "GitHub", url: "https://github.com/ml-lubich/imessage-exporter" },
        },
    },
    {
        id: "confluence-cli",
        name: "confluence-cli",
        metric: "Full legacy wiki migrated",
        coverImage: "/images/projects/imessage-exporter-hero.png",
        summary:
            "Confluence CLI with first-class bulk move/delete and idempotent mirror/migration—built to be safely driven by AI agents. Powers real KB migrations (moved a full legacy telecom wiki into Confluence).",
        tags: ["Node.js", "Commander", "Atlassian API", "AI-agents"],
        gradient: g.cyanToPrimary,
        accent: accentCycle[2],
        number: "20",
        detail: {
            title: "confluence-cli",
            subtitle: "Bulk Confluence operations for AI agents",
            description:
                "A Commander-based CLI over the Atlassian Confluence REST API, purpose-built for bulk move/delete and idempotent mirror/migration operations that are safe to re-run and safe to hand to an AI agent. Used to migrate a full legacy telecom wiki into Confluence.",
            highlights: [
                "Bulk move and delete across pages and folders via the Confluence REST API",
                "Idempotent mirror/migration commands—safe to re-run without duplicating content",
                "Designed for AI-agent-driven operation: predictable commands, clear exit codes",
                "Migrated a full legacy telecom wiki into Confluence end to end",
            ],
            architecture: [
                { label: "CLI", icon: "layers", description: "Commander-based command surface" },
                { label: "Confluence API", icon: "server", description: "Atlassian REST API for pages and spaces" },
                { label: "Mirror Engine", icon: "cpu", description: "Idempotent sync/migration logic" },
                { label: "Bulk Ops", icon: "zap", description: "Batch move/delete across pages and folders" },
            ],
            techStack: ["Node.js", "Commander", "Atlassian API"],
            metrics: [
                { label: "Type", value: "CLI" },
                { label: "Migration", value: "Legacy wiki → Confluence" },
            ],
            diagramType: "cicd",
            gradient: g.cyanToPrimary,
            accent: accentCycle[2],
            link: { label: "GitHub", url: "https://github.com/ml-lubich/confluence-cli" },
        },
    },
    {
        id: "twig",
        name: "twig",
        metric: "Agent-first worktree CLI",
        coverImage: "/images/projects/twig-hero.png",
        summary:
            "Fast Git worktree CLI for humans and agents — one-command create/jump/clean, JSON on every command, real shell-hook cd, and a Rust hot path for agent swarms. pipx install twig-cli.",
        tags: ["Python", "Rust", "Typer", "Git", "AI-agents"],
        gradient: g.primaryToAccent,
        accent: accentCycle[0],
        number: "21",
        detail: {
            title: "twig",
            subtitle: "Agent-first Git worktree CLI",
            description:
                "A Typer + Rich + Pydantic CLI with an optional Rust (PyO3) core for hot paths. Built for multi-agent workflows: flocking, parallel foreach, batch create, and --json on every command so agents can drive worktrees safely.",
            highlights: [
                "One-command worktree create, jump, prune, rename, lock/unlock, and batch-new",
                "JSON output on every command plus agent schema/guide for LLM tooling",
                "Real shell-hook cd (TWIG_CD) so go/open actually change the terminal directory",
                "Rust-accelerated validate/glob/porcelain/template path with pure-Python fallback",
            ],
            architecture: [
                { label: "CLI", icon: "layers", description: "Typer + Rich command surface" },
                { label: "Rust core", icon: "zap", description: "PyO3 hot path for validate/glob/parse" },
                { label: "Git ops", icon: "cpu", description: "Worktree create/list/remove with flocking" },
                { label: "Agent API", icon: "server", description: "--json + schema for swarm automation" },
            ],
            techStack: ["Python", "Rust", "Typer", "Rich", "Pydantic", "maturin"],
            metrics: [
                { label: "Install", value: "pipx install twig-cli" },
                { label: "Type", value: "CLI" },
            ],
            diagramType: "cicd",
            gradient: g.primaryToAccent,
            accent: accentCycle[0],
            link: { label: "GitHub", url: "https://github.com/ml-lubich/twig" },
        },
    },
    {
        id: "imsg-mcp",
        name: "imsg-mcp",
        metric: "3.4\u00d7 faster search (Rust core)",
        coverImage: "/images/projects/imsg-mcp-hero.png",
        summary:
            "Local-first iMessage CLI + MCP server \u2014 a Rust (PyO3) hot path decodes chat.db 3.4\u00d7 faster than pure Python, with \u2265 90% test coverage and a PyPI/Homebrew release.",
        tags: ["CLI", "MCP", "Rust", "Python", "macOS"],
        gradient: g.accentToPrimary,
        accent: accentCycle[4],
        number: "22",
        detail: {
            title: "imsg-mcp",
            subtitle: "Local iMessage CLI + MCP server (Rust-accelerated)",
            description:
                "imsg reads, searches, and sends iMessage from the terminal or exposes it to Claude, Cursor, and VS Code over MCP. Everything runs locally against the read-only chat.db \u2014 no cloud, no login. The hot path (decoding tens of thousands of attributedBody typedstream blobs) is written in Rust via PyO3, making full-history search 3.4\u00d7 faster than the pure-Python fallback it ships alongside.",
            highlights: [
                "Rust (PyO3 + rusqlite) hot path decodes attributedBody blobs 3.4\u00d7 faster than pure Python on a 50k-message benchmark",
                "imsg-mcp exposes check_access, get_recent_messages, search_messages, list_chats, list_contacts, and send_message over stdio",
                "Read-only SQLite access to chat.db; sending is isolated to one AppleScript-escaped function",
                "Published on PyPI as mac-imsg (target imsg-mcp) plus a Homebrew tap, with \u2265 90% test coverage",
            ],
            architecture: [
                { label: "CLI", icon: "layers", description: "imsg \u2014 chats, contacts, search, send, doctor" },
                { label: "Rust core", icon: "zap", description: "PyO3 + rusqlite typedstream decode, 3.4\u00d7 faster search" },
                { label: "MCP server", icon: "server", description: "imsg-mcp exposes 6 tools over stdio to Claude/Cursor" },
                { label: "chat.db", icon: "database", description: "Read-only SQLite access; sends via AppleScript \u2192 Messages.app" },
            ],
            techStack: ["Python", "Rust", "PyO3", "Typer", "SQLite", "AppleScript", "MCP", "maturin", "uv"],
            metrics: [
                { label: "Coverage", value: "\u2265 90%" },
                { label: "Install", value: "pip install mac-imsg" },
            ],
            diagramType: "cicd",
            gradient: g.accentToPrimary,
            accent: accentCycle[4],
            link: { label: "GitHub", url: "https://github.com/ml-lubich/imsg" },
        },
    },
    {
        id: "imail-mcp",
        name: "imail-mcp",
        metric: "CLI-first Mail.app agent tool",
        coverImage: "/images/projects/imail-mcp-hero.png",
        summary:
            "Local Apple Mail CLI (imail) with hard account walls between work and personal mail, plus an agent-schema surface so LLM tools can discover the full command contract as JSON.",
        tags: ["CLI", "AppleScript", "Python", "macOS"],
        gradient: g.cyanToPrimary,
        accent: accentCycle[2],
        number: "23",
        detail: {
            title: "imail-mcp",
            subtitle: "Local Apple Mail CLI + agent schema",
            description:
                "imail is a CLI-first agent tool over Mail.app \u2014 accounts, list, send, and organize \u2014 built to the same imsg-style scaffold (Typer, pytest) as the rest of the family. It hard-separates work (Polaris/Exchange) and personal accounts behind explicit account walls, and exposes its full command surface as machine-readable JSON via `imail agent schema` for LLM tool-calling. A third-party MCP server (patrickfreyer/apple-mail-mcp) covers full search/compose/organize in agents today while this repo grows its own.",
            highlights: [
                "CLI-first design (imail) with an `agent schema` / `agent guide` surface so LLM tools can discover the full command contract",
                "Account walls keep work (Polaris/Exchange) and personal mail from ever cross-sending \u2014 enforced on every send",
                "AppleScript automation directly over Mail.app \u2014 no IMAP client, no himalaya dependency",
                "Same imsg-style scaffold (Typer, pytest) and packaging path (pip \u2192 PyPI) as the rest of the *-mcp family",
            ],
            architecture: [
                { label: "CLI", icon: "layers", description: "imail \u2014 accounts, list, send, organize, walls" },
                { label: "Account walls", icon: "shield", description: "Hard separation between work (Exchange) and personal mail; --from enforced" },
                { label: "Agent schema", icon: "server", description: "imail agent schema/guide expose the full command contract as JSON" },
                { label: "Mail.app bridge", icon: "cpu", description: "AppleScript automation over Mail.app \u2014 no IMAP client, no himalaya" },
            ],
            techStack: ["Python", "AppleScript", "Typer", "Mail.app", "Pydantic", "pytest"],
            metrics: [
                { label: "Distribution", value: "PyPI: mac-imail" },
                { label: "Type", value: "CLI + agent schema" },
            ],
            diagramType: "cicd",
            gradient: g.cyanToPrimary,
            accent: accentCycle[2],
            link: { label: "GitHub", url: "https://github.com/ml-lubich/imail" },
        },
    },
    {
        id: "inotes-mcp",
        name: "inotes-mcp",
        metric: "CLI-first Apple Notes agent tool",
        coverImage: "/images/projects/inotes-mcp-hero.png",
        summary:
            "Local Apple Notes CLI (inotes) \u2014 list, search, show, create \u2014 with the same agent-schema pattern as imail, pairing with a third-party MCP server for CRUD beyond the CLI surface.",
        tags: ["CLI", "AppleScript", "Python", "macOS"],
        gradient: g.primaryToMagenta,
        accent: accentCycle[3],
        number: "24",
        detail: {
            title: "inotes-mcp",
            subtitle: "Local Apple Notes CLI + agent schema",
            description:
                "inotes is a CLI-first agent tool over Notes.app \u2014 list, search, show, and create \u2014 following the same imsg-style scaffold as the rest of the family. It exposes its command surface as JSON via `inotes agent schema` and a Markdown playbook via `inotes agent guide`, and pairs with a third-party Apple Notes MCP server (sweetrb/apple-notes-mcp) for full CRUD in agents.",
            highlights: [
                "CLI-first (inotes) with `agent schema` / `agent guide` so LLM tools can discover the full command contract",
                "AppleScript automation over Notes.app for list/search/show/create workflows",
                "Pairs with a third-party Apple Notes MCP server for CRUD beyond the CLI surface",
                "Same imsg-style scaffold and packaging pattern (pip \u2192 PyPI \u2192 Homebrew tap) as the rest of the family",
            ],
            architecture: [
                { label: "CLI", icon: "layers", description: "inotes \u2014 list, search, show, create, doctor" },
                { label: "Agent schema", icon: "server", description: "inotes agent schema/guide expose the command contract" },
                { label: "Notes.app bridge", icon: "cpu", description: "AppleScript automation over Notes.app, CLI-first" },
                { label: "Distribution", icon: "git", description: "PyPI today as mac-inotes; Homebrew tap planned" },
            ],
            techStack: ["Python", "AppleScript", "Typer", "Notes.app", "Pydantic", "pytest"],
            metrics: [
                { label: "Distribution", value: "PyPI: mac-inotes" },
                { label: "Type", value: "CLI + agent schema" },
            ],
            diagramType: "cicd",
            gradient: g.primaryToMagenta,
            accent: accentCycle[3],
            link: { label: "GitHub", url: "https://github.com/ml-lubich/inotes" },
        },
    },
    {
        id: "wa-mcp",
        name: "wa-mcp",
        metric: "Ops CLI atop the OSS WhatsApp MCP bridge",
        coverImage: "/images/projects/wa-mcp-hero.png",
        summary:
            "A gradient-styled ops CLI (wa) that runs the open-source WhatsApp MCP bridge (Go + whatsmeow) and its Python MCP server as managed background daemons \u2014 status, logs, send, and read-only local queries.",
        tags: ["CLI", "MCP", "Go", "Python"],
        gradient: g.primaryViaAccentToCyan,
        accent: accentCycle[1],
        number: "25",
        detail: {
            title: "wa-mcp",
            subtitle: "WhatsApp CLI (wa) + MCP daemon manager",
            description:
                "Built on top of the open-source whatsapp-mcp project (a Go/whatsmeow bridge plus a Python MCP server), wa adds an operator CLI layer: start/stop both processes as managed daemons, tail their logs, check real WhatsApp-auth status (not just \u201cprocess is up\u201d), send messages through the bridge's REST API, and query contacts/chats read-only straight from the bridge's local SQLite stores.",
            highlights: [
                "Added a gradient-styled ops CLI (wa) that runs the Go bridge and Python MCP server as managed background daemons",
                "`wa doctor` / `wa status` separate \u201cprocess is up\u201d from \u201cWhatsApp session is authenticated\u201d",
                "Read-only contacts/chats queries hit the bridge's local SQLite stores directly \u2014 no extra round-trip",
                "Built on top of the open-source whatsapp-mcp bridge (Go + whatsmeow) rather than reimplementing WhatsApp Web from scratch",
            ],
            architecture: [
                { label: "wa CLI", icon: "layers", description: "up/down/status/logs/send/contacts/chats/doctor daemon control" },
                { label: "Go bridge", icon: "server", description: "whatsmeow-based bridge authenticates via QR and syncs messages to SQLite" },
                { label: "MCP server", icon: "cpu", description: "Python MCP server (wa-mcp) exposes WhatsApp tools to Claude/Cursor" },
                { label: "Local store", icon: "database", description: "Read-only contacts/chats queries direct against the bridge's SQLite stores" },
            ],
            techStack: ["Python", "Go", "uv", "SQLite", "MCP"],
            metrics: [
                { label: "Daemons", value: "Bridge + MCP" },
                { label: "Type", value: "Ops CLI" },
            ],
            diagramType: "agents",
            gradient: g.primaryViaAccentToCyan,
            accent: accentCycle[1],
            link: { label: "GitHub", url: "https://github.com/ml-lubich/whatsapp-mcp" },
        },
    },
    {
        id: "bitbucket-cli",
        name: "bitbucket-cli",
        metric: "gh-style CLI + read-only MCP",
        coverImage: "/images/projects/bitbucket-cli-hero.png",
        summary:
            "A gh-style command line (bb) for Bitbucket Cloud and Data Center \u2014 PRs, repos, issues, and pipelines with --json everywhere, OAuth2 + keyring auth, and a built-in read-only MCP server for agents.",
        tags: ["CLI", "MCP", "Python", "Bitbucket API"],
        gradient: g.cyanViaPrimaryToAccent,
        accent: accentCycle[2],
        number: "26",
        detail: {
            title: "bitbucket-cli",
            subtitle: "gh-style Bitbucket CLI (bb) + read-only MCP",
            description:
                "bb mirrors GitHub CLI ergonomics for Bitbucket Cloud and on-prem Data Center: pr, repo, issue, pipeline, branch, workspace, and snippet commands with human-readable tables by default and --json on every list/view command. OAuth2 browser login stores a rotating token in the OS keyring; token auth covers Data Center and CI. `bb mcp serve` exposes a read-only MCP server over stdio so coding agents can query Bitbucket without shell glue. Kept as bitbucket-cli / bb \u2014 deliberately not renamed to the *-mcp family, since MCP is one surface among several.",
            highlights: [
                "gh-style ergonomics across pr/repo/issue/pipeline/branch/workspace/snippet/search, with --json on every list/view command",
                "OAuth2 browser login with OS-keyring token storage and automatic refresh; token auth for Data Center and CI",
                "`bb mcp serve` exposes a read-only MCP server over stdio so coding agents can query Bitbucket without shell glue",
                "One codebase targets both Bitbucket Cloud and on-prem Data Center by mapping API paths automatically",
            ],
            architecture: [
                { label: "CLI (bb)", icon: "layers", description: "pr/repo/issue/pipeline/branch/workspace/snippet/search, --json everywhere" },
                { label: "Auth", icon: "shield", description: "OAuth2 browser login with OS-keyring storage + auto-refresh; token auth for CI" },
                { label: "MCP server", icon: "server", description: "bb mcp serve \u2014 read-only stdio MCP (whoami, repo/pr/issue/pipeline, api_get)" },
                { label: "Cloud + Data Center", icon: "cpu", description: "Same commands target Bitbucket Cloud or on-prem Data Center via base_url" },
            ],
            techStack: ["Python", "Typer", "OAuth2", "Bitbucket API", "MCP"],
            metrics: [
                { label: "Distribution", value: "PyPI: bitbucket-client" },
                { label: "Type", value: "CLI + read-only MCP" },
            ],
            diagramType: "cicd",
            gradient: g.cyanViaPrimaryToAccent,
            accent: accentCycle[2],
            link: { label: "GitHub", url: "https://github.com/ml-lubich/bitbucket-cli" },
        },
    },
    {
        id: "like-fable",
        name: "like-fable",
        metric: "Portable prompt library, 6 modules",
        coverImage: "/images/projects/like-fable-hero.png",
        summary:
            "A small, portable prompt library that upgrades how any model (Opus, GPT, Gemini, Cursor) operates \u2014 one paste-in operating contract plus six mix-and-match modules for communication, judgment, honesty, collaboration, craft, and defaults.",
        tags: ["Prompt Engineering", "LLM", "Open Source"],
        gradient: g.accentViaMagentaToPrimary,
        accent: accentCycle[3],
        number: "27",
        detail: {
            title: "like-fable",
            subtitle: "Portable prompt library for agent operating behavior",
            description:
                "like-fable distills good-assistant operating behavior \u2014 leading with the answer, acting on reversible steps, reporting honestly, and writing code that fits the codebase \u2014 into one paste-in prompt plus six mix-and-match modules. It's model-agnostic (Opus, GPT, Gemini, or any tool with an instructions slot) and deliberately scoped to behavior only, leaving guardrails and safety filters untouched.",
            highlights: [
                "One paste-in operating contract (prompt.md) plus 6 mix-and-match modules \u2014 communication, judgment, honesty, collaboration, craft, defaults",
                "Model-agnostic: works on Opus, GPT, Gemini, or any assistant with an instructions slot",
                "Deliberately model-behavior-only \u2014 leaves guardrails, safety filters, and refusal behavior untouched",
                "adapters.md documents exact paste-in locations for Claude Code, Cursor, Windsurf, Copilot, ChatGPT, and Gemini",
            ],
            architecture: [
                { label: "Operating contract", icon: "layers", description: "prompt.md \u2014 the full paste-in operating contract" },
                { label: "Modules", icon: "cpu", description: "6 mix-and-match modules: communication, judgment, honesty, collaboration, craft, defaults" },
                { label: "Adapters", icon: "server", description: "adapters.md maps the prompt into Claude Code, Cursor, Windsurf, Copilot, ChatGPT, Gemini" },
                { label: "Scope", icon: "shield", description: "Shapes behavior only \u2014 leaves model guardrails and safety filters untouched" },
            ],
            techStack: ["Markdown", "Prompt Engineering"],
            metrics: [
                { label: "Modules", value: "6" },
                { label: "Type", value: "Prompt library" },
            ],
            diagramType: "pipeline",
            gradient: g.accentViaMagentaToPrimary,
            accent: accentCycle[3],
            link: { label: "GitHub", url: "https://github.com/ml-lubich/like-fable" },
        },
    },
    {
        id: "pdfify-md",
        name: "pdfify-md",
        metric: "Markdown/Mermaid → clean PDF",
        coverImage: "/images/projects/imessage-exporter-hero.png",
        summary:
            "Cross-platform CLI that renders Markdown (including Mermaid diagrams) to a clean, print-ready PDF — tables that fit the page, wrapped code blocks, no mid-word breaks. npm i -g pdfify-md.",
        tags: ["Node.js", "Markdown", "Mermaid", "PDF", "CLI"],
        gradient: g.primaryToRose,
        accent: accentCycle[5],
        number: "28",
        detail: {
            title: "pdfify-md",
            subtitle: "Markdown/Mermaid to clean PDF, cross-platform",
            description:
                "A CLI that converts Markdown (including Mermaid diagrams) into a clean, print-ready PDF — built to fix the usual pain points: tables that overflow the page, code blocks that get cut off mid-word, and diagrams that don't render. Works cross-platform via Node.js.",
            highlights: [
                "Renders Mermaid diagrams inline alongside Markdown content",
                "Print CSS tuned so tables fit the page and code wraps instead of clipping",
                "Cross-platform CLI — npm i -g pdfify-md, no native dependencies to compile",
                "Headless-Chrome rendering pipeline for pixel-accurate PDF output",
            ],
            architecture: [
                { label: "CLI", icon: "layers", description: "pdfify-md — convert one or many Markdown files to PDF" },
                { label: "Mermaid", icon: "cpu", description: "Diagram blocks rendered inline before PDF export" },
                { label: "Print CSS", icon: "zap", description: "Layout tuned for tables/code that fit the printed page" },
                { label: "Renderer", icon: "server", description: "Headless-Chrome pipeline for accurate PDF output" },
            ],
            techStack: ["Node.js", "Markdown", "Mermaid", "Puppeteer", "CLI"],
            metrics: [
                { label: "Install", value: "npm i -g pdfify-md" },
                { label: "Type", value: "CLI" },
            ],
            diagramType: "cicd",
            gradient: g.primaryToRose,
            accent: accentCycle[5],
            link: { label: "GitHub", url: "https://github.com/ml-lubich/pdfify-md" },
        },
    },
    {
        id: "jenkins-mcp",
        name: "jenkins-mcp",
        metric: "Jenkins CLI + MCP server",
        coverImage: "/images/projects/imessage-exporter-hero.png",
        summary:
            "Jenkins CLI and MCP server for querying jobs, builds, and console logs — built so coding agents can check CI status without shelling into Jenkins directly. pip install jenkins-mcp-cli.",
        tags: ["CLI", "MCP", "Python", "Jenkins", "CI/CD"],
        gradient: g.primaryToCyan,
        accent: accentCycle[4],
        number: "29",
        detail: {
            title: "jenkins-mcp",
            subtitle: "Jenkins CLI + MCP server for agents",
            description:
                "A CLI and MCP server over the Jenkins REST API — list jobs, inspect builds, and tail console logs, exposed both as terminal commands and as MCP tools so an agent can check CI status and diagnose failing builds without shell access to Jenkins.",
            highlights: [
                "CLI surface for jobs/builds/console logs against the Jenkins REST API",
                "MCP server exposes the same operations as agent-callable tools",
                "Built for agents to triage CI failures without direct Jenkins shell access",
                "Distributed on PyPI as jenkins-mcp-cli",
            ],
            architecture: [
                { label: "CLI", icon: "layers", description: "Jobs, builds, and console-log commands" },
                { label: "Jenkins API", icon: "server", description: "REST client over the Jenkins API" },
                { label: "MCP server", icon: "cpu", description: "Exposes job/build/log tools to agents over stdio" },
                { label: "Auth", icon: "shield", description: "Token-based Jenkins auth" },
            ],
            techStack: ["Python", "Jenkins API", "MCP"],
            metrics: [
                { label: "Install", value: "pip install jenkins-mcp-cli" },
                { label: "Type", value: "CLI + MCP" },
            ],
            diagramType: "cicd",
            gradient: g.primaryToCyan,
            accent: accentCycle[4],
            link: { label: "GitHub", url: "https://github.com/ml-lubich/jenkins-mcp" },
        },
    },
    {
        id: "ical-cli",
        name: "ical-cli",
        metric: "macOS Calendar.app agent tool",
        coverImage: "/images/projects/imessage-exporter-hero.png",
        summary:
            "Local Apple Calendar CLI (ical) \u2014 list calendars, schedule events, and invite attendees directly on Calendar.app; registered under tool registry as ical-cli.",
        tags: ["CLI", "AppleScript", "Python", "macOS", "Calendar"],
        gradient: g.primaryToAccent,
        accent: accentCycle[0],
        number: "30",
        detail: {
            title: "ical-cli",
            subtitle: "macOS Calendar.app CLI tool",
            description:
                "ical is a CLI agent tool over Calendar.app \u2014 list calendars, list events, create events, and invite attendees with zero cloud middleman. It follows the same scaffold as imsg, imail, and inotes, exposing clean commands and full Calendar.app synchronization.",
            highlights: [
                "CLI-first design (ical) to inspect calendars, list events, and add events with attendees",
                "Direct AppleScript automation over Calendar.app \u2014 syncs natively with iCloud/Google calendars",
                "Registered in the global tool-registry (mcpServers.ical)",
                "Open-source repo on GitHub at ml-lubich/ical",
            ],
            architecture: [
                { label: "CLI", icon: "layers", description: "ical \u2014 calendars, list, add, version" },
                { label: "Calendar.app bridge", icon: "cpu", description: "AppleScript automation over Calendar.app" },
                { label: "Tool registry", icon: "server", description: "Integrated into global ~/.config/tool-registry/registry.json" },
                { label: "Distribution", icon: "git", description: "Installed locally via uv tool install -e ~/dev/ical" },
            ],
            techStack: ["Python", "AppleScript", "Typer", "Rich", "Calendar.app"],
            metrics: [
                { label: "Install", value: "uv tool install -e ~/dev/ical" },
                { label: "Type", value: "CLI Tool" },
            ],
            diagramType: "cicd",
            gradient: g.primaryToAccent,
            accent: accentCycle[0],
            link: { label: "GitHub", url: "https://github.com/ml-lubich/ical" },
        },
    },
]
