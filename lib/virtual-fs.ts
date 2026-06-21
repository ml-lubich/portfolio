export type NodeKind = "file" | "dir"
export interface FsNode { kind: NodeKind; name: string; content?: string; children?: Map<string, FsNode> }
export interface VfsState { root: FsNode; cwd: string[] }

function mkDir(name: string, children: Record<string, FsNode> = {}): FsNode {
  return { kind: "dir", name, children: new Map(Object.entries(children)) }
}

function mkFile(name: string, content: string): FsNode {
  return { kind: "file", name, content }
}

// ── leaf file sets ──────────────────────────────────────────────

function mkMlPipelineSrc(): Record<string, FsNode> {
  return {
    "train.py": mkFile("train.py", "import argparse\nfrom peft import LoraConfig, get_peft_model\nfrom transformers import AutoModelForCausalLM, TrainingArguments\n\ndef parse_args():\n    p = argparse.ArgumentParser()\n    p.add_argument(\"--model\", required=True)\n    p.add_argument(\"--lora-rank\", type=int, default=64)\n    p.add_argument(\"--epochs\", type=int, default=3)\n    p.add_argument(\"--lr\", type=float, default=2e-4)\n    return p.parse_args()\n\ndef build_lora(model, rank: int):\n    cfg = LoraConfig(r=rank, lora_alpha=rank*2,\n                     target_modules=[\"q_proj\",\"v_proj\"])\n    return get_peft_model(model, cfg)\n\ndef main():\n    args = parse_args()\n    model = AutoModelForCausalLM.from_pretrained(args.model)\n    model = build_lora(model, args.lora_rank)\n    model.print_trainable_parameters()\n    # training loop omitted — see accelerate docs\n\nif __name__ == \"__main__\":\n    main()"),
    "inference.py": mkFile("inference.py", "from fastapi import FastAPI\nfrom pydantic import BaseModel\nimport torch\n\napp = FastAPI()\n\nclass InferRequest(BaseModel):\n    prompt: str\n    max_tokens: int = 512\n    temperature: float = 0.7\n\n@app.post(\"/infer\")\nasync def infer(req: InferRequest):\n    tokens = tokenizer(req.prompt, return_tensors=\"pt\")\n    with torch.no_grad():\n        out = model.generate(**tokens,\n                             max_new_tokens=req.max_tokens,\n                             temperature=req.temperature)\n    return {\"text\": tokenizer.decode(out[0])}\n\n@app.get(\"/health\")\nasync def health():\n    return {\"status\": \"ok\", \"device\": str(next(model.parameters()).device)}"),
    "utils.py": mkFile("utils.py", "import hashlib, json\nfrom pathlib import Path\nfrom typing import Any\n\ndef load_jsonl(path: str) -> list[dict]:\n    with open(path) as f:\n        return [json.loads(l) for l in f if l.strip()]\n\ndef save_jsonl(data: list[dict], path: str) -> None:\n    Path(path).parent.mkdir(parents=True, exist_ok=True)\n    with open(path, \"w\") as f:\n        for row in data:\n            f.write(json.dumps(row) + \"\\n\")\n\ndef sha256(text: str) -> str:\n    return hashlib.sha256(text.encode()).hexdigest()[:16]\n\ndef chunk_text(text: str, size: int, overlap: int) -> list[str]:\n    words = text.split()\n    return [\" \".join(words[i:i+size])\n            for i in range(0, len(words), size - overlap)]"),
  }
}

