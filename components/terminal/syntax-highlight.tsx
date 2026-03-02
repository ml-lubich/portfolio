import React from "react"

/* ════════════════════ SYNTAX HIGHLIGHTER ═════════════════════ */

const KW = /\b(class|def|async|await|for|if|return|import|from|self|None|True|False|export|function|const|let|yield|type|interface)\b/g
const STR = /(["'`])(?:(?=(\\?))\2.)*?\1/g
const CMT = /#.*/g
const NUM = /\b\d[\d_.]*\b/g
const TYP = /\b(str|int|float|bool|list|dict|Task|Result|PullRequest|ReviewResult|BaseAgent|ModelConfig|Token|AsyncGenerator|Action|AgentSpec|RunningAgent|Record|BaseTransform|ReActAgent)\b/g

export function highlight(text: string): React.JSX.Element {
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
