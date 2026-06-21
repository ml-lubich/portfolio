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
} from "@/lib/virtual-fs"

export interface OutputLine {
  text: string
  kind: "output" | "error" | "system" | "prompt"
}

export interface ShellState {
  vfs: VfsState
  history: string[]
  historyIdx: number
}

export function createShellState(): ShellState {
  return { vfs: createVfs(), history: [], historyIdx: -1 }
}

type CommandResult = { lines: OutputLine[]; vfs?: VfsState; action?: "clear" | "snake" }
type CommandFn = (state: ShellState, args: string[]) => CommandResult

function mkOut(text: string): OutputLine { return { text, kind: "output" } }
function mkErr(text: string): OutputLine { return { text, kind: "error" } }

function cmdHelp(): CommandResult {
  const lines = [
    "help      show this help",
    "ls        list directory contents (-l for long format)",
    "cd        change directory (bare cd goes to /home/misha)",
    "pwd       print working directory",
    "mkdir     create directory",
    "touch     create empty file",
    "cat       print file contents",
    "echo      print text or redirect to file (echo text > file)",
    "rm        remove file or directory (-r for recursive)",
    "clear     clear the terminal",
    "whoami    print current user",
    "date      print current date and time",
    "neofetch  system information",
    "snake     launch snake game",
    "history   show command history",
  ].map(mkOut)
  return { lines }
}

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

function cmdCd(state: ShellState, args: string[]): CommandResult {
  const target = args[0] ?? "/home/misha"
  const segs = resolvePath(state.vfs, target)
  if (!segs) return { lines: [mkErr(`cd: no such file or directory: ${target}`)] }
  const node = getNode(state.vfs, segs)
  if (!node || node.kind !== "dir") return { lines: [mkErr(`cd: not a directory: ${target}`)] }
  return { lines: [], vfs: { ...state.vfs, cwd: segs } }
}

function cmdPwd(state: ShellState): CommandResult {
  return { lines: [mkOut(cwdString(state.vfs))] }
}

function cmdMkdir(state: ShellState, args: string[]): CommandResult {
  if (!args[0]) return { lines: [mkErr("mkdir: missing operand")] }
  const segs = resolvePath(state.vfs, args[0])
  if (!segs) return { lines: [mkErr(`mkdir: invalid path: ${args[0]}`)] }
  const result = mkdirNode(state.vfs, segs)
  if (typeof result === "string") return { lines: [mkErr(`mkdir: ${result}`)] }
  return { lines: [], vfs: result }
}

function cmdTouch(state: ShellState, args: string[]): CommandResult {
  if (!args[0]) return { lines: [mkErr("touch: missing file operand")] }
  const segs = resolvePath(state.vfs, args[0])
  if (!segs) return { lines: [mkErr(`touch: invalid path: ${args[0]}`)] }
  const result = touchNode(state.vfs, segs)
  if (typeof result === "string") return { lines: [mkErr(`touch: ${result}`)] }
  return { lines: [], vfs: result }
}

function cmdCat(state: ShellState, args: string[]): CommandResult {
  if (!args[0]) return { lines: [mkErr("cat: missing file operand")] }
  const segs = resolvePath(state.vfs, args[0])
  if (!segs) return { lines: [mkErr(`cat: ${args[0]}: No such file or directory`)] }
  const node = getNode(state.vfs, segs)
  if (!node) return { lines: [mkErr(`cat: ${args[0]}: No such file or directory`)] }
  if (node.kind !== "file") return { lines: [mkErr(`cat: ${args[0]}: Is a directory`)] }
  return { lines: [mkOut(node.content ?? "")] }
}

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

const COMMANDS: Record<string, CommandFn> = {
  help: (s) => cmdHelp(),
  ls: (s, a) => cmdLs(s, a),
  cd: (s, a) => cmdCd(s, a),
  pwd: (s) => cmdPwd(s),
  mkdir: (s, a) => cmdMkdir(s, a),
  touch: (s, a) => cmdTouch(s, a),
  cat: (s, a) => cmdCat(s, a),
  echo: (s, a) => cmdEcho(s, a),
  rm: (s, a) => cmdRm(s, a),
  clear: () => ({ lines: [], action: "clear" as const }),
  whoami: () => ({ lines: [mkOut("misha")] }),
  date: () => ({ lines: [mkOut(new Date().toLocaleString())] }),
  neofetch: () => cmdNeofetch(),
  snake: () => ({ lines: [{ text: "Launching snake game...", kind: "output" }], action: "snake" as const }),
  history: (s) => cmdHistory(s),
}

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
  const finalState: ShellState = { ...nextState, vfs: finalVfs }
  const lines = result.action === "clear" ? [] : [promptLine, ...result.lines]

  return { state: finalState, lines, action: result.action }
}
