/**
 * ─── Skills Data ──────────────────────────────────────────────────────
 * Single source of truth for skill categories and proficiency bars.
 * Imported by the Skills section UI and the skill-connections utility.
 */

import { gradients as g } from "@/lib/theme"
import type { BarItem } from "@/components/animations/animated-bars"

export interface SkillCategory {
    category: string
    items: string[]
    /** Shown on the back of the flip card */
    backDetails: string[]
}

export const skillCategories: SkillCategory[] = [
    {
        category: "Languages",
        items: ["Java", "Python", "JavaScript", "TypeScript", "Go", "Rust", "C++", "SQL", "YAML"],
        backDetails: [
            "Python — primary language for ML pipelines, FastAPI services, and data engineering",
            "Java — enterprise microservices with Spring Boot serving millions of daily requests",
            "TypeScript — strict type-safe React/Next.js apps with Zod and tRPC",
            "Go & Rust — high-performance CLIs, networking, and WebAssembly modules",
        ],
    },
    {
        category: "AI/ML Engineering",
        items: ["LLM APIs", "Agentic Workflows", "RAG Architectures", "Multi-Agent Orchestration", "MCP Tool Servers", "Vector Databases", "Fine-tuning", "Prompt Engineering", "Guardrails & Safety", "LLM Observability", "PyTorch", "TensorFlow", "scikit-learn"],
        backDetails: [
            "Production LLM integrations with GPT-4o, Claude, Gemini — multi-model routing",
            "Multi-agent orchestration with CrewAI, LangGraph, and MCP tool servers",
            "RAG pipelines with pgvector, FAISS, Pinecone — adaptive chunking & re-ranking",
            "PyTorch/TensorFlow model training, LoRA fine-tuning, and LLM observability with LangSmith",
        ],
    },
    {
        category: "Frameworks & Frontend",
        items: ["Spring Boot", "Spring Cloud", "Spring Security", "Hibernate", "React", "Angular", "Next.js", "FastAPI", "Tailwind CSS", "Material UI"],
        backDetails: [
            "Spring Boot microservices with Cloud config, Security OAuth2/JWT, and Hibernate ORM",
            "React & Next.js — SSR, API routes, ISR, and complex interactive UIs with Three.js",
            "FastAPI — async Python APIs with auto-generated OpenAPI docs and Pydantic validation",
            "Tailwind CSS & Material UI — custom design systems and accessible component libraries",
        ],
    },
    {
        category: "Cloud & DevOps",
        items: ["AWS", "GCP", "Azure", "Kubernetes", "Docker", "Terraform", "GitHub Actions", "Jenkins", "Vercel", "Azure DevOps"],
        backDetails: [
            "AWS (ECS, Lambda, RDS, S3, Bedrock) — full-stack cloud for ML and web workloads",
            "Terraform IaC for multi-cloud provisioning with state management and modules",
            "Kubernetes orchestration with Helm charts, auto-scaling, and zero-downtime deploys",
            "CI/CD pipelines with GitHub Actions, Jenkins, and automated cloud deployments",
        ],
    },
    {
        category: "Databases & Messaging",
        items: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Oracle", "DynamoDB", "Pinecone", "Apache Kafka", "RabbitMQ"],
        backDetails: [
            "PostgreSQL — advanced indexing, partitioning, pgvector for embeddings",
            "Redis — caching, pub/sub, rate limiting, and session management at scale",
            "Apache Kafka — event-driven architectures with exactly-once semantics",
            "Pinecone & DynamoDB — vector search for RAG and serverless NoSQL at scale",
        ],
    },
    {
        category: "Methodologies & Testing",
        items: ["Agile/Scrum", "TDD", "Domain-Driven Design", "MLOps", "CI/CD", "JUnit", "Jest", "Selenium", "SonarQube"],
        backDetails: [
            "Agile/Scrum — sprint planning, backlog grooming, and velocity-based delivery",
            "TDD with JUnit 5, Jest, and comprehensive integration test suites",
            "MLOps — model versioning with MLflow, automated evaluation with RAGAS & DeepEval",
            "Domain-Driven Design — bounded contexts, aggregates, and ubiquitous language",
        ],
    },
]

