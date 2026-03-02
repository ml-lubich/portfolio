"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { AnimatedSection } from "./animated-section"
import { AnimatedText } from "./animated-text"
import { Terminal, Clock, Zap, ChevronRight, Activity, Play } from "lucide-react"

/* ══════════════════════════════════════════════════════════════
   SESSION DATA — each is a "moment" in the day.
   Click any tab to jump straight to that session.
   Cycles forever in random order. Lightweight rAF loop.
   ══════════════════════════════════════════════════════════════ */

interface Line {
    t: "cmd" | "out" | "code" | "hdr" | "gap"
    s: string
    d?: number   // delay ms BEFORE line — kept SHORT
    c?: string   // tailwind color override
}

interface Session {
    time: string
    label: string
    icon: string
    lines: Line[]
}

const S: Session[] = [
    /* 0 ── morning boot ─────────────────────────────────────── */
    {
        time: "06:42 AM", label: "Morning Boot", icon: "☕",
        lines: [
            { t: "cmd", s: "cd ~/agents && source .venv/bin/activate" },
            { t: "out", s: "(venv) ✓ Python 3.12.4 — torch 2.3.1+cu121 — CUDA 12.1", d: 60 },
            { t: "cmd", s: "git pull origin main --rebase" },
            { t: "out", s: "Fast-forward | 14 files changed, 847 insertions(+), 203 deletions(-)", d: 80 },
            { t: "cmd", s: "pytest tests/ -x -q --tb=line" },
            { t: "out", s: "142 passed in 3.1s", d: 120, c: "text-emerald-400" },
            { t: "cmd", s: "docker compose up -d redis postgres qdrant" },
            { t: "out", s: "✔ Container redis         Started   0.3s", d: 50 },
            { t: "out", s: "✔ Container postgres       Started   0.4s" },
            { t: "out", s: "✔ Container qdrant         Started   0.6s" },
            { t: "out", s: "All services healthy ✓", c: "text-emerald-400" },
        ],
    },
    /* 1 ── code-review agent ────────────────────────────────── */
    {
        time: "07:15 AM", label: "Code-Review Agent", icon: "🤖",
        lines: [
            { t: "hdr", s: "# agents/code_review.py" },
            { t: "code", s: "class CodeReviewAgent(BaseAgent):" },
            { t: "code", s: '    """Autonomous PR reviewer — auto-merges at confidence > 0.95."""' },
            { t: "gap", s: "" },
            { t: "code", s: "    def __init__(self, model='gpt-4o'):" },
            { t: "code", s: "        self.llm = ChatModel(model, temperature=0.1)" },
            { t: "code", s: "        self.tools = [GitDiffTool(), ASTAnalyzer(), SecurityScanner()]" },
            { t: "gap", s: "" },
            { t: "code", s: "    async def review(self, pr: PullRequest) -> ReviewResult:" },
            { t: "code", s: "        diff = await self.tools[0].get_diff(pr.number)" },
            { t: "code", s: "        vuln = await self.tools[2].scan(diff)" },
            { t: "code", s: "        analysis = await self.llm.analyze(diff, vulnerabilities=vuln)" },
            { t: "code", s: "        return ReviewResult(score=analysis.confidence," },
            { t: "code", s: "                            auto_merge=analysis.confidence > 0.95)" },
            { t: "gap", s: "" },
            { t: "cmd", s: "python -m agents.code_review --pr 847 --dry-run" },
            { t: "out", s: "⚡ Reviewing PR #847 (23 files, +412 -89)...", d: 60 },
            { t: "out", s: "✓ Confidence: 0.97 → auto-merge approved", d: 100, c: "text-emerald-400" },
        ],
    },
    /* 2 ── RAG pipeline ─────────────────────────────────────── */
    {
        time: "09:30 AM", label: "RAG Pipeline Deploy", icon: "🚀",
        lines: [
            { t: "cmd", s: "kubectl apply -f k8s/rag-pipeline.yaml" },
            { t: "out", s: "deployment.apps/rag-embedder created", d: 40 },
            { t: "out", s: "deployment.apps/rag-retriever created" },
            { t: "out", s: "service/rag-gateway configured" },
            { t: "cmd", s: "curl -s localhost:8080/health | jq .status" },
            { t: "out", s: '"healthy"', d: 80, c: "text-emerald-400" },
            { t: "cmd", s: "python benchmark.py --queries 10000 --concurrent 50" },
            { t: "out", s: "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%  10k queries", d: 200 },
            { t: "out", s: "p50=12ms  p99=38ms  accuracy=96.2%", c: "text-emerald-400" },
            { t: "cmd", s: "python ingest.py --source s3://docs-v3 --chunk 512 --overlap 64" },
            { t: "out", s: "Indexed 2,847,391 chunks → Qdrant (cosine, dim=3072)", d: 150 },
            { t: "out", s: "✓ Pipeline live", c: "text-emerald-400" },
        ],
    },
    /* 3 ── fine-tuning ──────────────────────────────────────── */
    {
        time: "11:00 AM", label: "Model Fine-Tuning", icon: "🧠",
        lines: [
            { t: "cmd", s: "accelerate launch train.py \\" },
            { t: "cmd", s: "  --model meta-llama/Llama-4-Maverick \\" },
            { t: "cmd", s: "  --lora-rank 64 --epochs 3 --lr 2e-4" },
            { t: "out", s: "[GPU 0-7] A100 80GB × 8 — bf16 mixed precision", d: 80 },
            { t: "out", s: "Epoch 1/3 ━━━━━━━━━━━━━━━━━━━━ loss=1.247", d: 180 },
            { t: "out", s: "Epoch 2/3 ━━━━━━━━━━━━━━━━━━━━ loss=0.834", d: 160 },
            { t: "out", s: "Epoch 3/3 ━━━━━━━━━━━━━━━━━━━━ loss=0.612", d: 160 },
            { t: "out", s: "✓ Saved → checkpoints/llama-ft-v4", c: "text-emerald-400" },
            { t: "out", s: "MMLU: 78.4% (+6.2)  HumanEval: 71.3% (+8.1)", c: "text-sky-400" },
            { t: "cmd", s: "python eval.py --model ./checkpoints/llama-ft-v4 --bench mt-bench" },
            { t: "out", s: "MT-Bench score: 8.74 / 10  (baseline 7.91)", d: 120, c: "text-emerald-400" },
        ],
    },
    /* 4 ── agent swarm ──────────────────────────────────────── */
    {
        time: "01:30 PM", label: "Agent Swarm Orchestrator", icon: "⚡",
        lines: [
            { t: "hdr", s: "# orchestrator/swarm.py" },
            { t: "code", s: "class AgentSwarm:" },
            { t: "code", s: '    """Parallel multi-agent executor with consensus voting."""' },
            { t: "gap", s: "" },
            { t: "code", s: "    async def execute(self, task: Task) -> Result:" },
            { t: "code", s: "        plan = await self.planner.decompose(task)" },
            { t: "code", s: "        results = await asyncio.gather(" },
            { t: "code", s: "            *[a.run(st) for a, st in zip(self.agents, plan.subtasks)]" },
            { t: "code", s: "        )" },
            { t: "code", s: "        verdict = await self.judge.evaluate(results)" },
            { t: "code", s: "        if verdict.confidence < 0.8:" },
            { t: "code", s: "            return await self.execute(task.refine(verdict))" },
            { t: "code", s: "        return verdict.best" },
            { t: "gap", s: "" },
            { t: "cmd", s: "python -m swarm --agents 12 --task 'refactor auth module'" },
            { t: "out", s: "🔄 Spawning: planner ×1  coder ×4  reviewer ×3  tester ×2  debugger ×1  deployer ×1", d: 80 },
            { t: "out", s: "⚡ Agent[coder-0] → rewriting auth/jwt.py (147 lines)", d: 40 },
            { t: "out", s: "⚡ Agent[coder-1] → rewriting auth/oauth.py (203 lines)" },
            { t: "out", s: "⚡ Agent[coder-2] → rewriting auth/rbac.py (89 lines)" },
            { t: "out", s: "⚡ Agent[coder-3] → rewriting auth/session.py (112 lines)" },
            { t: "out", s: "✓ reviewer-0 approved (confidence 0.96)", d: 60, c: "text-emerald-400" },
            { t: "out", s: "✓ 847 lines refactored, 0 regressions, merged to main", c: "text-emerald-400" },
        ],
    },
    /* 5 ── tool-use agent ───────────────────────────────────── */
    {
        time: "03:00 PM", label: "Tool-Use Agent Build", icon: "🛠️",
        lines: [
            { t: "hdr", s: "# agents/tool_agent.py" },
            { t: "code", s: "class ToolUseAgent(ReActAgent):" },
            { t: "code", s: "    tools = [" },
            { t: "code", s: "        WebSearch(), SQLQuery(), PythonREPL()," },
            { t: "code", s: "        FileSystem(), APIClient(), Calculator()," },
            { t: "code", s: "    ]" },
            { t: "gap", s: "" },
            { t: "code", s: "    async def step(self, obs: str) -> Action:" },
            { t: "code", s: "        thought = await self.llm.think(self.history + [obs])" },
            { t: "code", s: "        tool, args = self.parse_action(thought)" },
            { t: "code", s: "        result = await self.tools[tool].execute(**args)" },
            { t: "code", s: "        self.history.append((thought, result))" },
            { t: "code", s: "        if self.is_final(result):" },
            { t: "code", s: "            return Action(type='finish', payload=result)" },
            { t: "code", s: "        return Action(type='continue', payload=result)" },
            { t: "gap", s: "" },
            { t: "cmd", s: "python -m agents.tool_agent --task 'find CVEs in requirements.txt'" },
            { t: "out", s: "→ Thought: I need to read the requirements file first", d: 50 },
            { t: "out", s: "→ Action: FileSystem.read('requirements.txt')" },
            { t: "out", s: "→ Thought: Now search for known CVEs in these packages", d: 40 },
            { t: "out", s: "→ Action: WebSearch('CVE flask 2.3.1 OR requests 2.31.0')" },
            { t: "out", s: "→ Result: Found 2 critical, 1 moderate vulnerability", d: 60 },
            { t: "out", s: "✓ Report generated → security_audit_2026-02-26.md", c: "text-emerald-400" },
        ],
    },
    /* 6 ── streaming inference ──────────────────────────────── */
    {
        time: "04:45 PM", label: "Streaming Inference API", icon: "📡",
        lines: [
            { t: "hdr", s: "// api/inference/stream.ts" },
            { t: "code", s: "export async function* streamInference(" },
            { t: "code", s: "  prompt: string, model: ModelConfig" },
            { t: "code", s: "): AsyncGenerator<Token> {" },
            { t: "code", s: "  const sess = await gpu.allocate(model.vram);" },
            { t: "code", s: "  for await (const tok of model.generate(prompt)) {" },
            { t: "code", s: "    metrics.track('tps', sess.tokensPerSecond);" },
            { t: "code", s: "    yield { text: tok.decode(), latency: tok.ms };" },
            { t: "code", s: "  }" },
            { t: "code", s: "  gpu.release(sess);" },
            { t: "code", s: "}" },
            { t: "gap", s: "" },
            { t: "cmd", s: "bun run build && bun run deploy:edge" },
            { t: "out", s: "✓ Build complete in 2.1s (847 modules)", d: 80 },
            { t: "out", s: "✓ Deployed to 12 edge locations", d: 60, c: "text-emerald-400" },
            { t: "cmd", s: "hey -n 5000 -c 200 https://api.misha.dev/stream" },
            { t: "out", s: "Requests/sec: 1,247.3  p99: 42ms  0 errors", d: 150, c: "text-sky-400" },
        ],
    },
    /* 7 ── data pipeline ────────────────────────────────────── */
    {
        time: "05:30 PM", label: "Data Pipeline ETL", icon: "🔄",
        lines: [
            { t: "cmd", s: "python -m pipeline.run --source kafka --sink bigquery" },
            { t: "out", s: "Connecting to kafka://prod-cluster:9092...", d: 60 },
            { t: "out", s: "✓ Consuming from 12 partitions", d: 40, c: "text-emerald-400" },
            { t: "out", s: "Transform: dedupe → normalize → embed → validate", d: 30 },
            { t: "out", s: "Throughput: 84,291 events/sec", c: "text-sky-400" },
            { t: "cmd", s: "python -m pipeline.validate --sample 10000" },
            { t: "out", s: "Schema compliance: 100%  Null rate: 0.02%  Duplicates: 0", d: 80 },
            { t: "out", s: "✓ Pipeline healthy", c: "text-emerald-400" },
            { t: "hdr", s: "# pipeline/transforms.py" },
            { t: "code", s: "class EmbeddingTransform(BaseTransform):" },
            { t: "code", s: "    async def process(self, batch: list[Record]) -> list[Record]:" },
            { t: "code", s: "        texts = [r.content for r in batch]" },
            { t: "code", s: "        embeddings = await self.model.encode(texts, batch_size=256)" },
            { t: "code", s: "        for r, emb in zip(batch, embeddings):" },
            { t: "code", s: "            r.vector = emb.tolist()" },
            { t: "code", s: "        return batch" },
        ],
    },
    /* 8 ── sub-agent spawning ───────────────────────────────── */
    {
        time: "06:15 PM", label: "Sub-Agent Spawner", icon: "🌐",
        lines: [
            { t: "hdr", s: "# agents/spawner.py" },
            { t: "code", s: "class AgentSpawner:" },
            { t: "code", s: "    async def spawn(self, spec: AgentSpec) -> RunningAgent:" },
            { t: "code", s: "        container = await self.k8s.create_pod(" },
            { t: "code", s: "            image=spec.image, gpu=spec.requires_gpu," },
            { t: "code", s: "            env={'MODEL': spec.model, 'TASK': spec.task_id}" },
            { t: "code", s: "        )" },
            { t: "code", s: "        return RunningAgent(pid=container.id, ws=self.connect(container))" },
            { t: "gap", s: "" },
            { t: "cmd", s: "python -m spawner --fleet research-batch-042" },
            { t: "out", s: "Spawning sub-agent fleet (8 agents):", d: 60 },
            { t: "out", s: "  → agent-summarizer   (Llama-4-Scout)    ✓ ready", d: 30 },
            { t: "out", s: "  → agent-classifier   (BERT-large)      ✓ ready" },
            { t: "out", s: "  → agent-embedder     (E5-large-v2)     ✓ ready" },
            { t: "out", s: "  → agent-extractor    (GPT-4o-mini)     ✓ ready" },
            { t: "out", s: "  → agent-validator    (custom-ft-v3)    ✓ ready" },
            { t: "out", s: "  → agent-ranker       (ColBERT-v2)      ✓ ready" },
            { t: "out", s: "  → agent-writer       (Claude-Sonnet-4)  ✓ ready" },
            { t: "out", s: "  → agent-orchestrator (GPT-4o)          ✓ ready" },
            { t: "out", s: "Fleet online — processing 12,847 tasks in queue", d: 40, c: "text-emerald-400" },
        ],
    },
    /* 9 ── shipping ─────────────────────────────────────────── */
    {
        time: "07:30 PM", label: "Ship & Monitor", icon: "🎯",
        lines: [
            { t: "cmd", s: "git add -A && git commit -m 'feat: agent swarm v2 + streaming api'" },
            { t: "out", s: "[main e7b4d08] feat: agent swarm v2 + streaming api", d: 50 },
            { t: "out", s: " 23 files changed, 1,847 insertions(+), 412 deletions(-)" },
            { t: "cmd", s: "git push origin main" },
            { t: "out", s: "remote: ✓ CI — 247/247 tests passing", d: 100 },
            { t: "out", s: "remote: ✓ Docker built (1.2GB → 340MB)", d: 60 },
            { t: "out", s: "remote: ✓ Deployed us-east-1, eu-west-1, ap-southeast-1", d: 60 },
            { t: "out", s: "remote: ✓ Health checks green on all 3 regions", c: "text-emerald-400" },
            { t: "cmd", s: "grafana-cli dashboard open prod-overview" },
            { t: "out", s: "Requests: 12.4k/min  Errors: 0.01%  p99: 34ms", d: 80, c: "text-sky-400" },
            { t: "out", s: "GPU util: 78%  Memory: 62%  Cost: $2.14/hr", c: "text-sky-400" },
            { t: "cmd", s: "echo '✨ shipped.'" },
            { t: "out", s: "✨ shipped.", d: 40, c: "text-primary" },
        ],
    },
]

