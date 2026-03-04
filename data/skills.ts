/**
 * ─── Skills Data ──────────────────────────────────────────────────────
 * Single source of truth for skill categories and proficiency bars.
 * Imported by the Skills section UI and the skill-connections utility.
 */

import { gradients as g } from "@/lib/theme"

export interface SkillCategory {
    category: string
    items: string[]
}

export interface ProficiencyBar {
    label: string
    value: number
    display: string
    gradient: string
}

export const skillCategories: SkillCategory[] = [
    {
        category: "Languages",
        items: ["Java", "Python", "JavaScript", "TypeScript", "Go", "Rust", "C++", "SQL", "YAML"],
    },
    {
        category: "AI/ML Engineering",
        items: ["LLM APIs", "Agentic Workflows", "RAG Architectures", "Multi-Agent Orchestration", "MCP Tool Servers", "Vector Databases", "Fine-tuning", "Prompt Engineering", "Guardrails & Safety", "LLM Observability", "PyTorch", "TensorFlow", "scikit-learn"],
    },
    {
        category: "Frameworks & Frontend",
        items: ["Spring Boot", "Spring Cloud", "Spring Security", "Hibernate", "React", "Angular", "Next.js", "FastAPI", "Tailwind CSS", "Material UI"],
    },
    {
        category: "Cloud & DevOps",
        items: ["AWS", "GCP", "Azure", "Kubernetes", "Docker", "Terraform", "GitHub Actions", "Jenkins", "Vercel", "Azure DevOps"],
    },
    {
        category: "Databases & Messaging",
        items: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Oracle", "DynamoDB", "Pinecone", "Apache Kafka", "RabbitMQ"],
    },
    {
        category: "Methodologies & Testing",
        items: ["Agile/Scrum", "TDD", "Domain-Driven Design", "MLOps", "CI/CD", "JUnit", "Jest", "Selenium", "SonarQube"],
    },
]

export const proficiencyBars: ProficiencyBar[] = [
    { label: "Python", value: 97, display: "Expert", gradient: g.primaryToAccent },
    { label: "Java / Spring Boot", value: 93, display: "Expert", gradient: g.magentaToAccent },
    { label: "TypeScript / JavaScript", value: 93, display: "Expert", gradient: g.cyanToPrimary },
    { label: "AI/ML & LLM Systems", value: 95, display: "Expert", gradient: g.primaryToMagenta },
    { label: "Cloud & Infrastructure", value: 90, display: "Expert", gradient: g.primaryToCyan },
    { label: "Rust / Go / C++", value: 72, display: "Proficient", gradient: g.accentToPrimary },
]

/** Get the category a skill belongs to */
export function getSkillCategory(skillName: string): string | null {
    for (const cat of skillCategories) {
        if (cat.items.includes(skillName)) return cat.category
    }
    return null
}
