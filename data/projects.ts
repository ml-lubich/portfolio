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
        coverImage: "/images/projects/enrichdata-hero.png",
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
            techStack: ["TypeScript", "Next.js", "React", "Tailwind CSS"],
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
        coverImage: "/images/projects/lupfr-hero.png",
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
]