/* ════════════════════ SYNTAX HIGHLIGHTER ═════════════════════ */

const KW = /\b(class|def|async|await|for|if|return|import|from|self|None|True|False|export|function|const|let|yield|type|interface)\b/g
const STR = /(["'`])(?:(?=(\\?))\2.)*?\1/g
const CMT = /#.*/g
const NUM = /\b\d[\d_.]*\b/g
const TYP = /\b(str|int|float|bool|list|dict|Task|Result|PullRequest|ReviewResult|BaseAgent|ModelConfig|Token|AsyncGenerator|Action|AgentSpec|RunningAgent|Record|BaseTransform|ReActAgent)\b/g

function hl(text: string): React.JSX.Element {
    type Seg = { s: number; e: number; c: string }
    const segs: Seg[] = []
    const add = (rx: RegExp, cls: string) => {
        const r = new RegExp(rx.source, "g")
        let m: RegExpExecArray | null
        while ((m = r.exec(text))) segs.push({ s: m.index, e: m.index + m[0].length, c: cls })
    }
    add(CMT, "text-muted-foreground/50 italic")
    add(STR, "text-emerald-400")
    add(KW, "text-purple-400")
    add(TYP, "text-sky-400")
    add(NUM, "text-orange-400")
    segs.sort((a, b) => a.s - b.s)
    const clean: Seg[] = []
    let end = 0
    for (const seg of segs) { if (seg.s >= end) { clean.push(seg); end = seg.e } }
    const out: React.JSX.Element[] = []
    let cur = 0
    for (const seg of clean) {
        if (cur < seg.s) out.push(<span key={cur}>{text.slice(cur, seg.s)}</span>)
        out.push(<span key={`h${seg.s}`} className={seg.c}>{text.slice(seg.s, seg.e)}</span>)
        cur = seg.e
    }
    if (cur < text.length) out.push(<span key={cur}>{text.slice(cur)}</span>)
    return <>{out}</>
}

/* ════════════════════ COMPONENT ══════════════════════════════ */

interface DL { si: number; li: number; text: string; done: boolean }

export function LiveTerminal() {
    const [lines, setLines] = useState<DL[]>([])
    const [activeSession, setActiveSession] = useState(0)
    const [totalChars, setTotalChars] = useState(0)
    const [linesCount, setLinesCount] = useState(0)
    const [visible, setVisible] = useState(false)
    const [wpm, setWpm] = useState(0)

    const scrollRef = useRef<HTMLDivElement>(null)
    const wrapRef = useRef<HTMLDivElement>(null)
    const rafRef = useRef(0)
    const jumpRef = useRef<number | null>(null)
    const engineRef = useRef<{ running: boolean }>({ running: false })

    // Shuffle
    const shuffle = useCallback(() => {
        const a = Array.from({ length: S.length }, (_, i) => i)
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]
        }
        return a
    }, [])

    // Visibility
    useEffect(() => {
        const el = wrapRef.current
        if (!el) return
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.15 })
        obs.observe(el)
        return () => obs.disconnect()
    }, [])

    // Jump handler
    const jumpTo = useCallback((idx: number) => {
        jumpRef.current = idx
    }, [])

    // ─── ENGINE — single rAF loop, very lightweight ──────────
    useEffect(() => {
        if (!visible) return

        let order = shuffle()
        let orderPos = 0
        let si = order[0] ?? 0
        let li = 0
        let ch = 0
        let isTyping = false
        let waitUntil = performance.now() + 200
        let localLines: DL[] = []
        let tc = 0
        let lc = 0
        let wpmStart = performance.now()

        const flush = () => {
            setLines([...localLines])
            setTotalChars(tc)
            setLinesCount(lc)
            setActiveSession(si)
        }

        const startSession = (idx: number) => {
            si = idx
            li = 0
            ch = 0
            isTyping = false
            localLines = []
            lc = 0
            wpmStart = performance.now()
            flush()
        }

        const tick = (now: number) => {
            // Check for jump
            if (jumpRef.current !== null) {
                startSession(jumpRef.current)
                jumpRef.current = null
                waitUntil = now + 150
                rafRef.current = requestAnimationFrame(tick)
                return
            }

            if (now < waitUntil) {
                rafRef.current = requestAnimationFrame(tick)
                return
            }

            const session = S[si]
            if (!session) { rafRef.current = requestAnimationFrame(tick); return }

            // Session done → next
            if (li >= session.lines.length) {
                waitUntil = now + 500
                orderPos++
                if (orderPos >= order.length) { order = shuffle(); orderPos = 0 }
                startSession(order[orderPos] ?? 0)
                rafRef.current = requestAnimationFrame(tick)
                return
            }

            const line = session.lines[li]

            // Start new line
            if (!isTyping) {
                waitUntil = now + (line.d ?? 20)
                isTyping = true
                ch = 0
                localLines.push({ si, li, text: "", done: false })
                flush()
                rafRef.current = requestAnimationFrame(tick)
                return
            }

            const full = line.s
            const typed = line.t === "cmd" || line.t === "code"

            // Type chars in bursts for SPEED
            if (typed && ch < full.length) {
                const burst = Math.min(1 + Math.floor(Math.random() * 2), full.length - ch) // 1-2 chars
                ch += burst
                tc += burst
                localLines[localLines.length - 1] = { si, li, text: full.slice(0, ch), done: false }
                flush()
                waitUntil = now + 25 + Math.random() * 35 // 25-60ms per burst → natural fast typing
                rafRef.current = requestAnimationFrame(tick)
                return
            }

            // Finish line
            if (!typed) tc += full.length
            localLines[localLines.length - 1] = { si, li, text: full, done: true }
            li++
            lc++
            isTyping = false
            flush()
            waitUntil = now + 80 + Math.random() * 120 // natural pause between lines
            rafRef.current = requestAnimationFrame(tick)
        }

        rafRef.current = requestAnimationFrame(tick)

        // WPM updater (low-freq)
        const iv = setInterval(() => {
            const mins = (performance.now() - wpmStart) / 60000
            if (mins > 0.005) setWpm(Math.min(Math.round(tc / 5 / mins), 260))
        }, 500)

        return () => { cancelAnimationFrame(rafRef.current); clearInterval(iv) }
    }, [visible, shuffle])

    // Auto-scroll
    useEffect(() => {
        const el = scrollRef.current
        if (el) el.scrollTop = el.scrollHeight
    }, [lines])

    const cur = S[activeSession]

    // ─── RENDER LINE ─────────────────────────────────────────
    const renderLine = useCallback((dl: DL, idx: number, last: boolean) => {
        const ld = S[dl.si]?.lines[dl.li]
        if (!ld) return null
        const blink = last && !dl.done

        switch (ld.t) {
            case "cmd":
                return (
                    <div className="flex items-start gap-2 min-h-[1.35em]">
                        <span className="text-emerald-400 shrink-0 select-none">❯</span>
                        <span className="text-foreground/90">
                            {dl.text}
                            {blink && <span className="animate-[pulse_0.5s_ease-in-out_infinite] text-primary">▊</span>}
                        </span>
                    </div>
                )
            case "out":
                return <div className={`pl-5 ${ld.c ?? "text-muted-foreground"} min-h-[1.35em]`}>{dl.text}</div>
            case "code":
                return (
                    <div className="flex items-start min-h-[1.35em]">
                        <span className="text-muted-foreground/25 select-none w-5 text-right mr-2 text-[11px] leading-relaxed shrink-0">{dl.li}</span>
                        <span className="text-foreground/80">
                            {dl.done ? hl(dl.text) : <>{dl.text}{blink && <span className="animate-[pulse_0.5s_ease-in-out_infinite] text-primary">▊</span>}</>}
                        </span>
                    </div>
                )
            case "hdr":
                return <div className="text-muted-foreground/35 italic text-xs mt-2 mb-1">{dl.text}</div>
            case "gap":
                return <div className="h-1" />
            default:
                return <div className="text-muted-foreground">{dl.text}</div>
        }
    }, [])

    return (
        <AnimatedSection id="terminal" className="pt-8 pb-16 sm:pt-12 sm:pb-20 px-4 sm:px-6 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[100px]" />
            </div>

            <div className="max-w-5xl mx-auto relative" ref={wrapRef}>
                {/* Header */}
                <AnimatedSection className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-4">
                        <Terminal className="w-4 h-4 text-primary" />
                        <span className="text-sm text-primary font-medium tracking-wide">Live Terminal</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent mb-2">
                        <AnimatedText text="A Day in My Life" variant="blur-slide" stagger={70} duration={800} />
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
                        <AnimatedText text="Building AI agents, deploying models, shipping production systems — live." variant="fade-up" delay={300} stagger={25} duration={600} />
                    </p>
                </AnimatedSection>

                {/* ── Clickable session tabs ──────────────────────────── */}
                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    {S.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => jumpTo(i)}
                            className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                transition-all duration-150 whitespace-nowrap cursor-pointer
                hover:bg-primary/10 hover:text-primary active:scale-95
                ${i === activeSession
                                    ? "bg-primary/15 text-primary border border-primary/30 shadow-sm shadow-primary/10"
                                    : "text-muted-foreground/50 border border-transparent hover:border-primary/20"
                                }
              `}
                        >
                            <span className="text-sm">{s.icon}</span>
                            <span className="hidden sm:inline">{s.time}</span>
                        </button>
                    ))}
                </div>

                {/* ── Terminal window ──────────────────────────────────── */}
                <div className="rounded-xl border border-border bg-[hsl(220,20%,5%)] shadow-2xl shadow-black/30 overflow-hidden">
                    {/* Title bar */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-[hsl(220,20%,7%)] border-b border-border">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                            </div>
                            <span className="ml-3 text-xs text-muted-foreground/50 font-mono truncate max-w-[280px]">
                                misha@dev ~ {cur?.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] shrink-0">
                            <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-yellow-400/60" />
                                <span className="font-mono text-yellow-400/60">{wpm} WPM</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Activity className="w-3 h-3 text-primary/40" />
                                <span className="font-mono text-primary/40">{totalChars.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-emerald-400/60 font-mono">LIVE</span>
                            </div>
                        </div>
                    </div>

                    {/* Info bar */}
                    <div className="px-4 py-1 bg-primary/[0.03] border-b border-border/30 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[11px]">
                            <Clock className="w-3 h-3 text-primary/30" />
                            <span className="font-mono text-foreground/50">{cur?.icon} {cur?.time} — {cur?.label}</span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground/25">{linesCount} lines</span>
                    </div>

                    {/* Body */}
                    <div
                        ref={scrollRef}
                        className="p-4 font-mono text-[13px] leading-relaxed h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent"
                    >
                        {lines.length === 0 && visible && (
                            <div className="text-muted-foreground/20 animate-pulse flex items-center gap-2">
                                <Play className="w-3 h-3" /> Loading session...
                            </div>
                        )}
                        {lines.map((dl, idx) => (
                            <div key={`${dl.si}-${dl.li}-${idx}`}>
                                {renderLine(dl, idx, idx === lines.length - 1)}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-1 bg-[hsl(220,20%,6%)] border-t border-border/30 flex items-center justify-between text-[10px] font-mono text-muted-foreground/25">
                        <span>SESSION {activeSession + 1}/{S.length}</span>
                        <span>zsh — 80×24</span>
                    </div>
                </div>
            </div>
        </AnimatedSection>
    )
}
