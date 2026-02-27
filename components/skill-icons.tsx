"use client"

/**
 * Skill → Icon mapping
 * Uses vectorised Simple Icons (react-icons/si) for real technology logos
 * and Lucide icons for abstract / methodology concepts.
 */

import type { ReactNode } from "react"

/* ── Simple Icons (vector tech logos) ───────────────────────────── */
import {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiGo,
  SiRust,
  SiCplusplus,
  SiReact,
  SiAngular,
  SiNextdotjs,
  SiTailwindcss,
  SiMui,
  SiSpring,
  SiSpringboot,
  SiSpringsecurity,
  SiHibernate,
  SiFastapi,
  SiAmazonwebservices,
  SiGooglecloud,
  SiKubernetes,
  SiDocker,
  SiTerraform,
  SiGithubactions,
  SiJenkins,
  SiVercel,
  SiPostgresql,
  SiMysql,
  SiMongodb,
  SiRedis,
  SiOracle,
  SiAmazondynamodb,
  SiApachekafka,
  SiRabbitmq,
  SiPytorch,
  SiTensorflow,
  SiScikitlearn,
  SiOpenai,
  SiJest,
  SiSelenium,
  SiSonarqube,
} from "react-icons/si"

/* ── Lucide icons (for concepts / items without brand logos) ───── */
import {
  Coffee,
  Cloud,
  Database,
  FileCode2,
  Bot,
  Search,
  Network,
  Server,
  SlidersHorizontal,
  MessageSquareCode,
  ShieldCheck,
  Eye,
  TreePine,
  RefreshCcw,
  TestTube2,
  Layers,
  Cpu,
  GitBranch,
  GitMerge,
  Workflow,
} from "lucide-react"

const cls = "h-3.5 w-3.5 shrink-0"

/** Map of skill name → JSX icon element */
export const skillIconMap: Record<string, ReactNode> = {
  /* ── Languages ──────────────────────── */
  Java:        <Coffee className={cls} />,
  Python:      <SiPython className={cls} />,
  JavaScript:  <SiJavascript className={cls} />,
  TypeScript:  <SiTypescript className={cls} />,
  Go:          <SiGo className={cls} />,
  Rust:        <SiRust className={cls} />,
  "C++":       <SiCplusplus className={cls} />,
  SQL:         <Database className={cls} />,
  YAML:        <FileCode2 className={cls} />,

  /* ── AI / ML Engineering ────────────── */
  "LLM APIs":                  <SiOpenai className={cls} />,
  "Agentic Workflows":         <Bot className={cls} />,
  "RAG Architectures":         <Search className={cls} />,
  "Multi-Agent Orchestration":  <Network className={cls} />,
  "MCP Tool Servers":           <Server className={cls} />,
  "Vector Databases":           <TreePine className={cls} />,
  "Fine-tuning":                <SlidersHorizontal className={cls} />,
  "Prompt Engineering":         <MessageSquareCode className={cls} />,
  "Guardrails & Safety":        <ShieldCheck className={cls} />,
  "LLM Observability":          <Eye className={cls} />,
  PyTorch:                      <SiPytorch className={cls} />,
  TensorFlow:                   <SiTensorflow className={cls} />,
  "scikit-learn":               <SiScikitlearn className={cls} />,

  /* ── Frameworks & Frontend ──────────── */
  "Spring Boot":     <SiSpringboot className={cls} />,
  "Spring Cloud":    <SiSpring className={cls} />,
  "Spring Security": <SiSpringsecurity className={cls} />,
  Hibernate:         <SiHibernate className={cls} />,
  React:             <SiReact className={cls} />,
  Angular:           <SiAngular className={cls} />,
  "Next.js":         <SiNextdotjs className={cls} />,
  FastAPI:           <SiFastapi className={cls} />,
  "Tailwind CSS":    <SiTailwindcss className={cls} />,
  "Material UI":     <SiMui className={cls} />,

  /* ── Cloud & DevOps ─────────────────── */
  AWS:              <SiAmazonwebservices className={cls} />,
  GCP:              <SiGooglecloud className={cls} />,
  Azure:            <Cloud className={cls} />,
  Kubernetes:       <SiKubernetes className={cls} />,
  Docker:           <SiDocker className={cls} />,
  Terraform:        <SiTerraform className={cls} />,
  "GitHub Actions": <SiGithubactions className={cls} />,
  Jenkins:          <SiJenkins className={cls} />,
  Vercel:           <SiVercel className={cls} />,
  "Azure DevOps":   <GitMerge className={cls} />,

  /* ── Databases & Messaging ──────────── */
  PostgreSQL:     <SiPostgresql className={cls} />,
  MySQL:          <SiMysql className={cls} />,
  MongoDB:        <SiMongodb className={cls} />,
  Redis:          <SiRedis className={cls} />,
  Oracle:         <SiOracle className={cls} />,
  DynamoDB:       <SiAmazondynamodb className={cls} />,
  Pinecone:       <TreePine className={cls} />,
  "Apache Kafka": <SiApachekafka className={cls} />,
  RabbitMQ:       <SiRabbitmq className={cls} />,

  /* ── Methodologies & Testing ────────── */
  "Agile/Scrum":          <RefreshCcw className={cls} />,
  TDD:                    <TestTube2 className={cls} />,
  "Domain-Driven Design": <Layers className={cls} />,
  MLOps:                  <Cpu className={cls} />,
  "CI/CD":                <GitBranch className={cls} />,
  JUnit:                  <TestTube2 className={cls} />,
  Jest:                   <SiJest className={cls} />,
  Selenium:               <SiSelenium className={cls} />,
  SonarQube:              <SiSonarqube className={cls} />,
}

/** Helper: return the icon for a given skill name, or null if none mapped */
export function getSkillIcon(name: string): ReactNode | null {
  return skillIconMap[name] ?? null
}
