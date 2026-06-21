import {
  VfsState,
  FsNode,
  createVfs,
  resolvePath,
  getNode,
  listDir,
  mkdirNode,
  touchNode,
  writeNode,
  removeNode,
  cwdString,
  deepCloneNode,
  setNodeAtPath,
  removeNodeAtPath,
} from "@/lib/virtual-fs"

export interface OutputLine {
  text: string
  kind: "output" | "error" | "system" | "prompt"
}

export interface ShellState {
  vfs: VfsState
  history: string[]
  historyIdx: number
  env: Record<string, string>
}

export function createShellState(): ShellState {
  return {
    vfs: createVfs(),
    history: [],
    historyIdx: -1,
    env: {
      HOME: "/home/misha",
      USER: "misha",
      SHELL: "/bin/zsh",
      PATH: "/usr/local/bin:/usr/bin:/bin",
      TERM: "xterm-256color",
    },
  }
}

type CommandResult = { lines: OutputLine[]; vfs?: VfsState; action?: "clear" | "snake"; env?: Record<string, string> }
type CommandFn = (state: ShellState, args: string[]) => CommandResult

function mkOut(text: string): OutputLine { return { text, kind: "output" } }
function mkErr(text: string): OutputLine { return { text, kind: "error" } }

// ── help ──────────────────────────────────────────────────────

function cmdHelp(): CommandResult {
  const lines = [
    "help      show this help",
    "ls        list directory contents (-l for long format)",
    "cd        change directory",
    "pwd       print working directory",
    "cat       print file contents",
    "echo      print text or redirect (echo text > file)",
    "mkdir     create directory",
    "touch     create empty file",
    "rm        remove file or directory (-r for recursive)",
    "cp        copy file or directory (-r for dir)",
    "mv        move/rename file",
    "head      first N lines of file (-n N)",
    "tail      last N lines of file (-n N)",
    "grep      search file for pattern (-r -i -n)",
    "find      find files by name glob",
    "tree      show directory tree",
    "wc        word/line/char count",
    "sort      sort file lines",
    "stat      file/dir info",
    "file      detect file type",
    "env       print environment variables",
    "export    set environment variable",
    "git       git shortcuts",
    "python    run python (or show version)",
    "make      run Makefile target",
    "clear     clear the terminal",
    "neofetch  system information",
    "snake     launch snake game",
    "history   show command history",
  ].map(mkOut)
  return { lines }
}

// ── ls ───────────────────────────────────────────────────────

function cmdLs(state: ShellState, args: string[]): CommandResult {
  const flagIdx = args.findIndex(a => a.startsWith("-"))
  const flags = flagIdx !== -1 ? args[flagIdx] : ""
  const pathArgs = args.filter(a => !a.startsWith("-"))
  const rawPath = pathArgs[0] ?? "."
  const segs = resolvePath(state.vfs, rawPath)
  if (!segs) return { lines: [mkErr(`ls: cannot access '${rawPath}': No such file or directory`)] }
  const entries = listDir(state.vfs, segs)
  if (!entries) return { lines: [mkErr(`ls: cannot access '${rawPath}': Not a directory`)] }
  if (entries.length === 0) return { lines: [] }
  const long = flags.includes("l")
  const lines = entries.map(n => mkOut(long ? `${n.kind === "dir" ? "d/" : "f/"}  ${n.name}` : n.name))
  return { lines }
}

// ── cd ───────────────────────────────────────────────────────

function cmdCd(state: ShellState, args: string[]): CommandResult {
  const target = args[0] ?? "/home/misha"
  const segs = resolvePath(state.vfs, target)
  if (!segs) return { lines: [mkErr(`cd: no such file or directory: ${target}`)] }
  const node = getNode(state.vfs, segs)
  if (!node || node.kind !== "dir") return { lines: [mkErr(`cd: not a directory: ${target}`)] }
  return { lines: [], vfs: { ...state.vfs, cwd: segs } }
}

// ── pwd ──────────────────────────────────────────────────────

function cmdPwd(state: ShellState): CommandResult {
  return { lines: [mkOut(cwdString(state.vfs))] }
}

// ── mkdir ────────────────────────────────────────────────────

function cmdMkdir(state: ShellState, args: string[]): CommandResult {
  if (!args[0]) return { lines: [mkErr("mkdir: missing operand")] }
  const segs = resolvePath(state.vfs, args[0])
  if (!segs) return { lines: [mkErr(`mkdir: invalid path: ${args[0]}`)] }
  const result = mkdirNode(state.vfs, segs)
  if (typeof result === "string") return { lines: [mkErr(`mkdir: ${result}`)] }
  return { lines: [], vfs: result }
}