export const proficiencyBars: BarItem[] = [
    {
        label: "Python",
        value: 97,
        display: "Expert",
        gradient: g.primaryToAccent,
        details: [
            "Primary language for ML pipelines, data engineering, and backend APIs (FastAPI, Flask)",
            "Built production ETL and inference pipelines with Airflow, Celery, and Docker",
            "Published 6 peer-reviewed papers with Python-based modeling and analysis",
            "Deep experience with async patterns, type hints, and large-scale monorepo tooling",
        ],
    },
    {
        label: "Java / Spring Boot",
        value: 93,
        display: "Expert",
        gradient: g.magentaToAccent,
        details: [
            "Enterprise microservices with Spring Boot, Spring Cloud, and Spring Security",
            "High-throughput REST & gRPC APIs handling millions of daily requests",
            "Domain-Driven Design, Hibernate ORM, and event-driven architectures with Kafka",
            "Comprehensive testing with JUnit 5, Mockito, and integration test suites",
        ],
    },
    {
        label: "TypeScript / JavaScript",
        value: 93,
        display: "Expert",
        gradient: g.cyanToPrimary,
        details: [
            "Full-stack development with React, Next.js, Angular, and Node.js",
            "Type-safe architectures with strict TypeScript, Zod validation, and tRPC",
            "Complex interactive UIs with Three.js, Framer Motion, and Canvas APIs",
            "Tooling expertise: Vite, Webpack, ESLint, Vitest, Playwright E2E testing",
        ],
    },
    {
        label: "AI/ML & LLM Systems",
        value: 95,
        display: "Expert",
        gradient: g.primaryToMagenta,
        details: [
            "Production LLM deployments with GPT-4o, Claude Sonnet 4, Gemini 2.0, Llama 4",
            "RAG architectures with pgvector, FAISS, Pinecone — adaptive chunking & re-ranking",
            "Multi-agent orchestration with CrewAI, LangGraph, and MCP tool servers",
            "MLOps pipelines: MLflow model registry, automated evaluation with RAGAS & DeepEval",
        ],
    },
    {
        label: "Cloud & Infrastructure",
        value: 90,
        display: "Expert",
        gradient: g.primaryToCyan,
        details: [
            "AWS (ECS, Lambda, RDS, S3, Bedrock), GCP, and Azure cloud architectures",
            "Infrastructure as Code with Terraform, CloudFormation, and Pulumi",
            "Kubernetes orchestration, Docker containerization, and Helm chart management",
            "CI/CD pipelines with GitHub Actions, Jenkins, and automated deployment strategies",
        ],
    },
    {
        label: "Rust / Go / C++",
        value: 72,
        display: "Proficient",
        gradient: g.accentToPrimary,
        details: [
            "Systems-level programming for performance-critical components and CLI tools",
            "Go microservices with concurrency patterns, channels, and efficient networking",
            "Rust memory-safe utilities and WebAssembly modules for browser-based computation",
            "C++ numerical computing and legacy system integration",
        ],
    },
]

/** Get the category a skill belongs to */
export function getSkillCategory(skillName: string): string | null {
    for (const cat of skillCategories) {
        if (cat.items.includes(skillName)) return cat.category
    }
    return null
}

/**
 * ─── Skill Flip-Card Descriptions ─────────────────────────────────────
 * Short descriptions shown on the back of each skill tag when hovered.
 * Describes how each tool / technology is used in practice.
 */
