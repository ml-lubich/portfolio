/** Strip the opaque card chrome from the tokscale embed SVG so the stats can
 *  sit directly on the site's liquid-glass panel. Removes the dark gradient
 *  background rect and the solid border rect; keeps the glow overlay, the
 *  clip-path rect (no fill attribute), and all content. */
export function stripTokscaleBackground(svg: string): string {
  return svg
    .replace(/<rect[^>]*fill="url\(#bg\)"[^>]*\/>\s*/g, "")
    .replace(/<rect[^>]*stroke="#30363D"[^>]*\/>\s*/g, "")
}