function mkMlPipelineRoot(): Record<string, FsNode> {
  return {
    "README.md": mkFile("README.md", "# ML Pipeline\n\nProduction training + inference pipeline for LLM fine-tuning.\n\n## Stack\n- PyTorch 2.3 + CUDA 12.1\n- LoRA fine-tuning via PEFT\n- Weights & Biases tracking\n- FastAPI inference server\n\n## Usage\nmake train MODEL=llama-4 RANK=64\nmake eval\nmake deploy\n\n## Benchmarks\nLlama-4-Maverick LoRA (rank 64):\n  MMLU:      78.4% (+6.2 vs base)\n  HumanEval: 71.3% (+8.1 vs base)\n  MT-Bench:  8.74 / 10"),
    "requirements.txt": mkFile("requirements.txt", "torch==2.3.1+cu121\ntransformers==4.41.0\npeft==0.11.1\naccerate==0.30.1\ndatasets==2.19.1\nwandb==0.17.0\nfastapi==0.111.0\nuvicorn==0.30.0\nbitsandbytes==0.43.1"),
    "Makefile": mkFile("Makefile", "MODEL ?= llama-4\nRANK  ?= 64\nEPOCHS ?= 3\n\ntrain:\n\taccerate launch src/train.py \\\n\t  --model meta-llama/$(MODEL) \\\n\t  --lora-rank $(RANK) \\\n\t  --epochs $(EPOCHS)\n\neval:\n\tpython src/inference.py --bench mt-bench\n\ndeploy:\n\tdocker build -t ml-pipeline . && \\\n\tdocker push registry.misha.dev/ml-pipeline:latest\n\nclean:\n\trm -rf checkpoints/ __pycache__/"),
    "src": mkDir("src", mkMlPipelineSrc()),
  }
}

function mkRagSystemSrc(): Record<string, FsNode> {
  return {
    "ingest.py": mkFile("ingest.py", "import argparse\nfrom pathlib import Path\nfrom qdrant_client import QdrantClient\nfrom openai import OpenAI\n\ndef chunk_docs(source: str, size: int, overlap: int) -> list[str]:\n    docs = list(Path(source).rglob(\"*.md\")) + \\\n           list(Path(source).rglob(\"*.txt\"))\n    chunks = []\n    for doc in docs:\n        text = doc.read_text()\n        words = text.split()\n        for i in range(0, len(words), size - overlap):\n            chunks.append(\" \".join(words[i:i+size]))\n    return chunks\n\ndef embed_and_index(chunks: list[str]) -> None:\n    oai = OpenAI()\n    qd = QdrantClient(\"localhost\", port=6333)\n    batch = 100\n    for i in range(0, len(chunks), batch):\n        resp = oai.embeddings.create(\n            model=\"text-embedding-3-large\",\n            input=chunks[i:i+batch])\n        vectors = [r.embedding for r in resp.data]\n        qd.upsert(\"docs_v3\", points=list(zip(range(i, i+batch), vectors)))\n    print(f\"Indexed {len(chunks)} chunks\")"),
    "retriever.py": mkFile("retriever.py", "from qdrant_client import QdrantClient\nfrom openai import OpenAI\nimport redis, json, hashlib\n\noai = OpenAI()\nqd  = QdrantClient(\"localhost\", port=6333)\nrdb = redis.Redis(decode_responses=True)\n\ndef _cache_key(q: str) -> str:\n    return \"rag:\" + hashlib.sha256(q.encode()).hexdigest()[:16]\n\ndef embed(text: str) -> list[float]:\n    return oai.embeddings.create(\n        model=\"text-embedding-3-large\", input=text\n    ).data[0].embedding\n\ndef retrieve(query: str, top_k: int = 5) -> list[str]:\n    key = _cache_key(query)\n    cached = rdb.get(key)\n    if cached:\n        return json.loads(cached)\n    vec = embed(query)\n    hits = qd.search(\"docs_v3\", query_vector=vec, limit=top_k)\n    results = [h.payload.get(\"text\",\"\") for h in hits]\n    rdb.setex(key, 3600, json.dumps(results))\n    return results"),
  }
}