// ── touch ────────────────────────────────────────────────────

function cmdTouch(state: ShellState, args: string[]): CommandResult {
  if (!args[0]) return { lines: [mkErr("touch: missing file operand")] }
  const segs = resolvePath(state.vfs, args[0])
  if (!segs) return { lines: [mkErr(`touch: invalid path: ${args[0]}`)] }
  const result = touchNode(state.vfs, segs)
  if (typeof result === "string") return { lines: [mkErr(`touch: ${result}`)] }
  return { lines: [], vfs: result }
}

// ── cat ──────────────────────────────────────────────────────

function cmdCat(state: ShellState, args: string[]): CommandResult {
  if (!args[0]) return { lines: [mkErr("cat: missing file operand")] }
  const segs = resolvePath(state.vfs, args[0])
  if (!segs) return { lines: [mkErr(`cat: ${args[0]}: No such file or directory`)] }
  const node = getNode(state.vfs, segs)
  if (!node) return { lines: [mkErr(`cat: ${args[0]}: No such file or directory`)] }
  if (node.kind !== "file") return { lines: [mkErr(`cat: ${args[0]}: Is a directory`)] }
  return { lines: [mkOut(node.content ?? "")] }
}

// ── echo ─────────────────────────────────────────────────────

function parseEchoArgs(args: string[]): { text: string; file: string | null } {
  const pivotIdx = args.indexOf(">")
  if (pivotIdx === -1) return { text: args.join(" "), file: null }
  return { text: args.slice(0, pivotIdx).join(" "), file: args[pivotIdx + 1] ?? null }
}

function cmdEcho(state: ShellState, args: string[]): CommandResult {
  const { text, file } = parseEchoArgs(args)
  if (!file) return { lines: [mkOut(text)] }
  const segs = resolvePath(state.vfs, file)
  if (!segs) return { lines: [mkErr(`echo: invalid path: ${file}`)] }
  const result = writeNode(state.vfs, segs, text)
  if (typeof result === "string") return { lines: [mkErr(`echo: ${result}`)] }
  return { lines: [], vfs: result }
}

// ── rm ───────────────────────────────────────────────────────

function cmdRm(state: ShellState, args: string[]): CommandResult {
  const flagIdx = args.findIndex(a => a.startsWith("-"))
  const flags = flagIdx !== -1 ? args[flagIdx] : ""
  const pathArgs = args.filter(a => !a.startsWith("-"))
  if (!pathArgs[0]) return { lines: [mkErr("rm: missing operand")] }
  const segs = resolvePath(state.vfs, pathArgs[0])
  if (!segs) return { lines: [mkErr(`rm: cannot remove '${pathArgs[0]}': No such file or directory`)] }
  const result = removeNode(state.vfs, segs, flags.includes("r"))
  if (typeof result === "string") return { lines: [mkErr(`rm: ${result}`)] }
  return { lines: [], vfs: result }
}

// ── cp ───────────────────────────────────────────────────────

function cmdCp(state: ShellState, args: string[]): CommandResult {
  const flags = args.filter(a => a.startsWith("-")).join("")
  const paths = args.filter(a => !a.startsWith("-"))
  if (paths.length < 2) return { lines: [mkErr("cp: missing destination")] }
  const [src, dst] = paths
  const srcSegs = resolvePath(state.vfs, src)
  if (!srcSegs) return { lines: [mkErr(`cp: '${src}': No such file or directory`)] }
  const srcNode = getNode(state.vfs, srcSegs)
  if (!srcNode) return { lines: [mkErr(`cp: '${src}': No such file or directory`)] }
  if (srcNode.kind === "dir" && !flags.includes("r")) return { lines: [mkErr(`cp: '${src}' is a directory (use -r)`)] }
  const dstSegs = resolvePath(state.vfs, dst)
  if (!dstSegs) return { lines: [mkErr(`cp: invalid destination: ${dst}`)] }
  const cloned = deepCloneNode({ ...srcNode, name: dstSegs[dstSegs.length - 1] })
  const updated = setNodeAtPath(state.vfs.root, dstSegs, cloned)
  if (typeof updated === "string") return { lines: [mkErr(`cp: ${updated}`)] }
  return { lines: [], vfs: { ...state.vfs, root: updated } }
}

// ── mv ───────────────────────────────────────────────────────

