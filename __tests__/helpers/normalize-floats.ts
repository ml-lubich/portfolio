import fs from "node:fs"
import path from "node:path"

/**
 * Stabilize SSR snapshots against floating-point drift and private identity
 * strings. Snapshots cover markup, not names or outbound destinations.
 */
export const normalizeFloats = (html: string): string => {
  let normalized = html.replace(/-?\d+\.\d{4,}/g, (n) => Number(n).toFixed(3))

  // Derive identity values from rendered markup instead of duplicating them
  // in test code or checked-in snapshots. Only redact personal domains and
  // the profile's GitHub owner; unrelated destinations stay testable.
  const profileName =
    html.match(/alt="([^"]+?) at his desk"/i)?.[1] ??
    fs.readFileSync(path.resolve(process.cwd(), "components/sections/about.tsx"), "utf8")
      .match(/alt="([^"]+?) at his desk"/i)?.[1]
  const repositoryOwner = html.match(/https?:\/\/github\.com\/([^/\s"'<>]+)/i)?.[1]
  const personMarker = "\uE000"
  const ownerMarker = "\uE001"
  const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

  if (repositoryOwner) {
    normalized = normalized.replace(new RegExp(escape(repositoryOwner), "gi"), ownerMarker)
  }

  const identityParts = profileName?.trim().split(/\s+/).map((part) => part.toLowerCase()) ?? []
  const identityForms = [
    ...identityParts,
    identityParts.join(""),
    identityParts.length > 1 ? `${identityParts[0][0]}${identityParts.slice(1).join("")}` : "",
  ].filter(Boolean)
  const isPersonal = (value: string) => identityForms.some((part) => value.toLowerCase().includes(part))
  normalized = normalized
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, (email) =>
      isPersonal(email) ? "[EMAIL]" : email,
    )
    .replace(/\b(?:https?:\/\/|www\.)[^\s"'<>]+/gi, (url) => {
      const host = url.match(/^(?:https?:\/\/|www\.)([^/:?#]+)/i)?.[1]
      return host && isPersonal(host) ? url.replace(host, "[DOMAIN]") : url
    })
    .replace(/\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi, (domain) =>
      isPersonal(domain) ? "[DOMAIN]" : domain,
    )

  if (profileName) {
    for (const form of [profileName, ...identityForms]) {
      normalized = normalized.replace(new RegExp(`(?<![a-z0-9])${escape(form)}(?![a-z0-9])`, "gi"), personMarker)
    }
  }

  return normalized.replaceAll(personMarker, "[PERSON]").replaceAll(ownerMarker, "[OWNER]")
}
