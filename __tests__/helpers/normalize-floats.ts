/**
 * Round long decimals (4+ fractional digits) to 3 places so SSR markup
 * snapshots survive last-digit Math.sin/cos drift across Node/V8/platforms.
 * Everything else (classes, attributes, text) is compared verbatim.
 */
export const normalizeFloats = (html: string): string =>
  html.replace(/-?\d+\.\d{4,}/g, (n) => Number(n).toFixed(3))
