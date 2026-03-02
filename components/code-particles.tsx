"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

/* ── Code snippets per skill (shown as flying particles) ── */
const codeSnippetMap: Record<string, string[]> = {
    // Languages
    Java: ["public class", "@Override", "interface", "extends", "implements", "void main()", "new", "try {", "catch()", "final"],
    Python: ["def ", "import ", "class ", "lambda:", "yield", "self.", "__init__", "async def", "with open", "@decorator"],
    JavaScript: ["const ", "=> {", "async ", "await ", "export", ".map()", ".then()", "let ", "require()", "() => {}"],
    TypeScript: ["interface", "type ", "<T>", "readonly", ": string", "enum ", "as const", "Record<>", "Partial<>", "extends"],
    Go: ["func ", "go ", "chan ", "defer ", ":= ", "package", "import", "struct {", "interface{}", "goroutine"],
    Rust: ["fn ", "let mut", "impl ", "pub ", "match ", "&self", "unwrap()", "Option<>", "Result<>", "trait "],
    "C++": ["#include", "std::", "template<>", "virtual", "nullptr", "class ", "public:", "auto ", "const&", "new "],
    SQL: ["SELECT", "FROM", "WHERE", "JOIN", "INSERT", "UPDATE", "GROUP BY", "ORDER BY", "CREATE", "INDEX"],
    YAML: ["key: val", "- item", "  name:", "spec:", "env:", "ports:", "image:", "replicas:", "---", "labels:"],

    // AI/ML
    "LLM APIs": ["chat.completions", "model=gpt", "messages=[]", "temperature", "max_tokens", "stream=True", "embedding", "prompt", "response", "api_key"],
    "Agentic Workflows": ["agent.run()", "tool_call", "plan()", "execute()", "observe()", "reason()", "action:", "memory", "chain", "loop"],
    "RAG Architectures": ["embed()", "retrieve()", "chunk()", "vectorDB", "similarity", "context", "rerank()", "index", "query", "augment"],
    "Multi-Agent Orchestration": ["swarm()", "delegate()", "agent_a", "agent_b", "handoff", "router", "parallel", "merge()", "consensus", "task"],
    "MCP Tool Servers": ["@tool", "server.run()", "handler", "schema", "invoke()", "resources", "prompts", "stdio", "transport", "context"],
    "Vector Databases": ["upsert()", "query()", "embedding", "namespace", "top_k=5", "metadata", "index()", "cosine", "dimension", "collection"],
    "Fine-tuning": ["train()", "epochs=3", "lr=2e-5", "lora", "adapter", "dataset", "eval()", "loss", "batch", "checkpoint"],
    "Prompt Engineering": ["system:", "user:", "assistant:", "few-shot", "chain-of-thought", "template", "{context}", "role:", "format:", "examples"],
    "Guardrails & Safety": ["validate()", "filter()", "moderate()", "policy", "boundary", "safe", "reject()", "classify", "threshold", "rules"],
    "LLM Observability": ["trace()", "span()", "metrics", "latency", "tokens", "cost", "evaluate()", "log", "dashboard", "monitor"],
    PyTorch: ["torch.nn", "forward()", "optim.", "tensor()", "loss.backward()", "model.train()", "DataLoader", "cuda()", "grad", "epoch"],
    TensorFlow: ["tf.keras", "model.fit()", "layers.", "compile()", "predict()", "tf.data", "callbacks", "Sequential", "Dense()", "Adam()"],
    "scikit-learn": ["fit()", "predict()", "transform()", "Pipeline", "GridSearch", "accuracy", "train_test", "cross_val", "clf.", "scaler"],

    // Frameworks
    "Spring Boot": ["@RestController", "@Autowired", "@Service", "@Bean", "@GetMapping", "application.yml", "@Entity", "@Repository", "ResponseEntity", "inject"],
    "Spring Cloud": ["@EnableDiscovery", "Eureka", "Gateway", "Config", "@FeignClient", "LoadBalancer", "Circuit", "Resilience", "Registry", "Route"],
    "Spring Security": ["@Secured", "UserDetails", "JWT", "OAuth2", "filterChain", "authorize", "CSRF", "CORS", "hasRole()", "Principal"],
    Hibernate: ["@Entity", "@Table", "@Column", "Session", "Query", "Criteria", "fetch", "cascade", "persist()", "flush()"],
    React: ["useState()", "useEffect()", "<div />", "props", "return ()", "onClick", "className", "children", "useRef()", "memo()"],
    Angular: ["@Component", "@Injectable", "ngOnInit", "Observable", "subscribe()", "HttpClient", "*ngFor", "[(ngModel)]", "pipe()", "module"],
    "Next.js": ["getServerSide", "useRouter()", "app/page", "layout.tsx", "loading.tsx", "middleware", "revalidate", "metadata", "Server Actions", "route.ts"],
    FastAPI: ["@app.get", "@app.post", "async def", "Depends()", "BaseModel", "Query()", "Path()", "HTTPException", "uvicorn", "Pydantic"],
    "Tailwind CSS": ["flex", "grid", "p-4", "text-lg", "bg-blue", "rounded-xl", "hover:", "dark:", "sm:", "gap-2"],
    "Material UI": ["<Box>", "<Button>", "sx={{", "variant=", "theme", "Typography", "styled()", "Grid", "Stack", "Drawer"],

    // Cloud & DevOps
    AWS: ["s3://", "lambda", "ec2", "iam", "vpc", "sns", "sqs", "dynamodb", "cloudfront", "ecs"],
    GCP: ["gcloud", "BigQuery", "GKE", "pub/sub", "Cloud Run", "Firestore", "Compute", "Storage", "IAM", "Vertex"],
    Azure: ["az cli", "blob", "AKS", "CosmosDB", "Functions", "App Service", "DevOps", "Key Vault", "Logic App", "Resource"],
    Kubernetes: ["kubectl", "pod", "deploy", "service", "ingress", "namespace", "helm", "configMap", "secret", "replica"],
    Docker: ["FROM", "RUN", "COPY", "EXPOSE", "CMD", "docker-compose", "build", "run", "volume", "network"],
    Terraform: ["resource", "provider", "module", "variable", "output", "state", "plan", "apply", "backend", "locals"],
    "GitHub Actions": ["on: push", "jobs:", "steps:", "runs-on:", "uses:", "with:", "env:", "secrets.", "workflow", "action"],
    Jenkins: ["pipeline {", "stage()", "agent", "steps {", "sh ", "post {", "when {", "params", "Jenkinsfile", "build"],
    Vercel: ["deploy", "vercel.json", "edge", "serverless", "preview", "production", "domain", "env", "build", "framework"],
    "Azure DevOps": ["pipeline:", "trigger:", "pool:", "task:", "stage:", "job:", "artifact", "release", "board", "backlog"],

    // Databases & Messaging
    PostgreSQL: ["CREATE TABLE", "SELECT *", "INSERT INTO", "pg_dump", "psql", "index", "jsonb", "constraint", "serial", "RETURNING"],
    MySQL: ["CREATE TABLE", "SELECT *", "INSERT INTO", "mysqldump", "ENGINE=", "AUTO_INCREMENT", "VARCHAR", "JOIN", "INDEX", "ALTER"],
    MongoDB: ["db.find()", "insertOne()", "aggregate()", "$match", "$group", "collection", "ObjectId", "updateOne()", "index", "pipeline"],
    Redis: ["SET key", "GET key", "HSET", "EXPIRE", "LPUSH", "pub/sub", "TTL", "INCR", "pipeline", "sentinel"],
    Oracle: ["CREATE TABLE", "PL/SQL", "SEQUENCE", "TRIGGER", "CURSOR", "DBMS_", "TABLESPACE", "GRANT", "MERGE", "PARTITION"],
    DynamoDB: ["putItem()", "getItem()", "query()", "scan()", "GSI", "LSI", "partition", "sort key", "stream", "TTL"],
    Pinecone: ["upsert()", "query()", "index()", "namespace", "metadata", "top_k", "dimension", "cosine", "vector", "delete()"],
    "Apache Kafka": ["producer", "consumer", "topic", "partition", "offset", "broker", "acks=all", "group_id", "avro", "stream"],
    RabbitMQ: ["queue", "exchange", "routing", "publish()", "consume()", "ack()", "fanout", "topic", "binding", "channel"],

    // Methodologies
    "Agile/Scrum": ["sprint", "backlog", "standup", "retro", "velocity", "story pts", "kanban", "epic", "increment", "review"],
    TDD: ["test()", "expect()", "assert", "red-green", "refactor", "mock()", "describe()", "it()", "beforeEach", "coverage"],
    "Domain-Driven Design": ["Entity", "ValueObject", "Aggregate", "Repository", "Service", "Bounded Ctx", "Event", "Factory", "Module", "Domain"],
    MLOps: ["pipeline", "deploy()", "monitor()", "retrain", "registry", "artifact", "feature", "experiment", "A/B test", "drift"],
    "CI/CD": ["build", "test", "deploy", "pipeline", "stage", "artifact", "rollback", "trigger", "release", "merge"],
    JUnit: ["@Test", "assertEquals", "assertThat", "@Before", "@Mock", "verify()", "@RunWith", "assertTrue", "expected", "@After"],
    Jest: ["test()", "expect()", "toBe()", "mock()", "describe()", "it()", "beforeAll", "toEqual()", "jest.fn()", "snapshot"],
    Selenium: ["driver.", "findElement", "click()", "sendKeys()", "WebDriver", "By.id()", "wait()", "getText()", "navigate()", "assert"],
    SonarQube: ["quality gate", "coverage", "bugs", "debt", "smell", "duplicate", "hotspot", "rule", "profile", "scan"],
}