function mkRagSystemRoot(): Record<string, FsNode> {
  return {
    "README.md": mkFile("README.md", "# RAG System\n\nProduction retrieval-augmented generation pipeline.\n10k queries/min @ p99 < 38ms.\n\n## Components\n- Qdrant vector DB (cosine, dim=3072)\n- OpenAI text-embedding-3-large\n- FastAPI gateway\n- Redis cache (TTL 3600s)\n\n## Quickstart\ndocker compose up -d\npython src/ingest.py --source ./data\ncurl localhost:8080/query -d '{\"q\":\"what is LoRA?\"}'"),
    "config.yaml": mkFile("config.yaml", "model:\n  embedding: text-embedding-3-large\n  completion: gpt-4o\n  temperature: 0.1\n\nvector_db:\n  host: localhost\n  port: 6333\n  collection: docs_v3\n  dim: 3072\n  metric: cosine\n\nchunking:\n  size: 512\n  overlap: 64\n\ncache:\n  backend: redis\n  ttl: 3600\n  host: localhost\n\nserver:\n  host: 0.0.0.0\n  port: 8080\n  workers: 4"),
    "docker-compose.yml": mkFile("docker-compose.yml", "version: \"3.9\"\nservices:\n  qdrant:\n    image: qdrant/qdrant:v1.9.0\n    ports: [\"6333:6333\"]\n    volumes: [\"qdrant_data:/qdrant/storage\"]\n\n  redis:\n    image: redis:7-alpine\n    ports: [\"6379:6379\"]\n\n  api:\n    build: .\n    ports: [\"8080:8080\"]\n    environment:\n      - OPENAI_API_KEY=${OPENAI_API_KEY}\n    depends_on: [qdrant, redis]\n\nvolumes:\n  qdrant_data:"),
    "src": mkDir("src", mkRagSystemSrc()),
  }
}

function mkAgentSwarmResults(): Record<string, FsNode> {
  return {
    "run_2026-06-20.log": mkFile("run_2026-06-20.log", "[06:00:01] INFO  Swarm initialized: 12 agents\n[06:00:01] INFO  Task: refactor auth module (147 files)\n[06:00:02] INFO  Agent[planner]   → decomposed into 8 subtasks\n[06:00:02] INFO  Agent[coder-0]   → rewriting auth/jwt.py\n[06:00:02] INFO  Agent[coder-1]   → rewriting auth/oauth.py\n[06:00:02] INFO  Agent[coder-2]   → rewriting auth/rbac.py\n[06:00:03] INFO  Agent[reviewer-0] confidence=0.94\n[06:00:03] INFO  Agent[reviewer-1] confidence=0.97\n[06:00:04] INFO  PASS  confidence=0.97 > 0.95 → auto-merge approved\n[06:00:04] INFO  847 lines refactored, 0 regressions\n[06:00:04] INFO  Merged to main: commit e7b4d08"),
  }
}

function mkAgentSwarmRoot(): Record<string, FsNode> {
  return {
    "README.md": mkFile("README.md", "# Agent Swarm\nParallel multi-agent orchestrator with consensus voting.\n12 agents, auto-merge at confidence > 0.95."),
    "orchestrator.py": mkFile("orchestrator.py", "import asyncio\nfrom dataclasses import dataclass\nfrom typing import Any\n\n@dataclass\nclass Task:\n    id: str\n    prompt: str\n    context: dict[str, Any]\n\n@dataclass\nclass Result:\n    task_id: str\n    output: str\n    confidence: float\n\nclass AgentSwarm:\n    \"\"\"Parallel multi-agent executor with consensus voting.\"\"\"\n\n    def __init__(self, n_agents: int = 12):\n        self.n_agents = n_agents\n\n    async def execute(self, task: Task) -> Result:\n        subtasks = await self._plan(task)\n        results  = await asyncio.gather(*[\n            self._run_agent(i, st) for i, st in enumerate(subtasks)\n        ])\n        return self._vote(task.id, results)\n\n    async def _plan(self, task: Task) -> list[str]:\n        # decompose via planner agent\n        return [task.prompt] * min(self.n_agents, 4)\n\n    async def _run_agent(self, idx: int, subtask: str) -> Result:\n        await asyncio.sleep(0)  # yield\n        return Result(f\"agent-{idx}\", f\"result-{idx}\", 0.9 + idx * 0.005)\n\n    def _vote(self, task_id: str, results: list[Result]) -> Result:\n        best = max(results, key=lambda r: r.confidence)\n        return Result(task_id, best.output, best.confidence)"),
    "results": mkDir("results", mkAgentSwarmResults()),
  }
}

function mkPortfolioRoot(): Record<string, FsNode> {
  return {
    "README.md": mkFile("README.md", "# Portfolio\nThis site. Built with Next.js 16 + Bun.\nRun: bun dev"),
    "package.json": mkFile("package.json", "{\n  \"name\": \"portfolio\",\n  \"version\": \"0.6.0\",\n  \"scripts\": {\n    \"dev\": \"next dev\",\n    \"build\": \"next build\",\n    \"test\": \"vitest run\"\n  }\n}"),
  }
}

