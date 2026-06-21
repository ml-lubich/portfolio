# Interactive Terminal + Snake Integration Plan

## What We Are Building

A fully interactive in-browser shell terminal that lives alongside the existing
"Day in the Life" playback terminal. Visitors can type real commands against a
virtual file system. The existing `LiveTerminal` (day-in-the-life playback) and
`SnakeTerminal` are preserved unchanged.

## Will NOT Change

- `components/terminal/session-data.ts` — live playback sessions, read-only
- `components/terminal/snake-terminal.tsx` — snake game component
- `lib/snake-game.ts` — snake engine
- Any blog, nav, hero, or llm-prices code
- Existing tests

## New Files

| File | Purpose |
|------|---------|
| `lib/virtual-fs.ts` | In-memory VFS tree: nodes, path ops, CRUD |
| `lib/shell-interpreter.ts` | Command dispatch: ls, cd, mkdir, cat, echo, touch, rm, pwd, clear, help, whoami, date, neofetch, snake, history |
| `components/terminal/interactive-terminal.tsx` | REPL UI: input line, output history, scroll, cursor |
| `__tests__/interactive-terminal.test.ts` | Unit tests for VFS + interpreter |

## Changed Files

| File | Change |
|------|--------|
| `components/terminal/index.tsx` | Add `"shell"` TerminalMode; add shell tab button; render `<InteractiveTerminal>` |
| `docs/ARCHITECTURE.md` | Add interactive terminal section |
| `docs/CHANGELOG.md` | Add [Unreleased] entries |
| `VERSION` | Bump minor |

## VFS Initial Structure

```
/
├── home/
│   └── misha/            ← cwd on start
│       ├── projects/
│       │   ├── agents/
│       │   │   └── README.md   "Multi-agent orchestration system"
│       │   └── rag-system/
│       │       └── config.yaml "model: llama-4\nchunks: 512"
│       ├── .bashrc             "# Misha's shell config\nexport PS1='misha@dev $ '"
│       └── welcome.txt         welcome message
└── etc/
    └── motd                    "Welcome to misha@dev"
```

## Commands

- `help` — list commands
- `ls [-l] [path]` — list directory
- `cd [path]` — change directory, `cd` alone goes to home
- `pwd` — print working directory
- `mkdir <dir>` — create directory
- `touch <file>` — create empty file
- `cat <file>` — print file contents
- `echo <text> [> <file>]` — print or write to file
- `rm [-r] <path>` — remove file or directory
- `clear` — clear output
- `whoami` — print "misha"
- `date` — current date/time
- `neofetch` — ASCII art system info easter egg
- `snake` — switch terminal to snake mode
- `history` — show command history

## UI Design

- Same terminal chrome as the existing `LiveTerminal`
- Green prompt: `misha@dev ~/home/misha $`
- Input line at bottom with blinking cursor
- Output scrolls up
- Tab completion for commands and file paths
- Up/down arrow for history navigation
- Focus captured on click

## Drift Risks

- `components/terminal/index.tsx` height logic — new "shell" mode needs its own
  height like snake mode does currently
- Tab completion must not prevent browser focus traps

## Verification Plan

```bash
bun run test   # must include new interactive-terminal tests
bun run build  # full CI gate
```