function cmdMv(state: ShellState, args: string[]): CommandResult {
  const paths = args.filter(a => !a.startsWith("-"))
  if (paths.length < 2) return { lines: [mkErr("mv: missing destination")] }
  const [src, dst] = paths
  const srcSegs = resolvePath(state.vfs, src)
  if (!srcSegs) return { lines: [mkErr(`mv: '${src}': No such file or directory`)] }
  const srcNode = getNode(state.vfs, srcSegs)
  if (!srcNode) return { lines: [mkErr(`mv: '${src}': No such file or directory`)] }
  const dstSegs = resolvePath(state.vfs, dst)
  if (!dstSegs) return { lines: [mkErr(`mv: invalid destination: ${dst}`)] }
  const cloned = deepCloneNode({ ...srcNode, name: dstSegs[dstSegs.length - 1] })
  const withDst = setNodeAtPath(state.vfs.root, dstSegs, cloned)
  if (typeof withDst === "string") return { lines: [mkErr(`mv: ${withDst}`)] }
  const withoutSrc = removeNodeAtPath(withDst, srcSegs, true)
  if (typeof withoutSrc === "string") return { lines: [mkErr(`mv: ${withoutSrc}`)] }
  return { lines: [], vfs: { ...state.vfs, root: withoutSrc } }
}

// ── ln ───────────────────────────────────────────────────────

function cmdLn(state: ShellState, args: string[]): CommandResult {
  const paths = args.filter(a => !a.startsWith("-"))
  if (paths.length < 2) return { lines: [mkErr("ln: missing destination")] }
  const [src, dst] = paths
  const dstSegs = resolvePath(state.vfs, dst)
  if (!dstSegs) return { lines: [mkErr(`ln: invalid path: ${dst}`)] }
  const name = dstSegs[dstSegs.length - 1]
  const result = writeNode(state.vfs, dstSegs, `-> ${src}`)
  if (typeof result === "string") return { lines: [mkErr(`ln: ${result}`)] }
  return { lines: [], vfs: result }
}

// ── head ─────────────────────────────────────────────────────

function parseNFlag(args: string[], defaultN: number): { n: number; rest: string[] } {
  const idx = args.indexOf("-n")
  if (idx === -1) {
    const combined = args.find(a => /^-\d+$/.test(a))
    if (combined) return { n: parseInt(combined.slice(1)), rest: args.filter(a => a !== combined) }
    return { n: defaultN, rest: args.filter(a => !a.startsWith("-")) }
  }
  const n = parseInt(args[idx + 1] ?? String(defaultN))
  const rest = args.filter((_, i) => i !== idx && i !== idx + 1 && !args[i].startsWith("-"))
  return { n: isNaN(n) ? defaultN : n, rest }
}

function cmdHead(state: ShellState, args: string[]): CommandResult {
  const { n, rest } = parseNFlag(args, 10)
  const file = rest[0]
  if (!file) return { lines: [mkErr("head: missing file operand")] }
  const segs = resolvePath(state.vfs, file)
  if (!segs) return { lines: [mkErr(`head: ${file}: No such file`)] }
  const node = getNode(state.vfs, segs)
  if (!node || node.kind !== "file") return { lines: [mkErr(`head: ${file}: No such file`)] }
  return { lines: (node.content ?? "").split("\n").slice(0, n).map(mkOut) }
}

// ── tail ─────────────────────────────────────────────────────

function cmdTail(state: ShellState, args: string[]): CommandResult {
  const { n, rest } = parseNFlag(args, 10)
  const file = rest[0]
  if (!file) return { lines: [mkErr("tail: missing file operand")] }
  const segs = resolvePath(state.vfs, file)
  if (!segs) return { lines: [mkErr(`tail: ${file}: No such file`)] }
  const node = getNode(state.vfs, segs)
  if (!node || node.kind !== "file") return { lines: [mkErr(`tail: ${file}: No such file`)] }
  const all = (node.content ?? "").split("\n")
  return { lines: all.slice(-n).map(mkOut) }
}

// ── wc ───────────────────────────────────────────────────────

function fmtWc(flag: string, content: string, filename: string): string {
  const lines = content.split("\n").length
  const words = content.split(/\s+/).filter(Boolean).length
  const chars = content.length
  const counts: Record<string, string> = {
    "-l": `  ${lines} ${filename}`,
    "-w": `  ${words} ${filename}`,
    "-c": `  ${chars} ${filename}`,
  }
  return counts[flag] ?? `  ${lines}  ${words} ${chars} ${filename}`
}