function mkProjects(): FsNode {
  return mkDir("projects", {
    "ml-pipeline": mkDir("ml-pipeline", mkMlPipelineRoot()),
    "rag-system": mkDir("rag-system", mkRagSystemRoot()),
    "agent-swarm": mkDir("agent-swarm", mkAgentSwarmRoot()),
    "portfolio": mkDir("portfolio", mkPortfolioRoot()),
  })
}

function mkNotes(): FsNode {
  return mkDir("notes", {
    "ideas.md": mkFile("ideas.md", "# Ideas\n\n## AI Projects\n- [ ] Build a self-improving code review agent\n- [ ] Train a domain-specific embedding model on ML papers\n- [ ] Multi-modal RAG with PDF + image understanding\n- [x] Agent swarm with consensus voting — DONE\n- [x] Streaming inference API at edge — DONE\n\n## Blog Posts\n- [ ] \"Why your RAG pipeline is lying to you\"\n- [ ] \"LoRA rank selection: empirical guide\"\n- [ ] \"Building agent memory that doesn't hallucinate\"\n\n## Random\n- Research gradient checkpointing trade-offs\n- Look into Flash Attention 3\n- Try Qwen-3 on the fine-tuning benchmark"),
    "reading-list.md": mkFile("reading-list.md", "# Reading List\n\n## Papers\n- [ ] FlashAttention-3: Fast and Memory-Efficient Exact Attention\n- [x] LoRA: Low-Rank Adaptation of Large Language Models\n- [x] Retrieval-Augmented Generation for Knowledge-Intensive NLP\n- [ ] Constitutional AI: Harmlessness from AI Feedback\n- [ ] Tree of Thoughts: Deliberate Problem Solving with LLMs\n\n## Books\n- [x] Designing Data-Intensive Applications — Kleppmann\n- [ ] The Pragmatic Programmer (re-read)\n- [ ] Software Engineering at Google\n\n## Articles\n- The bitter lesson (Sutton) — re-read monthly\n- Latency numbers every programmer should know"),
  })
}

function mkScripts(): FsNode {
  return mkDir("scripts", {
    "deploy.sh": mkFile("deploy.sh", "#!/bin/bash\nset -euo pipefail\n\nVERSION=$(cat VERSION)\nREGISTRY=\"registry.misha.dev\"\nIMAGE=\"$REGISTRY/ml-pipeline:$VERSION\"\n\necho \"[deploy] Building $IMAGE\"\ndocker build -t \"$IMAGE\" .\ndocker push \"$IMAGE\"\n\necho \"[deploy] Updating k8s deployment\"\nkubectl set image deployment/ml-pipeline ml-pipeline=\"$IMAGE\"\nkubectl rollout status deployment/ml-pipeline\n\necho \"[deploy] v$VERSION deployed successfully\""),
    "setup.sh": mkFile("setup.sh", "#!/bin/bash\nset -euo pipefail\ncurl -LsSf https://astral.sh/uv/install.sh | sh\nuv sync\necho 'Setup complete.'"),
  })
}

function mkLogs(): FsNode {
  return mkDir("logs", {
    "training.log": mkFile("training.log", "[2026-06-20 06:42:00] INFO  Starting training run: llama-4-maverick-lora-r64\n[2026-06-20 06:42:01] INFO  GPU: 8x A100 80GB (bf16)\n[2026-06-20 06:42:10] INFO  Dataset: 847k samples loaded\n[2026-06-20 07:15:33] INFO  Epoch 1/3 | loss=1.247 | lr=2e-4\n[2026-06-20 08:48:21] INFO  Epoch 2/3 | loss=0.834 | lr=1.8e-4\n[2026-06-20 10:21:09] INFO  Epoch 3/3 | loss=0.612 | lr=9e-5\n[2026-06-20 10:21:10] INFO  Saving checkpoint: checkpoints/llama-ft-v4\n[2026-06-20 10:21:45] INFO  MMLU: 78.4% | HumanEval: 71.3% | MT-Bench: 8.74\n[2026-06-20 10:21:45] INFO  Training complete. Wall time: 3h39m45s"),
    "api.log": mkFile("api.log", "2026-06-20 08:00:01 INFO  FastAPI starting on 0.0.0.0:8080\n2026-06-20 08:00:02 INFO  Model loaded: checkpoints/llama-ft-v4 (device=cuda:0)\n2026-06-20 08:14:33 INFO  POST /infer 200 | tokens=512 | latency=34ms\n2026-06-20 08:14:34 INFO  POST /infer 200 | tokens=128 | latency=12ms\n2026-06-20 09:30:01 WARN  High load: queue_depth=147 | p99=89ms\n2026-06-20 09:30:45 INFO  Auto-scaled: +2 replicas\n2026-06-20 09:31:00 INFO  Queue cleared. p99=31ms"),
  })
}

