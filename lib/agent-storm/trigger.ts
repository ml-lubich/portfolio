const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"]
const MODIFIERS = new Set(["shift", "control", "alt", "meta", "capslock"])

type Target = { tagName?: string; isContentEditable?: boolean } | null | undefined

function isTyping(t: Target): boolean {
  const tag = t?.tagName?.toUpperCase()
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || !!t?.isContentEditable
}

/** Sequence matcher: a wrong key resets to the longest prefix still matched (so Up,Up,Up,Down... works). */
function matcher(seq: readonly string[]) {
  let typed: string[] = []
  return (key: string): boolean => {
    typed.push(key)
    let k = Math.min(typed.length, seq.length)
    while (k > 0 && !seq.slice(0, k).every((s, j) => s === typed[typed.length - k + j])) k--
    typed = typed.slice(typed.length - k)
    if (k === seq.length) {
      typed = []
      return true
    }
    return false
  }
}

/** Konami code, or a keyword typed outside form fields. press() is true on the firing key. */
export function createTrigger({ keyword, onFire }: { keyword: string; onFire: () => void }) {
  const konami = matcher(KONAMI)
  const word = matcher([...keyword.toLowerCase()])
  return {
    press(rawKey: string, target?: Target): boolean {
      const key = rawKey.toLowerCase()
      if (MODIFIERS.has(key) || isTyping(target)) return false
      const hit = konami(key) || word(key)
      if (hit) onFire()
      return hit
    },
  }
}