function cmdWc(state: ShellState, args: string[]): CommandResult {
  const flag = args.find(a => a.startsWith("-")) ?? ""
  const file = args.find(a => !a.startsWith("-"))
  if (!file) return { lines: [mkErr("wc: missing file operand")] }
  const segs = resolvePath(state.vfs, file)
  if (!segs) return { lines: [mkErr(`wc: ${file}: No such file`)] }
  const node = getNode(state.vfs, segs)
  if (!node || node.kind !== "file") return { lines: [mkErr(`wc: ${file}: No such file`)] }
  return { lines: [mkOut(fmtWc(flag, node.content ?? "", file))] }
}

// ── grep ─────────────────────────────────────────────────────

function grepFile(content: string, pattern: RegExp, filename: string, showNum: boolean): OutputLine[] {
  return content.split("\n")
    .map((line, i) => ({ line, i: i + 1 }))
    .filter(({ line }) => pattern.test(line))
    .map(({ line, i }) => mkOut(showNum ? `${filename}:${i}: ${line}` : line))
}

function collectFiles(state: ShellState, segs: string[]): Array<{ segs: string[]; name: string }> {
  const node = getNode(state.vfs, segs)
  if (!node) return []
  if (node.kind === "file") return [{ segs, name: segs.join("/") }]
  const entries = listDir(state.vfs, segs) ?? []
  return entries.flatMap(e => collectFiles(state, [...segs, e.name]))
}

function cmdGrep(state: ShellState, args: string[]): CommandResult {
  const flags = args.filter(a => a.startsWith("-")).join("")
  const rest = args.filter(a => !a.startsWith("-"))
  if (rest.length < 2) return { lines: [mkErr("grep: usage: grep [flags] pattern file")] }
  const [pattern, target] = rest
  const regex = new RegExp(pattern, flags.includes("i") ? "i" : "")
  const showNum = flags.includes("n")
  const segs = resolvePath(state.vfs, target)
  if (!segs) return { lines: [mkErr(`grep: ${target}: No such file`)] }
  if (flags.includes("r")) {
    const files = collectFiles(state, segs)
    return { lines: files.flatMap(f => {
      const n = getNode(state.vfs, f.segs)
      return n?.kind === "file" ? grepFile(n.content ?? "", regex, f.name, showNum) : []
    })}
  }
  const node = getNode(state.vfs, segs)
  if (!node || node.kind !== "file") return { lines: [mkErr(`grep: ${target}: No such file`)] }
  return { lines: grepFile(node.content ?? "", regex, target, showNum) }
}

// ── sort ─────────────────────────────────────────────────────

function cmdSort(state: ShellState, args: string[]): CommandResult {
  const file = args.find(a => !a.startsWith("-"))
  if (!file) return { lines: [mkErr("sort: missing file operand")] }
  const segs = resolvePath(state.vfs, file)
  if (!segs) return { lines: [mkErr(`sort: ${file}: No such file`)] }
  const node = getNode(state.vfs, segs)
  if (!node || node.kind !== "file") return { lines: [mkErr(`sort: ${file}: No such file`)] }
  return { lines: (node.content ?? "").split("\n").sort().map(mkOut) }
}

// ── find ─────────────────────────────────────────────────────

function globToRegex(glob: string): RegExp {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")
  return new RegExp(`^${escaped}$`)
}

function findFiles(state: ShellState, segs: string[], nameRx: RegExp | null, basePath: string): string[] {
  const entries = listDir(state.vfs, segs) ?? []
  return entries.flatMap(e => {
    const childPath = basePath ? `${basePath}/${e.name}` : e.name
    const matches = !nameRx || nameRx.test(e.name)
    const self = matches ? [childPath] : []
    const sub = e.kind === "dir" ? findFiles(state, [...segs, e.name], nameRx, childPath) : []
    return [...self, ...sub]
  })
}

function cmdFind(state: ShellState, args: string[]): CommandResult {
  const nameIdx = args.indexOf("-name")
  const nameGlob = nameIdx !== -1 ? args[nameIdx + 1] : null
  const nonFlags = args.filter((_, i) => i !== nameIdx && i !== nameIdx + 1 && !args[i - 1]?.includes("-name"))
  const pathArg = nonFlags.find(a => !a.startsWith("-")) ?? "."
  const segs = resolvePath(state.vfs, pathArg)
  if (!segs) return { lines: [mkErr(`find: '${pathArg}': No such file or directory`)] }
  const nameRx = nameGlob ? globToRegex(nameGlob) : null
  const results = findFiles(state, segs, nameRx, "")
  return { lines: results.map(mkOut) }
}

