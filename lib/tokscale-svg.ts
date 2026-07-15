/** Strip the opaque card chrome from the tokscale embed SVG so the stats can
 *  sit directly on the site's liquid-glass panel. The upstream embed ships a
 *  full-card background rect + a border ring rect; tokscale periodically changes
 *  their exact colours (e.g. fill="url(#bg)" → fill="#131822", stroke="#30363D"
 *  → stroke="rgba(255,255,255,0.16)"), so match by role, not literal colour:
 *   - background: a <rect> with a solid hex fill or the legacy #bg gradient
 *   - border: a <rect> that only strokes (fill="none" + any stroke)
 *  Keeps every <text>, <line>, gradient-glow overlay, and clip-path rect. */
export function stripTokscaleBackground(svg: string): string {
  return svg
    // Opaque card fill — solid hex (#131822) or the legacy #bg gradient.
    // A gradient glow overlay (fill="url(#glow)") is intentionally NOT matched.
    .replace(/<rect\b[^>]*\bfill="(?:#[0-9a-fA-F]{3,8}|url\(#bg\))"[^>]*\/>\s*/g, "")
    // Border ring — a rect that paints no fill and only strokes (any colour).
    .replace(/<rect\b[^>]*\bfill="none"[^>]*\bstroke="[^"]*"[^>]*\/>\s*/g, "")
    .replace(/<rect\b[^>]*\bstroke="[^"]*"[^>]*\bfill="none"[^>]*\/>\s*/g, "")
}
