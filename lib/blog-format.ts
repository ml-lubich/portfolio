const BLOG_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/u

const BLOG_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
})

interface BlogDateParts {
  year: number
  monthIndex: number
  day: number
}

function parseBlogDate(date: string): BlogDateParts {
  const match = BLOG_DATE_PATTERN.exec(date)
  if (!match) {
    throw new Error(
      `Blog date "${date}" must use YYYY-MM-DD so server and browser text stays deterministic.`
    )
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const time = Date.UTC(year, month - 1, day)
  const parsed = new Date(time)

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error(`Blog date "${date}" is not a valid calendar date.`)
  }

  return { year, monthIndex: month - 1, day }
}

export function getBlogDateEpochMs(date: string): number {
  const parts = parseBlogDate(date)
  return Date.UTC(parts.year, parts.monthIndex, parts.day)
}

export function getBlogDateYear(date: string): number {
  return parseBlogDate(date).year
}

export function formatBlogDate(date: string): string {
  const trimmedDate = date.trim()
  const timestamp = BLOG_DATE_PATTERN.test(trimmedDate)
    ? getBlogDateEpochMs(trimmedDate)
    : Date.parse(trimmedDate)

  if (Number.isNaN(timestamp)) {
    throw new Error(`Cannot format blog date "${date}" because it is not a valid date.`)
  }

  return BLOG_DATE_FORMATTER.format(timestamp)
}

export function formatBlogDateUtc(date: string): string {
  return new Date(getBlogDateEpochMs(date)).toUTCString()
}