function mkMisha(): FsNode {
  return mkDir("misha", {
    ".bashrc": mkFile(".bashrc", "# Misha's shell config\nexport PATH=\"$HOME/.local/bin:$PATH\"\nexport CUDA_VISIBLE_DEVICES=0,1,2,3\nexport PYTHONPATH=\"$HOME/projects/ml-pipeline/src\"\nexport HF_HOME=\"$HOME/.cache/huggingface\"\n\nalias ll='ls -la'\nalias gs='git status'\nalias gp='git push'\nalias dc='docker compose'\nalias py='python3'\nalias activate='source .venv/bin/activate'\n\n# WPM record: 187"),
    ".vimrc": mkFile(".vimrc", "set number\nset tabstop=2\nset shiftwidth=2\nset expandtab\ncolorscheme desert\nsyntax on"),
    "welcome.txt": mkFile("welcome.txt", "Welcome to misha@dev!\nType 'help' for available commands.\nTry: ls, cd projects, cat README.md"),
    projects: mkProjects(),
    notes: mkNotes(),
    scripts: mkScripts(),
    logs: mkLogs(),
  })
}

function mkEtc(): FsNode {
  return mkDir("etc", {
    hosts: mkFile("hosts", "127.0.0.1  localhost\n127.0.0.1  misha.dev\n::1        localhost"),
    environment: mkFile("environment", "PATH=/usr/local/bin:/usr/bin:/bin\nUSER=misha\nHOME=/home/misha\nSHELL=/bin/zsh\nLANG=en_US.UTF-8"),
    motd: mkFile("motd", "Welcome to misha@dev\nAI/ML Engineer · Next.js + Bun\nType 'help' for commands."),
  })
}

function mkVar(): FsNode {
  return mkDir("var", {
    log: mkDir("log", {
      "system.log": mkFile("system.log", "Jun 20 06:00:01 misha-dev kernel: Linux version 6.8.0\nJun 20 06:00:02 misha-dev systemd: Started.\nJun 20 08:14:33 misha-dev docker: Container rag-api started.\nJun 20 09:30:01 misha-dev cron: Training job dispatched."),
      "nginx.log": mkFile("nginx.log", "2026-06-20 08:00:00 GET / 200 142ms\n2026-06-20 08:00:01 GET /api/infer 200 38ms\n2026-06-20 08:01:45 POST /api/embed 200 12ms\n2026-06-20 08:14:33 GET /health 200 1ms"),
    }),
  })
}

export function createVfs(): VfsState {
  const root = mkDir("/", {
    home: mkDir("home", { misha: mkMisha() }),
    etc: mkEtc(),
    var: mkVar(),
    tmp: mkDir("tmp"),
  })
  return { root, cwd: ["home", "misha"] }
}

export function resolvePath(state: VfsState, rawPath: string): string[] | null {
  const isAbsolute = rawPath.startsWith("/")
  const base = isAbsolute ? [] : [...state.cwd]
  const parts = rawPath.split("/").filter(p => p.length > 0)
  const segments = [...base]
  for (const part of parts) {
    if (part === ".") continue
    if (part === "..") {
      if (segments.length === 0) return null
      segments.pop()
    } else {
      segments.push(part)
    }
  }
  return segments
}

export function getNode(state: VfsState, segments: string[]): FsNode | null {
  let node: FsNode = state.root
  for (const seg of segments) {
    if (node.kind !== "dir" || !node.children) return null
    const child = node.children.get(seg)
    if (!child) return null
    node = child
  }
  return node
}

