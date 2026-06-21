export type NodeKind = "file" | "dir"
export interface FsNode { kind: NodeKind; name: string; content?: string; children?: Map<string, FsNode> }
export interface VfsState { root: FsNode; cwd: string[] }

function mkDir(name: string, children: Record<string, FsNode> = {}): FsNode {
  return { kind: "dir", name, children: new Map(Object.entries(children)) }
}

function mkFile(name: string, content: string): FsNode {
  return { kind: "file", name, content }
}

export function createVfs(): VfsState {
  const agents = mkDir("agents", {
    "README.md": mkFile("README.md", "# Agents\nMulti-agent orchestration system built with asyncio.\nRuns 12 parallel sub-agents with consensus voting."),
  })
  const ragSystem = mkDir("rag-system", {
    "config.yaml": mkFile("config.yaml", "model: llama-4\nchunk_size: 512\noverlap: 64\nindex: qdrant"),
  })
  const projects = mkDir("projects", { agents, "rag-system": ragSystem })
  const misha = mkDir("misha", {
    projects,
    ".bashrc": mkFile(".bashrc", "# Misha's shell config\nexport PS1='misha@dev $ '\nalias ll='ls -l'\nalias gs='git status'"),
    "welcome.txt": mkFile("welcome.txt", "Welcome to misha@dev!\nType 'help' for available commands.\nTry: ls, cd projects, cat README.md"),
  })
  const home = mkDir("home", { misha })
  const etc = mkDir("etc", {
    motd: mkFile("motd", "misha@dev — AI/ML Engineer\nRunning: Next.js + Bun\nUptime: always"),
  })
  const root = mkDir("/", { home, etc })
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

function cloneNode(node: FsNode): FsNode {
  if (node.kind === "file") return { ...node }
  return { ...node, children: new Map(node.children) }
}

function setNodeAtPath(root: FsNode, segments: string[], leaf: FsNode): FsNode | string {
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

function removeNodeAtPath(root: FsNode, segments: string[], recursive: boolean): FsNode | string {
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
