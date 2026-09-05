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

/** Text/line colours the upstream embed bakes for its own dark card, which
 *  read as invisible-or-worse once we drop the card onto the site's light
 *  theme (`stripTokscaleBackground` already removed the dark card itself).
 *  It's an <img>, so CSS can't recolor its insides — this is the server-side
 *  swap for the one thing the SVG stays constant on: literal hex/rgba, not
 *  currentColor. Matched by exact literal, not role, since these are the
 *  specific values the embed currently ships. */
export function recolorForLightTheme(svg: string): string {
  return svg
    .replaceAll("#F4F7FB", "#1c2333") // primary text: near-white -> dark
    .replaceAll("#A8B3C5", "#5b6472") // secondary text: light grey -> mid grey
    .replaceAll("#2F8FFF", "#0b63d6") // blue stat: darkened for AA on white
    .replaceAll("#3FB950", "#1e8e3e") // green stat: darkened for AA on white
    .replaceAll("rgba(255,255,255,0.09)", "rgba(0,0,0,0.12)") // divider lines
}