// ── tree ─────────────────────────────────────────────────────

function buildTreeLines(state: ShellState, segs: string[], prefix: string): string[] {
  const entries = listDir(state.vfs, segs) ?? []
  return entries.flatMap((e, i) => {
    const isLast = i === entries.length - 1
    const connector = isLast ? "└── " : "├── "
    const label = `${prefix}${connector}${e.name}`
    if (e.kind !== "dir") return [label]
    const childPrefix = prefix + (isLast ? "    " : "│   ")
    return [label, ...buildTreeLines(state, [...segs, e.name], childPrefix)]
  })
}

function cmdTree(state: ShellState, args: string[]): CommandResult {
  const rawPath = args.find(a => !a.startsWith("-")) ?? "."
  const segs = resolvePath(state.vfs, rawPath)
  if (!segs) return { lines: [mkErr(`tree: '${rawPath}': No such directory`)] }
  const node = getNode(state.vfs, segs)
  if (!node || node.kind !== "dir") return { lines: [mkErr(`tree: '${rawPath}': Not a directory`)] }
  const header = rawPath === "." ? cwdString(state.vfs) : rawPath
  return { lines: [mkOut(header), ...buildTreeLines(state, segs, "").map(mkOut)] }
}

// ── stat ─────────────────────────────────────────────────────

function cmdStat(state: ShellState, args: string[]): CommandResult {
  const path = args[0]
  if (!path) return { lines: [mkErr("stat: missing operand")] }
  const segs = resolvePath(state.vfs, path)
  if (!segs) return { lines: [mkErr(`stat: ${path}: No such file`)] }
  const node = getNode(state.vfs, segs)
  if (!node) return { lines: [mkErr(`stat: ${path}: No such file`)] }
  const size = node.kind === "file" ? (node.content ?? "").length : 0
  const perms = node.kind === "dir" ? "drwxr-xr-x" : "-rw-r--r--"
  return { lines: [
    mkOut(`File: ${node.name}`),
    mkOut(`Size: ${size} bytes`),
    mkOut(`Type: ${node.kind}`),
    mkOut(`Permissions: ${perms}`),
  ]}
}

// ── file ─────────────────────────────────────────────────────

function detectFileType(node: FsNode): string {
  if (node.kind === "dir") return "directory"
  const ext = node.name.split(".").pop() ?? ""
  const types: Record<string, string> = {
    py: "Python script", md: "Markdown document",
    yaml: "YAML document", yml: "YAML document",
    json: "JSON data", sh: "shell script",
    log: "ASCII log text", txt: "ASCII text",
  }
  return types[ext] ?? "ASCII text"
}

function cmdFile(state: ShellState, args: string[]): CommandResult {
  const path = args[0]
  if (!path) return { lines: [mkErr("file: missing operand")] }
  const segs = resolvePath(state.vfs, path)
  if (!segs) return { lines: [mkErr(`file: ${path}: No such file`)] }
  const node = getNode(state.vfs, segs)
  if (!node) return { lines: [mkErr(`file: ${path}: No such file`)] }
  return { lines: [mkOut(`${path}: ${detectFileType(node)}`)] }
}

// ── env / export ─────────────────────────────────────────────

function cmdEnv(state: ShellState): CommandResult {
  return { lines: Object.entries(state.env).map(([k, v]) => mkOut(`${k}=${v}`)) }
}

function cmdExport(state: ShellState, args: string[]): CommandResult {
  if (!args[0]) return { lines: [mkErr("export: missing argument")] }
  const eqIdx = args[0].indexOf("=")
  if (eqIdx === -1) return { lines: [] }
  const key = args[0].slice(0, eqIdx)
  const val = args[0].slice(eqIdx + 1)
  return { lines: [], env: { ...state.env, [key]: val } }
}

// ── alias ────────────────────────────────────────────────────

function cmdAlias(): CommandResult {
  return { lines: [
    "ll='ls -la'",
    "gs='git status'",
    "gp='git push'",
    "dc='docker compose'",
    "py='python3'",
    "activate='source .venv/bin/activate'",
  ].map(mkOut) }
}

// ── system info ──────────────────────────────────────────────

function cmdUname(_state: ShellState, args: string[]): CommandResult {
  const full = args.includes("-a")
  return { lines: [mkOut(full ? "Linux misha-dev 6.8.0-misha #1 SMP x86_64 GNU/Linux" : "Linux")] }
}

