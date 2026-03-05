/**
 * Centralised site configuration.
 *
 * The base URL defaults to https://mishalubich.com but can be
 * overridden via the NEXT_PUBLIC_BASE_URL environment variable.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ??
  "https://mishalubich.com"
