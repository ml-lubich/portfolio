"use client"

import { useRef, useState, useEffect } from "react"
import { createShellState, runCommand } from "@/lib/shell-interpreter"
import type { OutputLine, ShellState } from "@/lib/shell-interpreter"
import { cwdString, listDir } from "@/lib/virtual-fs"

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [outputLines])

  function appendLines(lines: OutputLine[]) {
    setOutputLines(prev => [...prev, ...lines])
  }

  function handleEnter() {
    const { state: next, lines, action } = runCommand(shellState, input)
    setShellState(next)
    setInput("")
    if (action === "snake") { onSnakeMode(); return }
    if (action === "clear") { setOutputLines([]); return }
    appendLines(lines)
  }

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
        <span className="text-emerald-400 select-none shrink-0">❯</span>
        <span className="text-muted-foreground/60 text-xs shrink-0">
          misha@dev {cwdString(shellState.vfs)} $
        </span>
        <div className="relative flex-1 min-w-0">
          <span className="text-foreground/90">{input}</span>
          <span className="animate-[terminal-blink_1s_step-end_infinite] text-emerald-400">▊</span>
        </div>
      </div>
      <input
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 }}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-hidden="true"
      />
    </div>
  )
}
