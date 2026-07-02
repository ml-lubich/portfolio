import { NextResponse } from "next/server"

export const revalidate = 3600

const GITHUB_USERNAME = "ml-lubich"
const GITHUB_API_BASE = "https://api.github.com/users/" + GITHUB_USERNAME
const CONTRIBUTIONS_API = "https://github-contributions-api.jogruber.de/v4/" + GITHUB_USERNAME + "?y=all"

/* ── Trimmed response shapes ─────────────────────────────────── */
interface GitHubUser {
  public_repos: number
  followers: number
  following: number
  created_at: string
  avatar_url: string
  bio: string | null
  name: string | null
  login: string
}

interface GitHubRepo {
  name: string
  full_name: string
  html_url: string
  description: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
  updated_at: string
  fork: boolean
  topics: string[]
  size: number
}

interface GitHubEvent {
  type: string
  created_at: string
  commitCount: number
}

interface ContributionDay {
  date: string
  count: number
  level: number
}

interface ContributionsPayload {
  total: Record<string, number>
  contributions: ContributionDay[]
}

/* ── Boundary parsing helpers (unknown -> typed, no `any`) ──── */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function strField(r: Record<string, unknown>, key: string): string {
  const v = r[key]
  return typeof v === "string" ? v : ""
}

function strOrNull(r: Record<string, unknown>, key: string): string | null {
  const v = r[key]
  return typeof v === "string" ? v : null
}

function numField(r: Record<string, unknown>, key: string): number {
  const v = r[key]
  return typeof v === "number" ? v : 0
}

function strArrField(r: Record<string, unknown>, key: string): string[] {
  const v = r[key]
  return Array.isArray(v) ? v.filter((t): t is string => typeof t === "string") : []
}

/* ── GitHub upstream calls ───────────────────────────────────── */
function ghHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// Network-level rejections (DNS, timeout) become a failed Response so one
// flaky upstream can't reject the whole Promise.all — only user/repos being
// down is fatal (502); everything else degrades.
function fetchGh(url: string): Promise<Response> {
  return fetch(url, { headers: ghHeaders(), next: { revalidate: 3600 } }).catch(() => Response.error())
}

function fetchContrib(): Promise<Response> {
  return fetch(CONTRIBUTIONS_API, { next: { revalidate: 3600 } }).catch(() => Response.error())
}

/* ── Trimming ─────────────────────────────────────────────────── */
function toUser(raw: unknown): GitHubUser {
  const r = isRecord(raw) ? raw : {}
  return {
    public_repos: numField(r, "public_repos"),
    followers: numField(r, "followers"),
    following: numField(r, "following"),
    created_at: strField(r, "created_at"),
    avatar_url: strField(r, "avatar_url"),
    bio: strOrNull(r, "bio"),
    name: strOrNull(r, "name"),
    login: strField(r, "login"),
  }
}

function toRepo(r: Record<string, unknown>): GitHubRepo {
  return {
    name: strField(r, "name"),
    full_name: strField(r, "full_name"),
    html_url: strField(r, "html_url"),
    description: strOrNull(r, "description"),
    stargazers_count: numField(r, "stargazers_count"),
    forks_count: numField(r, "forks_count"),
    language: strOrNull(r, "language"),
    updated_at: strField(r, "updated_at"),
    fork: r.fork === true,
    topics: strArrField(r, "topics"),
    size: numField(r, "size"),
  }
}

function toRepos(raw: unknown): GitHubRepo[] {
  if (!Array.isArray(raw)) return []
  const repos: GitHubRepo[] = []
  for (const item of raw) {
    if (isRecord(item)) repos.push(toRepo(item))
  }
  return repos
}

function toEvent(r: Record<string, unknown>): GitHubEvent {
  const payload = isRecord(r.payload) ? r.payload : null
  const commits = payload && Array.isArray(payload.commits) ? payload.commits : []
  return {
    type: strField(r, "type"),
    created_at: strField(r, "created_at"),
    commitCount: commits.length,
  }
}

function toEvents(raw: unknown): GitHubEvent[] {
  if (!Array.isArray(raw)) return []
  const events: GitHubEvent[] = []
  for (const item of raw) {
    if (isRecord(item)) events.push(toEvent(item))
  }
  return events
}

function toContributions(raw: unknown): ContributionsPayload | null {
  if (!isRecord(raw) || !isRecord(raw.total) || !Array.isArray(raw.contributions)) return null
  const total: Record<string, number> = {}
  for (const [key, value] of Object.entries(raw.total)) {
    if (typeof value === "number") total[key] = value
  }
  const contributions: ContributionDay[] = []
  for (const item of raw.contributions) {
    if (isRecord(item)) contributions.push({ date: strField(item, "date"), count: numField(item, "count"), level: numField(item, "level") })
  }
  return { total, contributions }
}

/* ── Events: pages that fail are skipped, not fatal ──────────── */
async function collectEvents(pages: Response[]): Promise<GitHubEvent[]> {
  const events: GitHubEvent[] = []
  for (const res of pages) {
    if (res.ok) events.push(...toEvents(await res.json()))
  }
  return events
}

export async function GET() {
  try {
    const [userRes, reposRes, contribRes, ev1, ev2, ev3] = await Promise.all([
      fetchGh(GITHUB_API_BASE),
      fetchGh(GITHUB_API_BASE + "/repos?per_page=100&sort=updated"),
      fetchContrib(),
      fetchGh(GITHUB_API_BASE + "/events?per_page=100&page=1"),
      fetchGh(GITHUB_API_BASE + "/events?per_page=100&page=2"),
      fetchGh(GITHUB_API_BASE + "/events?per_page=100&page=3"),
    ])

    if (!userRes.ok || !reposRes.ok) {
      return NextResponse.json({ error: "github upstream unavailable" }, { status: 502 })
    }

    const user = toUser(await userRes.json())
    const repos = toRepos(await reposRes.json())
    const events = await collectEvents([ev1, ev2, ev3])
    const contributions = contribRes.ok ? toContributions(await contribRes.json()) : null

    return NextResponse.json(
      { user, repos, events, contributions },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    )
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 500 })
  }
}