export const skillDescriptions: Record<string, string> = {
    /* ── Languages ─────────────────────────── */
    Java: "Enterprise microservices with Spring Boot, high-throughput APIs serving millions of daily requests.",
    Python: "Primary language for ML pipelines, data engineering, and production FastAPI services.",
    JavaScript: "Full-stack development with React, Node.js, and interactive Canvas/WebGL UIs.",
    TypeScript: "Strict type-safe architectures with Zod validation, tRPC, and large monorepo tooling.",
    Go: "High-performance microservices with goroutines, channels, and efficient networking.",
    Rust: "Memory-safe CLI tools, WebAssembly modules, and performance-critical components.",
    "C++": "Numerical computing, legacy system integration, and systems-level programming.",
    SQL: "Complex analytical queries, window functions, CTEs, and database performance tuning.",
    YAML: "Infrastructure-as-Code configs, CI/CD pipelines, Kubernetes manifests, and Helm charts.",

    /* ── AI/ML Engineering ─────────────────── */
    "LLM APIs": "Production integrations with GPT-4o, Claude, Gemini — multi-model routing for cost & latency optimization.",
    "Agentic Workflows": "Autonomous agent loops with planning, tool use, and self-correction feedback mechanisms.",
    "RAG Architectures": "Adaptive chunking, hybrid search with re-ranking, and context-aware retrieval pipelines.",
    "Multi-Agent Orchestration": "CrewAI & LangGraph systems with shared state, delegation, and parallel task execution.",
    "MCP Tool Servers": "Built context-engineered tool servers exposing APIs, databases, and file systems to LLM agents.",
    "Vector Databases": "Pinecone, Weaviate & pgvector for semantic search, similarity matching, and embedding management.",
    "Fine-tuning": "LoRA/QLoRA adapters on open-source models, dataset curation, and evaluation benchmarks.",
    "Prompt Engineering": "Few-shot, chain-of-thought, and structured output templates for reliable LLM behavior.",
    "Guardrails & Safety": "Content moderation, policy enforcement, and circuit-breaker alerting for LLM outputs.",
    "LLM Observability": "LangSmith tracing, Prometheus metrics, and Grafana dashboards for cost & latency monitoring.",
    PyTorch: "Deep learning model development, custom training loops, and GPU-accelerated inference pipelines.",
    TensorFlow: "Production model serving with TF Serving, TFLite mobile deployments, and TensorBoard monitoring.",
    "scikit-learn": "Classical ML — clustering, tree-based models, and hyperparameter tuning for environmental science.",

    /* ── Frameworks & Frontend ─────────────── */
    "Spring Boot": "Enterprise microservices with auto-configuration, actuator monitoring, and production hardening.",
    "Spring Cloud": "Service discovery, config server, circuit breakers, and distributed tracing across microservices.",
    "Spring Security": "OAuth2/JWT authentication, role-based access control, and API gateway security policies.",
    Hibernate: "ORM with optimized query strategies, second-level caching, and schema migration management.",
    React: "Component-driven UIs with hooks, context, and state management for complex interactive applications.",
    Angular: "Enterprise SPAs with RxJS, dependency injection, and module-based architecture patterns.",
    "Next.js": "Server-side rendering, API routes, ISR, and edge functions for high-performance web apps.",
    FastAPI: "Async Python APIs with auto-generated OpenAPI docs, dependency injection, and Pydantic validation.",
    "Tailwind CSS": "Utility-first styling with custom design systems, dark mode, and responsive layouts.",
    "Material UI": "Themed component libraries with accessible, production-ready enterprise UI patterns.",

    /* ── Cloud & DevOps ────────────────────── */
    AWS: "ECS, Lambda, RDS, S3, Bedrock — full-stack cloud architecture for ML and web workloads.",
    GCP: "BigQuery analytics, Vertex AI pipelines, and Cloud Run serverless deployments.",
    Azure: "Azure OpenAI Service, AKS clusters, and enterprise identity with Entra ID.",
    Kubernetes: "Container orchestration with Helm charts, auto-scaling, and zero-downtime deployments.",
    Docker: "Multi-stage builds, distroless images, and containerized ML training pipelines.",
    Terraform: "Infrastructure-as-Code for multi-cloud provisioning with state management and modules.",
    "GitHub Actions": "CI/CD workflows with matrix builds, caching, and automated deployment to cloud targets.",
    Jenkins: "Enterprise build pipelines with shared libraries, parallel stages, and artifact management.",
    Vercel: "Edge-first deployments with preview environments, analytics, and serverless functions.",
    "Azure DevOps": "Enterprise ALM with boards, pipelines, and artifact feeds for large-scale team delivery.",

    /* ── Databases & Messaging ─────────────── */
    PostgreSQL: "Advanced indexing, partitioning, pgvector for embeddings, and high-availability clustering.",
    MySQL: "Relational data modeling, replication, and query optimization for high-throughput applications.",
    MongoDB: "Document stores with aggregation pipelines, Atlas search, and flexible schema evolution.",
    Redis: "In-memory caching, pub/sub messaging, rate limiting, and session management at scale.",
    Oracle: "Enterprise data warehousing, PL/SQL stored procedures, and RAC cluster administration.",
    DynamoDB: "Serverless NoSQL with single-table design, GSIs, and on-demand auto-scaling.",
    Pinecone: "Managed vector search for RAG systems with namespace isolation and metadata filtering.",
    "Apache Kafka": "Event-driven architectures with consumer groups, exactly-once semantics, and stream processing.",
    RabbitMQ: "Message queuing with exchange routing, dead-letter queues, and reliable delivery patterns.",

    /* ── Methodologies & Testing ────────────── */
    "Agile/Scrum": "Sprint planning, backlog grooming, retrospectives, and velocity-based delivery tracking.",
    TDD: "Red-green-refactor with comprehensive unit and integration test coverage as a design practice.",
    "Domain-Driven Design": "Bounded contexts, aggregates, and ubiquitous language for complex business domains.",
    MLOps: "Model versioning with MLflow, automated evaluation with RAGAS, and A/B testing frameworks.",
    "CI/CD": "Automated build → test → deploy pipelines with quality gates and rollback strategies.",
    JUnit: "Java unit and integration testing with JUnit 5, Mockito, and parameterized test suites.",
    Jest: "JavaScript/TypeScript testing with snapshot tests, mocking, and code coverage reporting.",
    Selenium: "End-to-end browser automation with Page Object patterns and cross-browser test matrices.",
    SonarQube: "Static analysis dashboards for code quality, security vulnerabilities, and technical debt tracking.",
}