function cmdDf(_state: ShellState, args: string[]): CommandResult {
  return { lines: [
    mkOut("Filesystem  Size  Used  Avail  Use%  Mounted on"),
    mkOut("/dev/sda1   500G  127G   373G   26%  /"),
  ]}
}

function cmdDu(state: ShellState, args: string[]): CommandResult {
  const path = args.find(a => !a.startsWith("-")) ?? "."
  const segs = resolvePath(state.vfs, path)
  const resolved = segs ? "/" + segs.join("/") : path
  return { lines: [mkOut(`4.2G\t${resolved}`)] }
}

function cmdFree(): CommandResult {
  return { lines: [
    mkOut("              total   used   free"),
    mkOut("Mem:    128G    47G    81G"),
    mkOut("Swap:     8G     0G     8G"),
  ]}
}

const FAKE_PROCESSES = [
  "  PID  USER     COMMAND",
  "    1  root     /sbin/init",
  "  142  misha    /bin/zsh",
  "  891  misha    python3 src/train.py",
  " 1024  misha    node server.js",
  " 2048  root     dockerd",
  " 3001  misha    uvicorn inference:app",
  " 4200  misha    redis-server",
]

function cmdPs(_state: ShellState, args: string[]): CommandResult {
  return { lines: FAKE_PROCESSES.map(mkOut) }
}

function cmdTop(): CommandResult {
  return { lines: [
    mkOut("top - 18:00:00 up 14 days | Tasks: 142 | CPU: 12.4% | MEM: 36.7%"),
    ...FAKE_PROCESSES.map(mkOut),
  ]}
}

// ── git ──────────────────────────────────────────────────────

const GIT_STATUS = "On branch main\nYour branch is up to date.\nnothing to commit, working tree clean"
const GIT_LOG = "e7b4d08 feat: add agent swarm consensus voting\na3f1c92 fix: rag retriever cache key collision\n7d2e5b1 feat: lora fine-tuning pipeline\n9c8a4f3 chore: update dependencies\n1b6d0e7 init: project scaffold"

function gitDispatch(sub: string): string {
  const table: Record<string, string> = {
    status: GIT_STATUS,
    log: GIT_LOG,
    diff: "(no diff)",
    push: "Everything up-to-date",
    pull: "Already up to date.",
    branch: "* main",
  }
  return table[sub] ?? `git: '${sub}' — see git help`
}

function cmdGit(_state: ShellState, args: string[]): CommandResult {
  const sub = args[0] ?? "help"
  return { lines: gitDispatch(sub).split("\n").map(mkOut) }
}

// ── curl / ping / ssh ─────────────────────────────────────────

function cmdCurl(_state: ShellState, args: string[]): CommandResult {
  const url = args.find(a => !a.startsWith("-")) ?? ""
  const isLocal = url.includes("localhost") || url.includes("127.0.0.1")
  const text = isLocal
    ? `{"status":"ok","model":"llama-ft-v4","latency_ms":31}`
    : `curl: could not connect (try localhost:8080)`
  return { lines: [mkOut(text)] }
}

function cmdPing(_state: ShellState, args: string[]): CommandResult {
  const host = args[0] ?? "localhost"
  return { lines: [mkOut(`PING ${host}: 5 packets transmitted, 5 received, 0% loss, time 4ms`)] }
}

function cmdSsh(_state: ShellState, args: string[]): CommandResult {
  const host = args[0] ?? "host"
  return { lines: [mkOut(`ssh: connect to host ${host} port 22: No route to host (this is a browser)`)] }
}

// ── editor placeholders ──────────────────────────────────────

function cmdEditor(_state: ShellState, args: string[]): CommandResult {
  const file = args[0] ?? ""
  return { lines: [mkOut(`vim: terminal editor not supported. Use: cat ${file} or echo text > ${file}`)] }
}

// ── python ───────────────────────────────────────────────────

function cmdPython(state: ShellState, args: string[]): CommandResult {
  const file = args[0]
  if (!file) return { lines: [mkOut("Python 3.12.4 (use python3 script.py to run a file)"), mkOut(">>> ")] }
  const segs = resolvePath(state.vfs, file)
  if (!segs) return { lines: [mkErr(`python: can't open file '${file}'`)] }
  const node = getNode(state.vfs, segs)
  if (!node || node.kind !== "file") return { lines: [mkErr(`python: can't open file '${file}'`)] }
  return { lines: [mkOut(node.content ?? ""), mkOut(`[python] Output: (see source above)`)] }
}

