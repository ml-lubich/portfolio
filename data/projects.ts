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
]
