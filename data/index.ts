/**
 * ─── Data Barrel Export ───────────────────────────────────────────────
 * Central import point for all portfolio data.
 *
 * Usage:
 *   import { experiences, projects, getSkillUsage } from "@/data"
 */

export { experiences, type Experience } from "./experiences"
export { projects, type Project } from "./projects"
export { skillCategories, proficiencyBars, getSkillCategory, type SkillCategory } from "./skills"
export { papers, gradients as publicationGradients, accents as publicationAccents, type Paper, type InsightStep } from "./publications"
export { getSkillUsage, type SkillUsageResult, type SkillUsageItem, type SkillUsageExperience, type SkillUsageProject, type SkillUsagePublication } from "./skill-connections"