// ── man ──────────────────────────────────────────────────────

const MAN_PAGES: Record<string, string> = {
  ls: "ls - list directory contents\nUsage: ls [-l] [path]",
  cd: "cd - change directory\nUsage: cd [path]",
  cat: "cat - concatenate files\nUsage: cat <file>",
  grep: "grep - search for patterns\nUsage: grep [-r|-i|-n] pattern file",
  find: "find - search for files\nUsage: find [path] [-name glob]",
  echo: "echo - display a line of text\nUsage: echo text [> file]",
  mkdir: "mkdir - make directories\nUsage: mkdir <dir>",
  rm: "rm - remove files\nUsage: rm [-r] <path>",
  cp: "cp - copy files\nUsage: cp [-r] src dst",
  mv: "mv - move files\nUsage: mv src dst",
  head: "head - output the first part of files\nUsage: head [-n N] file",
  tail: "tail - output the last part of files\nUsage: tail [-n N] file",
  wc: "wc - print newline, word, and byte counts\nUsage: wc [-l|-w|-c] file",
  sort: "sort - sort lines of text files\nUsage: sort file",
  git: "git - the stupid content tracker\nUsage: git <subcommand>",
  curl: "curl - transfer a URL\nUsage: curl [url]",
}

function cmdMan(_state: ShellState, args: string[]): CommandResult {
  const cmd = args[0]
  if (!cmd) return { lines: [mkErr("man: missing argument")] }
  const page = MAN_PAGES[cmd]
  if (!page) return { lines: [mkErr(`No manual entry for ${cmd}`)] }
  return { lines: page.split("\n").map(mkOut) }
}

// ── make ─────────────────────────────────────────────────────

function cmdMake(state: ShellState, args: string[]): CommandResult {
  const target = args.find(a => !a.startsWith("-")) ?? "all"
  const makeSegs = resolvePath(state.vfs, "Makefile")
  if (!makeSegs) return { lines: [mkErr("make: No Makefile found")] }
  const mfSegs = [...state.vfs.cwd, "Makefile"]
  const node = getNode(state.vfs, mfSegs)
  if (!node || node.kind !== "file") return { lines: [mkErr("make: No Makefile found")] }
  return { lines: [mkOut(`make: executing target '${target}'...`), mkOut(node.content ?? "")] }
}

// ── sudo ─────────────────────────────────────────────────────

function cmdSudo(): CommandResult {
  return { lines: [mkOut("sudo: permission denied. Nice try.")] }
}

// ── npm / pip ────────────────────────────────────────────────

function cmdInstall(_state: ShellState, args: string[]): CommandResult {
  const pkg = args.find(a => !a.startsWith("-")) ?? "package"
  return { lines: [mkOut(`Installing ${pkg}...`), mkOut("Added 1 package in 0.3s")] }
}

// ── which / type ──────────────────────────────────────────────

function cmdWhich(args: string[]): CommandResult {
  const cmd = args[0]
  if (!cmd) return { lines: [mkErr("which: missing argument")] }
  const known = cmd in COMMANDS
  return { lines: [known ? mkOut(`/usr/local/bin/${cmd}`) : mkErr(`${cmd} not found`)] }
}

function cmdType(args: string[]): CommandResult {
  const cmd = args[0]
  if (!cmd) return { lines: [mkErr("type: missing argument")] }
  const known = cmd in COMMANDS
  return { lines: [known ? mkOut(`${cmd} is a shell builtin`) : mkErr(`bash: type: ${cmd}: not found`)] }
}

// ── neofetch / misc ───────────────────────────────────────────

const NEOFETCH_LINES = [
  "      .---.         misha@dev",
  "     /     \\        ----------",
  "    |  ( )  |       OS: Portfolio OS 2026",
  "     \\     /        Shell: zsh 5.9",
  "      '---'         Stack: Next.js + Bun",
  "  _____|_|_____     AI: Production",
  " |             |    Projects: ls ~/projects",
  " |_____________|    ",
]

function cmdNeofetch(): CommandResult {
  return { lines: NEOFETCH_LINES.map(mkOut) }
}

function cmdHistory(state: ShellState): CommandResult {
  const lines = state.history.map((cmd, i) => mkOut(`  ${i + 1}  ${cmd}`))
  return { lines }
}

// ── COMMANDS dispatch ─────────────────────────────────────────

