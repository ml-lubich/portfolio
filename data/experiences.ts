/**
 * ─── Experience / Journey Data ────────────────────────────────────────
 * Single source of truth for all professional experiences.
 * Imported by both the Journey section UI and the skill-connections utility.
 */

import type { DetailPanelData } from "@/components/detail-panel/types"
import { gradients as g, accentCycle } from "@/lib/theme"

export interface Experience {
    id: string
    title: string
    company: string
    period: string
    location: string
    summary: string
    tags: string[]
    gradient: string
    accent: string
    number: string
    detail: DetailPanelData
    /** Employer logo, e.g. "/logos/echostar.svg". Omitted falls back to the briefcase icon. */
    logo?: string
}

export const experiences: Experience[] = [
    {
        id: "echostar",
        title: "Staff AI Engineer",
        company: "EchoStar",
        period: "Sep 2026 – Present",
        location: "SF Bay Area",
        summary:
            "Builds the AI pipelines behind consumer-grade telecom — retrieval, agent orchestration and evaluation running against a network millions of customers depend on every day.",
        tags: ["Python", "LLM", "RAG", "Agents", "Pipelines", "Telecom", "Evaluation"],
        gradient: g.primaryViaSkyToAccent,
        accent: accentCycle[1],
        number: "01",
        logo: "/logos/echostar.svg",
        detail: {
            title: "Staff AI Engineer",
            subtitle: "EchoStar",
            period: "September 2026 – Present",
            location: "SF Bay Area",
            description:
                "Chose EchoStar over offers and final-round outcomes at defense-tech companies including Anduril and Mach Industries. The draw was blast radius: consumer-grade telecom puts AI in front of millions of ordinary customers rather than a narrow mission set, so the same pipeline work reaches far more people.",
            highlights: [
                "Builds production AI pipelines — retrieval, agent orchestration, and evaluation — against consumer telecom systems serving millions of subscribers",
                "Received offers from and passed final rounds at top defense and frontier-tech companies including Anduril and Mach Industries",
                "Chose consumer-scale impact over defense: the same agent and RAG work reaches millions of everyday customers",
            ],
            architecture: [
                { label: "Retrieval", icon: "database", description: "Grounded retrieval over operational and customer-facing corpora" },
                { label: "Agent Orchestration", icon: "layers", description: "Tool-calling pipelines with deterministic execution boundaries" },
                { label: "Evaluation", icon: "shield", description: "Offline and online evals gating what reaches customers" },
            ],
            techStack: ["Python", "LLM Serving", "RAG", "Agents", "Vector Search", "Kubernetes", "Postgres"],
            metrics: [
                { label: "Scale", value: "Millions of Customers" },
                { label: "Focus", value: "Consumer Telecom" },
                { label: "Started", value: "Sept 2026" },
            ],
            diagramType: "agents",
            gradient: g.primaryViaSkyToAccent,
            accent: accentCycle[1],
            link: { label: "EchoStar", url: "https://www.echostar.com" },
        },
    },
    {
        id: "polaris",
        title: "Platform & AI Software Engineer",
        company: "Polaris Wireless",
        period: "Sep 2024 – Sep 2026",
        location: "Santa Clara, CA",
        summary:
            "Architected agentic data engine (AigisQuery) using MCP tools, optimized open-weight model inference (vLLM) under 200ms latency over carrier-scale spatial datasets (Kafka, ClickHouse).",
        tags: ["Python", "Rust", "vLLM", "MCP", "ClickHouse", "Kafka", "Postgres"],
        gradient: g.cyanToPrimary,
        accent: accentCycle[0],
        number: "02",
        logo: "/logos/polaris-wireless.svg",
        detail: {
            title: "Platform & AI Software Engineer",
            subtitle: "Polaris Wireless",
            period: "September 2024 – September 2026",
            location: "Santa Clara, CA",
            description:
                "Architected distributed multi-agent systems and carrier-scale spatial data platforms processing billions of real-time records. Built autonomous query engines using MCP tool servers and deployed open-weight models (DeepSeek, Qwen) via vLLM with strict execution safety guardrails.",
            highlights: [
                "Built autonomous query platform (AigisQuery) using Model Context Protocol (MCP) tool servers, enabling plain-English querying over complex spatial datasets",
                "Deployed open-weight models (DeepSeek, Qwen) via vLLM on multi-GPU nodes with deterministic RAG guardrails, driving SQL syntax errors to near zero",
                "Scaled Kafka, ClickHouse, and ElasticSearch pipelines processing billions of real-time spatial records with query latencies locked under 200ms",
                "Engineered automated AI test-generation pipelines, expanding regression coverage from 40 to 300+ edge-case scenarios",
                "Implemented deterministic loop-detection, step-budget limits, and prompt-injection defenses into agent runtimes",
            ],
            architecture: [
                { label: "MCP Query Engine", icon: "layers", description: "AigisQuery platform for natural-language spatial data querying" },
                { label: "vLLM Inference", icon: "cpu", description: "Multi-GPU open-weight model serving with deterministic RAG guardrails" },
                { label: "Spatial Pipelines", icon: "database", description: "Kafka + ClickHouse + ElasticSearch sub-200ms real-time ingestion" },
                { label: "Execution Safety", icon: "shield", description: "Loop-detection, step budget limits, and prompt-injection defenses" },
            ],
            techStack: ["Python", "Rust", "vLLM", "Model Context Protocol", "ClickHouse", "Apache Kafka", "ElasticSearch", "Postgres", "Docker"],
            metrics: [
                { label: "Query Latency", value: "<200ms" },
                { label: "Test Coverage", value: "300+ Edge Cases" },
                { label: "Data Scale", value: "Billions of Records" },
            ],
            diagramType: "agents",
            gradient: g.cyanToPrimary,
            accent: accentCycle[0],
            link: { label: "Polaris Wireless", url: "https://www.polariswireless.com" },
        },
    },
    {
        id: "ai-consulting",
        title: "AI Engineering Consultant",
        company: "Independent / On-Prem Engagements",
        period: "2024 – Present",
        location: "Remote — On-Prem Deployments",
        summary:
            "Builds knowledge graphs and self-improving agentic systems for businesses and organizations, deployed fully on-premises — including a production knowledge base for an industrial enterprise.",
        tags: ["Knowledge Graphs", "Agents", "On-Prem", "RAG", "LLM"],
        gradient: g.cyanToPrimary,
        accent: accentCycle[2],
        number: "03",
        detail: {
            title: "AI Engineering Consultant",
            subtitle: "Independent / On-Prem Engagements",
            period: "2024 – Present",
            location: "Remote — On-Prem Deployments",
            description:
                "Designs and deploys knowledge graphs and self-improving agentic systems on-premises for businesses and organizations, with no data leaving the client network. Flagship engagement: a production knowledge base for an industrial enterprise that consolidated internal and operational knowledge into a queryable, continuously-improving system.",
            highlights: [
                "Designed knowledge graphs over heterogeneous enterprise data sources, enabling structured traversal and semantic querying across siloed information",
                "Deployed LLMs fully on-prem in air-gapped environments — zero data egress, all inference runs on client infrastructure",
                "Built self-improving agents with feedback and evaluation loops that refine retrieval quality and response accuracy over time",
                "Implemented retrieval pipelines over operational and institutional knowledge, surfacing answers from internal documents and structured sources",
                "Developed ingestion pipelines from internal docs, manuals, and structured data sources into a unified knowledge graph",
                "Enforced access-controlled querying so staff see only the knowledge scoped to their role",
            ],
            architecture: [
                { label: "Knowledge Graph", icon: "database", description: "Graph-structured enterprise knowledge over heterogeneous data sources" },
                { label: "On-Prem LLM", icon: "server", description: "Air-gapped LLM inference — no data leaves the client network" },
                { label: "Ingestion Pipeline", icon: "layers", description: "Document and structured-data ingestion into the knowledge graph" },
                { label: "Self-Improving Loop", icon: "cpu", description: "Feedback and eval loops that continuously refine retrieval and agent quality" },
                { label: "Access Control", icon: "shield", description: "Role-scoped querying ensuring staff access only authorized knowledge" },
            ],
            techStack: ["Python", "Neo4j", "LangGraph", "Ollama", "pgvector", "FastAPI", "Docker"],
            metrics: [
                { label: "Deployment", value: "On-Prem" },
                { label: "Data Egress", value: "Zero" },
                { label: "Agents", value: "Self-Improving" },
            ],
            diagramType: "agents",
            gradient: g.cyanToPrimary,
            accent: accentCycle[2],
        },
    },
    {
        id: "apple",
        title: "Software Development Engineer in Test",
        company: "Apple",
        period: "Jan 2023 – Jul 2024",
        location: "Cupertino, CA",
        summary:
            "Migrated 20+ legacy Python test scripts with AI pipelines, maintained stable APFS deployments for macOS filesystem releases impacting 100M+ users.",
        tags: ["Python", "Ansible", "Docker", "APFS", "LLM"],
        gradient: g.accentToCyan,
        accent: accentCycle[1],
        number: "04",
        detail: {
            title: "Software Development Engineer in Test",
            subtitle: "Apple",
            period: "January 2023 – July 2024",
            location: "Cupertino, CA",
            description:
                "Owned the test automation strategy for APFS filesystem releases on macOS, impacting 100M+ devices. Leveraged custom AI pipelines to modernize legacy test infrastructure and prototyped LLM-powered internal tooling.",
            highlights: [
                "Migrated and optimized 20+ legacy Python test scripts using custom AI pipelines with file-safety guardrails and edge-case discovery",
                "Managed high-volume production-impacting defects, maintaining stable APFS deployments for macOS filesystem releases",
                "Implemented streamlined deployment workflows with Ansible and Docker, accelerating release cycles",
                "Authored comprehensive technical documentation and prototyped LLM-powered search tool for internal runbooks",
                "Designed modular Python test suites with dynamic parameterization for rapid test creation",
            ],
            architecture: [
                { label: "Test Framework", icon: "layers", description: "Modular Python test suites with dynamic parameterization" },
                { label: "AI Migration", icon: "cpu", description: "Custom AI pipelines for legacy script modernization" },
                { label: "CI/CD", icon: "git", description: "Ansible + Docker automated deployment workflows" },
                { label: "LLM Tooling", icon: "zap", description: "Prototype search tool for internal runbooks" },
            ],
            techStack: ["Python", "Ansible", "Docker", "Pytest", "CI/CD"],
            metrics: [
                { label: "Scripts Migrated", value: "20+" },
                { label: "Users Impacted", value: "100M+" },
            ],
            diagramType: "cicd",
            gradient: g.accentToCyan,
            accent: accentCycle[1],
            link: { label: "Apple Developer", url: "https://developer.apple.com/" },
        },
    },
    {
        id: "walmart",
        title: "Software Engineer",
        company: "Walmart",
        period: "May 2022 \u2013 Aug 2022",
        location: "Sunnyvale, CA",
        summary:
            "Engineered serverless APIs and backend services increasing throughput by 300%, built responsive UIs with Angular + Keycloak auth.",
        tags: ["Java", "Spring Boot", "AWS Lambda", "Angular", "Kafka"],
        gradient: g.cyanToPrimary,
        accent: accentCycle[2],
        number: "05",
        detail: {
            title: "Software Engineer",
            subtitle: "Walmart",
            period: "May 2022 – August 2022",
            location: "Sunnyvale, CA",
            description:
                "Designed and optimized serverless microservices achieving a 300% throughput increase, built responsive UIs, and integrated enterprise monitoring across the Walmart e-commerce platform.",
            highlights: [
                "Designed and optimized serverless REST and gRPC APIs on AWS Lambda, RDS, and Redis — improving data-retrieval speed and reliability",
                "Engineered backend services increasing throughput by 300% using Java, Spring Boot, Hibernate with Kafka and Datadog/Grafana monitoring",
                "Created user flows in Figma and built responsive Angular frontend integrating REST APIs and Keycloak authentication",
            ],
            architecture: [
                { label: "API Gateway", icon: "server", description: "Serverless REST + gRPC on AWS Lambda" },
                { label: "Backend Services", icon: "layers", description: "Java / Spring Boot / Hibernate microservices" },
                { label: "Event Bus", icon: "zap", description: "Kafka event streaming with Datadog monitoring" },
                { label: "Data Layer", icon: "database", description: "AWS RDS + Redis caching layer" },
                { label: "Frontend", icon: "cpu", description: "Angular SPA with Keycloak auth" },
            ],
            techStack: ["Java", "Spring Boot", "Hibernate", "AWS", "Redis", "Apache Kafka", "Angular", "Datadog", "Grafana", "SQL"],
            metrics: [
                { label: "Throughput Gain", value: "+300%" },
                { label: "API Type", value: "Serverless" },
            ],
            diagramType: "microservices",
            gradient: g.cyanToPrimary,
            accent: accentCycle[2],
            link: { label: "Walmart Connect", url: "https://www.walmartconnect.com/solutions" },
        },
    },
    {
        id: "lbnl",
        title: "Software Engineer",
        company: "Lawrence Berkeley National Laboratory",
        period: "May 2021 – Aug 2021",
        location: "Berkeley, CA",
        summary:
            "Built containerized ML pipelines with scikit-learn, Docker, Airflow — saving 200+ hours annually through automated reporting.",
        tags: ["Python", "scikit-learn", "Docker", "Airflow", "MLflow"],
        gradient: g.primaryToMagenta,
        accent: accentCycle[3],
        number: "06",
        logo: "/logos/berkeley-lab.svg",
        detail: {
            title: "Software Engineer",
            subtitle: "Lawrence Berkeley National Laboratory",
            period: "May 2021 – August 2021",
            location: "Berkeley, CA",
            description:
                "Developed clustering models and end-to-end ML pipelines for scientific research, building automated visualization dashboards that saved 200+ hours of manual work annually.",
            highlights: [
                "Developed and tuned clustering models (K-Means, hierarchical, DBSCAN) with scikit-learn, NumPy and Pandas",
                "Built containerized ML pipeline with Python, Docker, Airflow and automated hyperparameter tuning (GridSearchCV, Optuna)",
                "Tracked experiments with MLflow for reproducible model versioning",
                "Built interactive visualization dashboards (Matplotlib, Plotly, Jupyter) with automated reporting pipelines",
            ],
            architecture: [
                { label: "Data Ingestion", icon: "database", description: "Pandas + NumPy data processing pipelines" },
                { label: "Model Training", icon: "cpu", description: "scikit-learn clustering with GridSearchCV / Optuna tuning" },
                { label: "Orchestration", icon: "layers", description: "Airflow DAGs for automated pipeline execution" },
                { label: "Experiment Tracking", icon: "git", description: "MLflow model registry and versioning" },
                { label: "Visualization", icon: "zap", description: "Matplotlib / Plotly dashboards with Jupyter" },
            ],
            techStack: ["Python", "scikit-learn", "Docker", "TensorFlow", "PyTorch", "SQL"],
            metrics: [
                { label: "Time Saved", value: "200h/yr" },
                { label: "Pipeline", value: "End-to-End" },
            ],
            diagramType: "ml-pipeline",
            gradient: g.primaryToMagenta,
            accent: accentCycle[3],
            link: { label: "Berkeley Lab EESA", url: "https://eesa.lbl.gov/" },
        },
    },
    {
        id: "honda",
        title: "Software Engineer Intern",
        company: "Honda Innovations",
        period: "Jan 2021 – May 2021",
        location: "Mountain View, CA",
        summary:
            "Engineered predictive route-optimization for medical-supply delivery using ML, automated full CI/CD pipeline with GitHub Actions + Terraform.",
        tags: ["scikit-learn", "Kafka", "GitHub Actions", "Docker", "Terraform"],
        gradient: g.magentaToAccent,
        accent: accentCycle[4],
        number: "07",
        detail: {
            title: "Software Engineer Intern",
            subtitle: "Honda Innovations",
            period: "January 2021 \u2013 May 2021",
            location: "Mountain View, CA",
            description:
                "Built a predictive route-optimization system for medical supply delivery using real-time telemetry and ML models, with a fully automated CI/CD pipeline deploying to AWS ECS.",
            highlights: [
                "Engineered predictive route-optimization model using scikit-learn, Pandas, NumPy, and real-time telemetry via Kafka",
                "Automated CI/CD pipeline with GitHub Actions, Docker, and Terraform deploying containerized ML model serving to AWS ECS",
                "Led capstone project applying time-series forecasting and linear-programming optimization using Python and PuLP",
            ],
            architecture: [
                { label: "Data Stream", icon: "zap", description: "Kafka real-time telemetry ingestion" },
                { label: "ML Models", icon: "cpu", description: "scikit-learn route optimization + time-series forecasting" },
                { label: "CI/CD", icon: "git", description: "GitHub Actions \u2192 Docker \u2192 Terraform \u2192 AWS ECS" },
                { label: "Serving", icon: "server", description: "Containerized ML model serving on AWS ECS" },
            ],
            techStack: ["Python", "scikit-learn", "Apache Kafka", "GitHub Actions", "Docker", "Terraform", "AWS"],
            metrics: [
                { label: "Optimization", value: "ML-driven" },
                { label: "Deploy", value: "Full CI/CD" },
            ],
            diagramType: "pipeline",
            gradient: g.magentaToAccent,
            accent: accentCycle[4],
            link: { label: "Honda Innovations", url: "https://www.honda.com" },
        },
    },
]
