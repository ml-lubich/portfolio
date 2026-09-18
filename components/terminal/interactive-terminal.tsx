"use client"

import { useRef, useState, useEffect } from "react"
import { createShellState, runCommand } from "@/lib/shell-interpreter"
import type { OutputLine, ShellState } from "@/lib/shell-interpreter"
import { cwdString, listDir } from "@/lib/virtual-fs"
import { AUTOPILOT_COMMANDS, AUTOPILOT_IDLE_MS } from "@/lib/terminal-autopilot"

interface InteractiveTerminalProps {
  onSnakeMode: () => void
}

const COMMANDS = ["help","ls","cd","pwd","mkdir","touch","cat","echo","rm","clear","whoami","date","neofetch","snake","history"]

const WELCOME: OutputLine[] = [
  { text: "Welcome to misha@dev! Type 'help' for available commands.", kind: "system" }
]

const kindClass: Record<OutputLine["kind"], string> = {
  output: "text-foreground/80 whitespace-pre-wrap",
  error:  "text-rose-400 whitespace-pre-wrap",
  system: "text-muted-foreground/50 italic",
  prompt: "",
}

function PromptLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-emerald-400">❯</span>
      <span>{text}</span>
    </div>
  )
}

function renderLine(line: OutputLine, i: number) {
  if (line.kind === "prompt") return <PromptLine key={i} text={line.text} />
  return <div key={i} className={kindClass[line.kind]}>{line.text}</div>
}

function matchPrefix(candidates: string[], prefix: string) {
  return candidates.filter(c => c.startsWith(prefix))
}

function tabCompleteDirs(state: ShellState, prefix: string): string[] {
  const nodes = listDir(state.vfs, state.vfs.cwd) ?? []
  return matchPrefix(nodes.map(n => n.name), prefix)
}

function applyTabComplete(
  input: string,
  state: ShellState,
  setInput: (v: string) => void,
  appendLines: (lines: OutputLine[]) => void
) {
  const hasSpace = input.includes(" ")
  const prefix = hasSpace ? input.split(" ").pop() ?? "" : input
  const candidates = hasSpace ? tabCompleteDirs(state, prefix) : matchPrefix(COMMANDS, prefix)

  if (candidates.length === 1) {
    setInput(hasSpace ? input.slice(0, input.lastIndexOf(prefix)) + candidates[0] : candidates[0])
  } else if (candidates.length > 1) {
    appendLines([{ text: candidates.join("  "), kind: "system" }])
  }
}

function historyNav(
  direction: "up" | "down",
  shellState: ShellState,
  setShellState: (s: ShellState) => void,
  setInput: (v: string) => void
) {
  const { history, historyIdx } = shellState
  const nextIdx = direction === "up"
    ? Math.max(0, historyIdx - 1)
    : Math.min(history.length, historyIdx + 1)
  const nextInput = history[nextIdx] ?? ""
  setShellState({ ...shellState, historyIdx: nextIdx })
  setInput(nextInput)
}

export default function InteractiveTerminal({ onSnakeMode }: InteractiveTerminalProps) {
  const [shellState, setShellState] = useState<ShellState>(createShellState)
  const [outputLines, setOutputLines] = useState<OutputLine[]>(WELCOME)
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Autopilot: the shell keeps typing on its own while idle, so the prompt is
  // never a dead `❯`. Refs, not state, so the interval closure stays current.
  const stateRef = useRef(shellState)
  stateRef.current = shellState
  const snakeRef = useRef(onSnakeMode)
  snakeRef.current = onSnakeMode
  const lastUserRef = useRef(Date.now())
  const pilotingRef = useRef(false)
  const stepRef = useRef(0)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [outputLines])

  function appendLines(lines: OutputLine[]) {
    setOutputLines(prev => [...prev, ...lines])
  }

  function execute(command: string) {
    const { state: next, lines, action } = runCommand(stateRef.current, command)
    stateRef.current = next
    setShellState(next)
    setInput("")
    if (action === "snake") { snakeRef.current(); return }
    if (action === "clear") { setOutputLines([]); return }
    appendLines(lines)
  }

  function handleEnter() {
    lastUserRef.current = Date.now()
    execute(input)
  }

  useEffect(() => {
    let timer = 0
    const idle = () => Date.now() - lastUserRef.current >= AUTOPILOT_IDLE_MS
    const iv = window.setInterval(() => {
      if (pilotingRef.current || !idle() || document.hidden) return
      pilotingRef.current = true
      const command = AUTOPILOT_COMMANDS[stepRef.current++ % AUTOPILOT_COMMANDS.length]
      let typed = 0
      const step = () => {
        // The visitor touched the keyboard mid-line: hand it back at once.
        if (!idle()) { pilotingRef.current = false; setInput(""); return }
        typed += 1
        setInput(command.slice(0, typed))
        if (typed < command.length) {
          timer = window.setTimeout(step, 38 + Math.random() * 55)
        } else {
          timer = window.setTimeout(() => {
            if (idle()) execute(command)
            pilotingRef.current = false
          }, 320)
        }
      }
      timer = window.setTimeout(step, 240)
    }, 1000)
    return () => { window.clearInterval(iv); window.clearTimeout(timer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const keyHandlers: Record<string, () => void> = {
    Enter:     handleEnter,
    ArrowUp:   () => historyNav("up",   shellState, setShellState, setInput),
    ArrowDown: () => historyNav("down", shellState, setShellState, setInput),
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Tab") {
      e.preventDefault()
      applyTabComplete(input, shellState, setInput, appendLines)
      return
    }
    keyHandlers[e.key]?.()
  }

  return (
    <div onClick={() => inputRef.current?.focus()} className="h-full flex flex-col cursor-text">
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden p-0">
        {outputLines.map((line, i) => renderLine(line, i))}
      </div>
      <div className="flex items-center gap-1 mt-1 shrink-0">
        <span className="text-emerald-400 select-none shrink-0 pointer-events-none">❯</span>
        <span className="text-muted-foreground/60 text-xs shrink-0 pointer-events-none">
          misha@dev {cwdString(shellState.vfs)} $
        </span>
        {/* Cursor display + input overlay — input sits on top so iOS tap registers directly */}
        <div className="relative flex-1 min-w-0 h-5">
          <span className="pointer-events-none text-foreground/90">{input}</span>
          <span className="pointer-events-none animate-[terminal-blink_1s_step-end_infinite] text-emerald-400">▊</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => { lastUserRef.current = Date.now(); setInput(e.target.value) }}
            onKeyDown={e => { lastUserRef.current = Date.now(); handleKeyDown(e) }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-text"
            style={{ fontSize: 16 }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}