const COMMANDS: Record<string, CommandFn> = {
  help: () => cmdHelp(),
  ls: (s, a) => cmdLs(s, a),
  cd: (s, a) => cmdCd(s, a),
  pwd: (s) => cmdPwd(s),
  mkdir: (s, a) => cmdMkdir(s, a),
  touch: (s, a) => cmdTouch(s, a),
  cat: (s, a) => cmdCat(s, a),
  echo: (s, a) => cmdEcho(s, a),
  rm: (s, a) => cmdRm(s, a),
  cp: (s, a) => cmdCp(s, a),
  mv: (s, a) => cmdMv(s, a),
  ln: (s, a) => cmdLn(s, a),
  head: (s, a) => cmdHead(s, a),
  tail: (s, a) => cmdTail(s, a),
  wc: (s, a) => cmdWc(s, a),
  grep: (s, a) => cmdGrep(s, a),
  sort: (s, a) => cmdSort(s, a),
  find: (s, a) => cmdFind(s, a),
  tree: (s, a) => cmdTree(s, a),
  stat: (s, a) => cmdStat(s, a),
  file: (s, a) => cmdFile(s, a),
  env: (s) => cmdEnv(s),
  export: (s, a) => cmdExport(s, a),
  alias: () => cmdAlias(),
  uname: (s, a) => cmdUname(s, a),
  hostname: () => ({ lines: [mkOut("misha-dev")] }),
  uptime: () => ({ lines: [mkOut("18:00:00 up 14 days, 3:47, 1 user, load average: 0.42, 0.38, 0.31")] }),
  df: (s, a) => cmdDf(s, a),
  du: (s, a) => cmdDu(s, a),
  free: () => cmdFree(),
  ps: (s, a) => cmdPs(s, a),
  top: () => cmdTop(),
  git: (s, a) => cmdGit(s, a),
  curl: (s, a) => cmdCurl(s, a),
  ping: (s, a) => cmdPing(s, a),
  ssh: (s, a) => cmdSsh(s, a),
  vim: (s, a) => cmdEditor(s, a),
  vi: (s, a) => cmdEditor(s, a),
  nano: (s, a) => cmdEditor(s, a),
  python: (s, a) => cmdPython(s, a),
  python3: (s, a) => cmdPython(s, a),
  man: (s, a) => cmdMan(s, a),
  make: (s, a) => cmdMake(s, a),
  sudo: () => cmdSudo(),
  npm: (s, a) => cmdInstall(s, a.slice(1)),
  pip: (s, a) => cmdInstall(s, a.slice(1)),
  which: (_s, a) => cmdWhich(a),
  type: (_s, a) => cmdType(a),
  clear: () => ({ lines: [], action: "clear" as const }),
  whoami: () => ({ lines: [mkOut("misha")] }),
  date: () => ({ lines: [mkOut(new Date().toLocaleString())] }),
  neofetch: () => cmdNeofetch(),
  snake: () => ({ lines: [{ text: "Launching snake game...", kind: "output" as const }], action: "snake" as const }),
  history: (s) => cmdHistory(s),
  exit: () => ({ lines: [{ text: "Type 'snake' for a game or click a session tab to continue.", kind: "system" as const }] }),
}

// ── runCommand ────────────────────────────────────────────────

function buildPromptLine(vfs: VfsState, input: string): OutputLine {
  return { text: `misha@dev ${cwdString(vfs)} $ ${input}`, kind: "prompt" }
}

function appendHistory(state: ShellState, input: string): ShellState {
  if (!input.trim()) return state
  return { ...state, history: [...state.history, input], historyIdx: -1 }
}

export function runCommand(
  state: ShellState,
  input: string
): { state: ShellState; lines: OutputLine[]; action?: "clear" | "snake" } {
  const trimmed = input.trim()
  const nextState = appendHistory(state, trimmed)
  const promptLine = buildPromptLine(state.vfs, trimmed)

  if (!trimmed) return { state: nextState, lines: [promptLine] }

  const [cmd, ...args] = trimmed.split(/\s+/)
  const handler = COMMANDS[cmd]

  if (!handler) {
    const errLine = mkErr(`bash: ${cmd}: command not found`)
    return { state: nextState, lines: [promptLine, errLine] }
  }

  const result = handler(nextState, args)
  const finalVfs = result.vfs ?? nextState.vfs
  const finalEnv = result.env ?? nextState.env
  const finalState: ShellState = { ...nextState, vfs: finalVfs, env: finalEnv }
  const lines = result.action === "clear" ? [] : [promptLine, ...result.lines]

  return { state: finalState, lines, action: result.action }
}
