import { z } from "zod"

const chartColor = z.enum([
  "blue",
  "green",
  "red",
  "amber",
  "cyan",
  "purple",
  "default",
])

const pipelineStepSchema = z.object({
  label: z.string(),
  annotation: z.string().optional(),
  color: chartColor.optional(),
})

const pipelineChartSchema = z.object({
  type: z.literal("pipeline"),
  title: z.string().optional(),
  steps: z.array(pipelineStepSchema),
})

const comparisonSideSchema = z.object({
  title: z.string(),
  color: chartColor.optional(),
  steps: z.array(z.string()),
})

const comparisonChartSchema = z.object({
  type: z.literal("comparison"),
  title: z.string().optional(),
  left: comparisonSideSchema,
  right: comparisonSideSchema,
})

const pieSliceSchema = z.object({
  label: z.string(),
  value: z.number(),
  color: chartColor.optional(),
})

const pieChartSchema = z.object({
  type: z.literal("pie"),
  title: z.string().optional(),
  data: z.array(pieSliceSchema),
})

const treeBranchSchema = z.object({
  condition: z.string(),
  color: chartColor.optional(),
  steps: z.array(z.string()),
  loop: z.string().optional(),
})

const treeDecisionNodeSchema = z.object({
  label: z.string(),
  branches: z.array(treeBranchSchema),
})

const treeStepSchema = z.union([z.string(), treeDecisionNodeSchema])

const treeChartSchema = z.object({
  type: z.literal("tree"),
  title: z.string().optional(),
  color: chartColor.optional(),
  steps: z.array(treeStepSchema),
})

export const blogChartSchema = z.discriminatedUnion("type", [
  pipelineChartSchema,
  comparisonChartSchema,
  pieChartSchema,
  treeChartSchema,
])

export type ParsedBlogChart = z.infer<typeof blogChartSchema>

export type ValidateBlogChartResult =
  | { ok: true; chart: ParsedBlogChart }
  | { ok: false; error: string }

export function validateBlogChartJsonString(body: string): ValidateBlogChartResult {
  let raw: unknown
  try {
    raw = JSON.parse(body) as unknown
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, error: `Invalid JSON: ${msg}` }
  }
  const parsed = blogChartSchema.safeParse(raw)
  if (!parsed.success) {
    const flat = parsed.error.flatten()
    const formErrors = flat.formErrors.join("; ")
    const fieldErrors = Object.entries(flat.fieldErrors)
      .map(([k, v]) => `${k}: ${(v ?? []).join(", ")}`)
      .join("; ")
    const detail = [formErrors, fieldErrors].filter(Boolean).join(" | ")
    return { ok: false, error: detail || parsed.error.message }
  }
  return { ok: true, chart: parsed.data }
}
