/**
 * ─── Skill Connections ────────────────────────────────────────────────
 * Cross-references skills → experiences, projects, publications.
 *
 * Uses an alias map so abstract skill names (e.g. "LLM APIs") can match
 * concrete tech-stack entries (e.g. "LangGraph", "CrewAI").
 * Zero manual wiring — everything is derived from detail.techStack[].
 */

import { experiences, type Experience } from "./experiences"
import { projects, type Project } from "./projects"
import { papers, type Paper } from "./publications"

/* ── Alias map ─────────────────────────────────────────────────────
 * Maps abstract skill display names to the concrete tech-stack strings
 * they should match against. The key itself is always checked too. */
const skillAliases: Record<string, string[]> = {
    // AI/ML concepts → concrete tools they map to
    "LLM APIs": ["CrewAI", "LangGraph", "FastAPI", "LLM"],
    "Agentic Workflows": ["CrewAI", "LangGraph"],
    "RAG Architectures": ["pgvector", "FAISS", "Pinecone", "Vector"],
    "Multi-Agent Orchestration": ["CrewAI", "LangGraph"],
    "MCP Tool Servers": ["CrewAI", "FastAPI"],
    "Vector Databases": ["pgvector", "FAISS", "Pinecone"],
    "Fine-tuning": ["PyTorch", "TensorFlow", "scikit-learn"],
    "Prompt Engineering": ["CrewAI", "LangGraph", "LLM"],
    "Guardrails & Safety": ["CrewAI", "LangGraph", "Prometheus"],
    "LLM Observability": ["Prometheus", "Grafana", "LangSmith"],

    // Framework groupings
    "Spring Boot": ["Spring Boot", "Spring"],
    "Spring Cloud": ["Spring Cloud", "Spring"],
    "Spring Security": ["Spring Security", "Spring"],
    "Tailwind CSS": ["Tailwind"],
    "Material UI": ["Material UI", "MUI"],
    "Next.js": ["Next.js", "Next"],

    // Cloud shortcuts
    AWS: ["AWS", "Lambda", "ECS", "S3", "RDS", "Bedrock", "DynamoDB", "Amazon"],
    GCP: ["GCP", "Google Cloud"],
    Azure: ["Azure"],

    // DB / messaging
    "Apache Kafka": ["Kafka"],
    PostgreSQL: ["PostgreSQL", "pgvector"],

    // Methodology concepts
    "Agile/Scrum": [],
    TDD: ["JUnit", "Jest", "Pytest", "Selenium"],
    "Domain-Driven Design": [],
    MLOps: ["MLflow", "Airflow", "Docker", "Kubernetes"],
    "CI/CD": ["GitHub Actions", "Jenkins", "CI/CD", "Ansible"],

    // Language groupings
    "C++": ["C++", "C"],
    SQL: ["SQL", "PostgreSQL", "MySQL", "Oracle", "RDS", "SQLite"],
    YAML: ["Terraform", "Docker", "Kubernetes", "Ansible", "GitHub Actions"],
}

/* ── Result types ─────────────────────────────────────────────────── */

export interface SkillUsageExperience {
    kind: "experience"
    id: string
    title: string
    company: string
    period: string
    summary: string
    gradient: string
    accent: string
}

export interface SkillUsageProject {
    kind: "project"
    id: string
    name: string
    metric: string
    summary: string
    gradient: string
    accent: string
}

export interface SkillUsagePublication {
    kind: "publication"
    title: string
    venue: string
    year: string
    href: string
    summary: string
}

export type SkillUsageItem = SkillUsageExperience | SkillUsageProject | SkillUsagePublication

export interface SkillUsageResult {
    skill: string
    category: string | null
    items: SkillUsageItem[]
}

/* ── Matching logic ───────────────────────────────────────────────── */

function normalise(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9+#]/g, "")
}

function skillMatchesTech(skill: string, techStack: string[]): boolean {
    const norm = normalise(skill)
    // Direct match
    if (techStack.some((t) => normalise(t) === norm)) return true
    // Check if any tech contains the skill name (partial match for terms like "Python")
    if (techStack.some((t) => normalise(t).includes(norm) || norm.includes(normalise(t)))) return true
    // Alias match
    const aliases = skillAliases[skill]
    if (aliases) {
        for (const alias of aliases) {
            const normAlias = normalise(alias)
            if (techStack.some((t) => normalise(t) === normAlias || normalise(t).includes(normAlias))) return true
        }
    }
    return false
}

function matchesPublication(skill: string, paper: Paper): boolean {
    // Check tags
    const norm = normalise(skill)
    if (paper.tags.some((t) => normalise(t) === norm || normalise(t).includes(norm) || norm.includes(normalise(t)))) return true
    // Check aliases against tags
    const aliases = skillAliases[skill]
    if (aliases) {
        for (const alias of aliases) {
            const normAlias = normalise(alias)
            if (paper.tags.some((t) => normalise(t) === normAlias || normalise(t).includes(normAlias))) return true
        }
    }
    return false
}

/* ── Public API ───────────────────────────────────────────────────── */

import { getSkillCategory } from "./skills"

/**
 * Given a skill name, returns all experiences, projects, and publications
 * where that skill (or its aliases) appear in the tech stack / tags.
 */
export function getSkillUsage(skill: string): SkillUsageResult {
    const items: SkillUsageItem[] = []

    // Scan experiences
    for (const exp of experiences) {
        if (skillMatchesTech(skill, exp.detail.techStack) || skillMatchesTech(skill, exp.tags)) {
            items.push({
                kind: "experience",
                id: exp.id,
                title: exp.title,
                company: exp.company,
                period: exp.period,
                summary: exp.summary,
                gradient: exp.gradient,
                accent: exp.accent,
            })
        }
    }

    // Scan projects
    for (const proj of projects) {
        if (skillMatchesTech(skill, proj.detail.techStack) || skillMatchesTech(skill, proj.tags)) {
            items.push({
                kind: "project",
                id: proj.id,
                name: proj.name,
                metric: proj.metric,
                summary: proj.summary,
                gradient: proj.gradient,
                accent: proj.accent,
            })
        }
    }

    // Scan publications
    for (const paper of papers) {
        if (matchesPublication(skill, paper)) {
            items.push({
                kind: "publication",
                title: paper.title,
                venue: paper.venue,
                year: paper.year,
                href: paper.href,
                summary: paper.summary,
            })
        }
    }

    return {
        skill,
        category: getSkillCategory(skill),
        items,
    }
}