/** Get code snippets for a skill – falls back to generic tokens */
function getSnippets(skill: string): string[] {
    return codeSnippetMap[skill] ?? ["{ }", "=>", "()", "//", "/**", "*/", "...", "++", "==", "!="]
}

/* ── Types ── */
interface Particle {
    id: number
    text: string
    x: number
    y: number
    rotation: number
    duration: number
    delay: number
    scale: number
}

interface CodeParticlesProps {
    skill: string
    isHovered: boolean
}

let particleIdCounter = 0

export function CodeParticles({ skill, isHovered }: CodeParticlesProps) {
    const [particles, setParticles] = useState<Particle[]>([])
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const spawnBurst = useCallback(() => {
        const snippets = getSnippets(skill)
        const count = 6 + Math.floor(Math.random() * 4) // 6-9 particles per burst
        const burst: Particle[] = Array.from({ length: count }, () => {
            const angle = Math.random() * Math.PI * 2
            const distance = 40 + Math.random() * 60 // 40-100px from center
            return {
                id: ++particleIdCounter,
                text: snippets[Math.floor(Math.random() * snippets.length)],
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                rotation: (Math.random() - 0.5) * 60, // -30 to +30 deg
                duration: 1.2 + Math.random() * 0.8, // 1.2-2s
                delay: Math.random() * 0.3,
                scale: 0.7 + Math.random() * 0.5, // 0.7-1.2
            }
        })
        setParticles((prev) => [...prev.slice(-20), ...burst]) // keep max ~30 particles
    }, [skill])

    useEffect(() => {
        if (isHovered) {
            // Immediate first burst
            spawnBurst()
            // Continuous bursts while hovering
            intervalRef.current = setInterval(spawnBurst, 1800)
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current)
            // Let existing particles finish animating, then clear
            const t = setTimeout(() => setParticles([]), 2200)
            return () => clearTimeout(t)
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [isHovered, spawnBurst])

    return (
        <AnimatePresence>
            {particles.map((p) => (
                <motion.span
                    key={p.id}
                    initial={{
                        x: 0,
                        y: 0,
                        opacity: 0.9,
                        scale: 0,
                        rotate: 0,
                    }}
                    animate={{
                        x: p.x,
                        y: p.y,
                        opacity: 0,
                        scale: p.scale,
                        rotate: p.rotation,
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        ease: "easeOut",
                    }}
                    className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] font-medium text-primary/80 select-none"
                    style={{ textShadow: "0 0 6px hsla(217,91%,60%,0.4)" }}
                >
                    {p.text}
                </motion.span>
            ))}
        </AnimatePresence>
    )
}
