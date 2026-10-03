/**
 * Prefix of `html` covering about `fraction` of it, cut only at the end of a tag
 * that sits outside <script>/<style> (so the iframe never sees half a tag or a
 * half-written script, which would throw).
 */
export function revealSlice(html: string, fraction: number): string {
  if (!(fraction > 0)) return ""
  if (fraction >= 1) return html
  const target = Math.floor(html.length * fraction)
  let best = 0
  const re = /<(script|style)\b[^>]*>[\s\S]*?<\/\1>|<[^>]*>/gi
  for (let m = re.exec(html); m; m = re.exec(html)) {
    const end = m.index + m[0].length
    if (end > target) break
    best = end
  }
  return html.slice(0, best)
}
