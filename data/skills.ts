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
        items: ["Java", "Python", "JavaScript", "TypeScript", "Go", "Rust", "C++", "SQL", "YAML", "Bash"],
        backDetails: [
            "Python — primary language for ML pipelines, FastAPI services, and data engineering",
            "Java — enterprise microservices with Spring Boot serving millions of daily requests",
            "TypeScript — strict type-safe React/Next.js apps with Zod and tRPC",
            "Go & Rust — high-performance CLIs, networking, and WebAssembly modules",
        ],
    },
    {
        category: "AI/ML Engineering",
        items: [
            "LLM APIs",
            "Agentic Workflows",
            "RAG Architectures",
            "Multi-Agent Orchestration",
            "MCP Tool Servers",
            "Vector Databases",
            "Fine-tuning",
            "Prompt Engineering",
            "Guardrails & Safety",
            "LLM Observability",
            "PyTorch",
            "TensorFlow",
            "scikit-learn",
            "LangGraph",
            "CrewAI",
            "pgvector",
            "FAISS",
            "LangSmith",
            "Langfuse",
        ],
        backDetails: [
            "Production LLM integrations with GPT-4o, Claude, Gemini — multi-model routing",
            "Multi-agent orchestration with CrewAI, LangGraph, and MCP tool servers",
            "RAG pipelines with pgvector, FAISS, Pinecone — adaptive chunking & re-ranking",
            "PyTorch/TensorFlow model training, LoRA fine-tuning, and LLM observability with LangSmith & Langfuse",
        ],
    },
    {
        category: "Frameworks & Frontend",
        items: ["Spring Boot", "Spring Cloud", "Spring Security", "Hibernate", "React", "Angular", "Next.js", "FastAPI", "Tailwind CSS", "Material UI", "Zod", "tRPC", "Bun", "httpx"],
        backDetails: [
            "Spring Boot microservices with Cloud config, Security OAuth2/JWT, and Hibernate ORM",
            "React & Next.js — SSR, API routes, ISR, and complex interactive UIs with Three.js",
            "FastAPI — async Python APIs with auto-generated OpenAPI docs and Pydantic validation",
            "Zod, tRPC, Bun, and httpx — type-safe contracts and fast runtimes across the stack",
        ],
    },
    {
        category: "Cloud & DevOps",
        items: ["AWS", "GCP", "Azure", "Kubernetes", "Docker", "Terraform", "GitHub Actions", "Jenkins", "Vercel", "Azure DevOps", "Helm"],
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
        items: ["Agile/Scrum", "TDD", "Domain-Driven Design", "MLOps", "CI/CD", "JUnit", "Jest", "Vitest", "Selenium", "Playwright", "SonarQube", "GitHub CLI"],
        backDetails: [
            "Agile/Scrum — sprint planning, backlog grooming, and velocity-based delivery",
            "TDD with JUnit 5, Jest, Playwright, and comprehensive integration test suites",
            "MLOps — model versioning with MLflow, automated evaluation with RAGAS & DeepEval",
            "Domain-Driven Design — bounded contexts, aggregates, and ubiquitous language",
        ],
    },
    {
        category: "Enterprise AI Delivery",
        items: [
            "Customer Discovery",
            "Solution Scoping",
            "Production Rollouts",
            "Agent Skills & Sub-Agents",
            "Eval-Driven Iteration",
            "Stakeholder Communication",
            "White-Glove Deployment",
            "Reference Architectures",
        ],
        backDetails: [
            "Embedded with strategic customer engineering teams to scope, build, and ship LLM-powered workflows end-to-end",
            "Translate ambiguous business problems into technical artifacts — MCP servers, sub-agents, and reusable agent skills",
            "Eval-driven iteration: build offline + online evals, feed signal back into prompts, tools, and model selection",
            "Codify repeatable deployment patterns into playbooks, reference architectures, and internal building blocks",
        ],
    },
    {
        category: "Agent Tooling & CLIs",
        items: [
            "MCP",
            "FastMCP",
            "stdio MCP",
            "Cursor",
            "Claude Code",
            "Typer",
            "Rich",
            "Pydantic",
            "uv",
            "pipx",
            "Hatchling",
            "maturin",
            "PyO3",
            "Agent Schema",
            "Sub-Agents",
            "JSON Schema",
            "Ollama",
            "CLI-First Design",
            "CliRunner",
            "pytest-cov",
        ],
        backDetails: [
            "Shipped a family of local-first CLI + MCP tools (imsg-mcp, imail-mcp, inotes-mcp, twig, bitbucket-cli) with Typer, Rich, and Pydantic",
            "Rust hot paths via PyO3/maturin for performance-critical CLI cores, with a pure-Python fallback",
            "Packaged and published with uv, pipx, and Hatchling; TDD with pytest-cov and Typer's CliRunner",
            "Agent-first design: JSON output, agent schema/guide commands, and stdio MCP servers so LLM tools can drive the CLI safely",
        ],
    },
    {
        category: "macOS & Cross-Platform Automation",
        items: [
            "AppleScript",
            "Mail.app",
            "Notes.app",
            "Exchange",
            "iMessage",
            "WhatsApp Bridge",
            "Homebrew",
            "Bitbucket CLI",
            "Confluence CLI",
            "Atlassian MCP",
            "Account Walls",
        ],
        backDetails: [
            "AppleScript automation over Mail.app, Notes.app, and Messages.app for local-first agent tooling",
            "Account walls that hard-separate work (Exchange/Polaris) and personal mail so agents can never cross-send",
            "Go-bridged WhatsApp automation and Homebrew tap packaging for the *-mcp CLI family",
            "gh-style Bitbucket CLI and Confluence CLI built for safe, idempotent, agent-driven operation",
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
    Bash: "Shell scripting for setup scripts, CLI installers, and CI automation across the *-mcp tool family.",

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
    LangGraph: "Graph-orchestrated agents — gather, reason with tools, extract, and gate every write with deterministic checks.",
    CrewAI: "Multi-agent crews (Architect, Generator, Auditor, Reporter) chained sequentially for synthetic data and reporting pipelines.",
    pgvector: "Postgres extension for embedding storage and similarity search inside existing relational schemas.",
    FAISS: "Local vector index for RAG retrieval — adaptive chunking, re-ranking, and offline evaluation.",
    LangSmith: "Trace and evaluate LLM chains — latency, cost, and quality regressions caught before shipping.",
    Langfuse: "Self-hosted LLM observability — full run traces for agentic pipelines like the Case Triage Agent.",

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
    Zod: "Runtime schema validation and type inference for API boundaries and form input.",
    tRPC: "End-to-end type-safe APIs between Next.js frontends and Node backends, no codegen step.",
    Bun: "Fast JS/TS runtime and package manager — this portfolio's dev server and test runner.",
    httpx: "Async-capable Python HTTP client for FastAPI services and CLI tools that call external APIs.",

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
    Helm: "Kubernetes package management — templated charts, releases, and rollbacks across environments.",

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
    Playwright: "Modern end-to-end testing with auto-waiting locators, trace-viewer debugging, and parallel cross-browser CI runs.",
    SonarQube: "Static analysis dashboards for code quality, security vulnerabilities, and technical debt tracking.",
    Vitest: "Fast unit/integration test runner — data-integrity, component-export, and regression suites for this site.",
    "GitHub CLI": "gh-style terminal workflows for PRs, issues, and releases — the ergonomics bitbucket-cli mirrors for Bitbucket.",

    /* ── Enterprise AI Delivery ─────────────── */
    "Customer Discovery": "Embedded discovery with engineering and domain stakeholders to map workflows, constraints, and success metrics.",
    "Solution Scoping": "Translating ambiguous business problems into sequenced technical scope, trade-offs, and delivery milestones.",
    "Production Rollouts": "End-to-end ownership from prototype to stable production — phased rollout, SLOs, on-call, and rollback playbooks.",
    "Agent Skills & Sub-Agents": "Reusable agent skills, MCP servers, and sub-agents wired into customer systems for repeatable workflows.",
    "Eval-Driven Iteration": "Offline + online eval harnesses (RAGAS, DeepEval, custom) feeding signal back into prompts, tools, and model selection.",
    "Stakeholder Communication": "Translating model behavior and trade-offs for executives, product, and engineering — low ego, high clarity.",
    "White-Glove Deployment": "Hands-on deployment support inside customer environments with strict security, IT, and compliance constraints.",
    "Reference Architectures": "Codifying repeatable deployment patterns into playbooks, building blocks, and internal reference architectures.",

    /* ── Agent Tooling & CLIs ───────────────── */
    MCP: "Model Context Protocol — stdio tool servers exposing local data and actions to Claude, Cursor, and other agent clients.",
    FastMCP: "Python framework for standing up MCP servers quickly with typed tool schemas.",
    "stdio MCP": "MCP transport over stdin/stdout — the default for local-first tool servers like imsg-mcp and wa-mcp.",
    Cursor: "Primary agentic IDE — MCP client, multi-file edits, and subagent orchestration for this entire tool family.",
    "Claude Code": "CLI coding agent used for autonomous multi-step implementation and MCP tool integration.",
    Typer: "Type-hint-driven Python CLI framework powering the imsg / imail / inotes / twig command surfaces.",
    Rich: "Terminal formatting — tables, progress bars, and colorized output across the CLI family.",
    Pydantic: "Typed request/response and config models for CLIs and FastAPI services.",
    uv: "Fast Python package/venv manager — primary install path for the *-mcp CLI family.",
    pipx: "Isolated global installs for Python CLIs (e.g. `pipx install twig-cli`) without polluting system Python.",
    Hatchling: "PEP 517 build backend for packaging pure-Python CLI projects for PyPI.",
    maturin: "Builds and publishes Rust (PyO3) extensions as installable Python wheels — used for imsg's Rust core.",
    PyO3: "Rust ⇄ Python bindings — the hot path behind imsg's 3.4× faster message search.",
    "Agent Schema": "Machine-readable command contracts (e.g. `imail agent schema`) so LLM tools can discover a CLI's full surface.",
    "Sub-Agents": "Delegated, scoped agent workers orchestrated by a parent agent for search, implementation, and review.",
    "JSON Schema": "Structured contracts for CLI --json output and MCP tool parameters that agents can validate against.",
    Ollama: "Local LLM runtime — provider-agnostic chat backend alongside cloud APIs in the RAG Knowledge Base.",
    "CLI-First Design": "CLI as the primary agent interface (saves tokens vs. MCP round-trips); MCP layered on top only where needed.",
    CliRunner: "Typer/Click test harness for invoking CLI commands in-process and asserting on output and exit codes.",
    "pytest-cov": "Coverage-gated pytest runs — the ≥90% bar enforced on imsg-mcp's test suite.",

    /* ── macOS & Cross-Platform Automation ──── */
    AppleScript: "Automation layer driving Mail.app, Notes.app, and Messages.app from CLI tools without private APIs.",
    "Mail.app": "Local mail client automated by imail — accounts, list, send, and organize via AppleScript.",
    "Notes.app": "Local notes client automated by inotes — list, search, show, and create via AppleScript.",
    Exchange: "Corporate mail account type routed through Mail.app and kept behind imail's account walls.",
    iMessage: "Local Messages database (chat.db) read-only search/export, with sends isolated through Messages.app.",
    "WhatsApp Bridge": "Go (whatsmeow) bridge authenticating via QR and syncing WhatsApp history to a local SQLite store.",
    Homebrew: "macOS package manager — distribution tap (`ml-lubich/tap`) for the imsg/inotes CLI family.",
    "Bitbucket CLI": "gh-style terminal client (`bb`) for Bitbucket Cloud and Data Center — PRs, repos, issues, pipelines.",
    "Confluence CLI": "Idempotent bulk move/mirror/migration CLI over the Confluence REST API, safe for agents to re-run.",
    "Atlassian MCP": "Jira + Confluence tool access over MCP for agent-driven ticket and wiki workflows.",
    "Account Walls": "Hard separation between work and personal mail accounts so an agent can never cross-send.",
}
