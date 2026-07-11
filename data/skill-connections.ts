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
    "LLM APIs": ["CrewAI", "LangGraph", "FastAPI", "LLM", "Claude", "Claude API", "Google Gemini", "MiniMax", "OpenRouter", "Ollama"],
    "Agentic Workflows": ["Agentic AI", "Agents", "CrewAI", "LangGraph"],
    "RAG Architectures": ["RAG", "pgvector", "FAISS", "Pinecone", "Vector"],
    "Multi-Agent Orchestration": ["CrewAI", "LangGraph"],
    "MCP Tool Servers": ["CrewAI", "FastAPI"],
    "Vector Databases": ["pgvector", "FAISS", "Pinecone", "Vector"],
    "Fine-tuning": ["PyTorch", "TensorFlow", "scikit-learn"],
    "Prompt Engineering": ["CrewAI", "LangGraph", "LLM", "Claude", "Google Gemini", "MiniMax"],
    "Guardrails & Safety": ["CrewAI", "LangGraph", "Prometheus"],
    "LLM Observability": ["Prometheus", "Grafana", "LangSmith", "Langfuse", "Datadog"],

    // Framework groupings
    "Spring Boot": ["Spring Boot", "Spring"],
    "Spring Cloud": ["Spring Cloud", "Spring"],
    "Spring Security": ["Spring Security", "Spring"],
    "Tailwind CSS": ["Tailwind"],
    "Material UI": ["Material UI", "MUI", "React", "Angular"],
    "Next.js": ["Next.js", "Next"],

    // Cloud shortcuts
    AWS: ["AWS", "Lambda", "ECS", "S3", "RDS", "Bedrock", "DynamoDB", "Amazon"],
    GCP: ["GCP", "Google Cloud", "Google Vertex", "Google Gemini"],
    Azure: ["Azure", "AWS", "GCP"],
    Kubernetes: ["Kubernetes", "Docker", "ECS"],
    Jenkins: ["Jenkins", "CI/CD", "GitHub Actions"],
    "Azure DevOps": ["Azure DevOps", "CI/CD", "GitHub Actions"],

    // DB / messaging
    "Apache Kafka": ["Kafka"],
    PostgreSQL: ["PostgreSQL", "pgvector"],
    MySQL: ["MySQL", "SQL"],
    MongoDB: ["MongoDB"],
    Oracle: ["Oracle", "SQL"],
    DynamoDB: ["DynamoDB", "AWS"],
    RabbitMQ: ["RabbitMQ", "Kafka", "Apache Kafka"],

    // Methodology concepts
    "Agile/Scrum": ["Agile", "Scrum", "Leadership", "Startup", "MVP"],
    TDD: ["JUnit", "Jest", "Pytest", "Selenium", "Playwright"],
    "Domain-Driven Design": ["Domain-Driven Design", "System Design", "Spring Boot", "Hibernate", "Apache Kafka"],
    MLOps: ["MLflow", "Airflow", "Docker", "Kubernetes"],
    "CI/CD": ["GitHub Actions", "Jenkins", "CI/CD", "Ansible"],
    JUnit: ["JUnit", "Java", "Spring Boot"],
    Jest: ["Jest", "React", "Next.js", "TypeScript"],
    Selenium: ["Selenium", "Playwright"],
    Playwright: ["Playwright", "Selenium", "E2E"],
    SonarQube: ["SonarQube", "CI/CD", "GitHub Actions"],

    // Language groupings
    "C++": ["C++", "C"],
    Rust: ["Rust", "C++", "System Programming", "CLI"],
    SQL: ["SQL", "PostgreSQL", "MySQL", "Oracle", "RDS", "SQLite"],
    YAML: ["Terraform", "Docker", "Kubernetes", "Ansible", "GitHub Actions"],

    // Enterprise AI delivery → wire to LLM / agent / cloud stacks
    "Customer Discovery": ["CrewAI", "LangGraph", "FastAPI"],
    "Solution Scoping": ["CrewAI", "LangGraph", "FastAPI", "Next.js"],
    "Production Rollouts": ["AWS", "Kubernetes", "Docker", "Terraform", "ECS", "Lambda"],
    "Agent Skills & Sub-Agents": ["CrewAI", "LangGraph", "MCP"],
    "Eval-Driven Iteration": ["LangSmith", "Prometheus", "Grafana", "MLflow"],
    "Stakeholder Communication": ["Leadership", "Startup", "MVP", "B2B"],
    "White-Glove Deployment": ["AWS", "Azure", "Terraform", "Kubernetes"],
    "Reference Architectures": ["CrewAI", "LangGraph", "FastAPI", "AWS", "Terraform"],
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

function tokens(s: string): string[] {
    return s
        .toLowerCase()
        .split(/[^a-z0-9+#]+/g)
        .filter(Boolean)
}

function termMatchesText(term: string, text: string): boolean {
    const normTerm = normalise(term)
    const normText = normalise(text)
    if (normTerm === normText) return true

    const termTokens = tokens(term)
    const textTokens = tokens(text)
    return termTokens.length > 0 && termTokens.every((token) => textTokens.includes(token))
}

function skillMatchesTech(skill: string, techStack: string[]): boolean {
    if (techStack.some((t) => termMatchesText(skill, t))) return true

    const aliases = skillAliases[skill]
    if (aliases) {
        for (const alias of aliases) {
            if (techStack.some((t) => termMatchesText(alias, t))) return true
        }
    }
    return false
}

function matchesPublication(skill: string, paper: Paper): boolean {
    if (paper.tags.some((t) => termMatchesText(skill, t))) return true

    const aliases = skillAliases[skill]
    if (aliases) {
        for (const alias of aliases) {
            if (paper.tags.some((t) => termMatchesText(alias, t))) return true
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