export function listDir(state: VfsState, segments: string[]): FsNode[] | null {
  const node = getNode(state, segments)
  if (!node || node.kind !== "dir" || !node.children) return null
  return Array.from(node.children.values())
}

export function cloneNode(node: FsNode): FsNode {
  if (node.kind === "file") return { ...node }
  return { ...node, children: new Map(node.children) }
}

export function deepCloneNode(node: FsNode): FsNode {
  if (node.kind === "file") return { ...node }
  const children = new Map<string, FsNode>()
  node.children?.forEach((child, key) => { children.set(key, deepCloneNode(child)) })
  return { ...node, children }
}

export function setNodeAtPath(root: FsNode, segments: string[], leaf: FsNode): FsNode | string {
  if (segments.length === 0) return leaf
  const [head, ...rest] = segments
  if (root.kind !== "dir" || !root.children) return `not a directory`
  const next = root.children.get(head)
  const newRoot = cloneNode(root)
  if (rest.length === 0) {
    newRoot.children!.set(head, leaf)
    return newRoot
  }
  if (!next) return `no such directory: ${head}`
  const updated = setNodeAtPath(next, rest, leaf)
  if (typeof updated === "string") return updated
  newRoot.children!.set(head, updated)
  return newRoot
}

export function removeNodeAtPath(root: FsNode, segments: string[], recursive: boolean): FsNode | string {
  if (segments.length === 0) return `cannot remove root`
  const [head, ...rest] = segments
  if (root.kind !== "dir" || !root.children) return `not a directory`
  const next = root.children.get(head)
  if (!next) return `no such file or directory: ${head}`
  const newRoot = cloneNode(root)
  if (rest.length === 0) {
    if (next.kind === "dir" && !recursive) return `is a directory (use recursive)`
    newRoot.children!.delete(head)
    return newRoot
  }
  const updated = removeNodeAtPath(next, rest, recursive)
  if (typeof updated === "string") return updated
  newRoot.children!.set(head, updated)
  return newRoot
}

export function mkdirNode(state: VfsState, segments: string[]): VfsState | string {
  if (segments.length === 0) return `invalid path`
  const existing = getNode(state, segments)
  if (existing) return `already exists: ${segments[segments.length - 1]}`
  const parent = getNode(state, segments.slice(0, -1))
  if (!parent || parent.kind !== "dir") return `parent directory not found`
  const name = segments[segments.length - 1]
  const newNode = mkDir(name)
  const updated = setNodeAtPath(state.root, segments, newNode)
  if (typeof updated === "string") return updated
  return { ...state, root: updated }
}

export function touchNode(state: VfsState, segments: string[]): VfsState | string {
  if (segments.length === 0) return `invalid path`
  const existing = getNode(state, segments)
  if (existing) return `already exists: ${segments[segments.length - 1]}`
  const parent = getNode(state, segments.slice(0, -1))
  if (!parent || parent.kind !== "dir") return `parent directory not found`
  const name = segments[segments.length - 1]
  const newNode = mkFile(name, "")
  const updated = setNodeAtPath(state.root, segments, newNode)
  if (typeof updated === "string") return updated
  return { ...state, root: updated }
}

export function writeNode(state: VfsState, segments: string[], content: string): VfsState | string {
  if (segments.length === 0) return `invalid path`
  const parent = getNode(state, segments.slice(0, -1))
  if (!parent || parent.kind !== "dir") return `parent directory not found`
  const name = segments[segments.length - 1]
  const existing = getNode(state, segments)
  if (existing && existing.kind === "dir") return `is a directory: ${name}`
  const newNode = mkFile(name, content)
  const updated = setNodeAtPath(state.root, segments, newNode)
  if (typeof updated === "string") return updated
  return { ...state, root: updated }
}

export function removeNode(state: VfsState, segments: string[], recursive: boolean): VfsState | string {
  if (segments.length === 0) return `cannot remove root`
  const updated = removeNodeAtPath(state.root, segments, recursive)
  if (typeof updated === "string") return updated
  return { ...state, root: updated }
}

export function cwdString(state: VfsState): string {
  if (state.cwd.length === 0) return "/"
  const full = "/" + state.cwd.join("/")
  if (full === "/home/misha") return "~"
  if (full.startsWith("/home/misha/")) return "~" + full.slice("/home/misha".length)
  return full
}
