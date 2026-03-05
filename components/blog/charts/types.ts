/**
 * ─── Blog Chart JSON Schema ────────────────────────────────────────
 *
 * Define charts as plain JSON inside ```chart code fences in blog posts.
 * The renderer picks the right visual based on `type`.
 *
 * Supported types:
 *   pipeline   — linear chain of steps with optional annotations
 *   comparison — two pipelines side-by-side (before/after, old/new)
 *   pie        — labelled data slices (uses recharts)
 *   tree       — flow with branching / decision points
 */

export type ChartColor =
  | "blue"
  | "green"
  | "red"
  | "amber"
  | "cyan"
  | "purple"
  | "default"

/* ── Pipeline ───────────────────────────────────────────────────── */

export interface PipelineStep {
  label: string
  /** Text shown on the connecting arrow below this step */
  annotation?: string
  color?: ChartColor
}

export interface PipelineChart {
  type: "pipeline"
  title?: string
  steps: PipelineStep[]
}

/* ── Comparison ─────────────────────────────────────────────────── */

export interface ComparisonSide {
  title: string
  color?: ChartColor
  steps: string[]
}

export interface ComparisonChart {
  type: "comparison"
  title?: string
  left: ComparisonSide
  right: ComparisonSide
}

/* ── Pie ────────────────────────────────────────────────────────── */

export interface PieSlice {
  label: string
  value: number
  color?: ChartColor
}

export interface PieChartDef {
  type: "pie"
  title?: string
  data: PieSlice[]
}

/* ── Tree (decision / branching flow) ───────────────────────────── */

export interface TreeBranch {
  /** Label on the branch edge, e.g. "85% No" */
  condition: string
  color?: ChartColor
  steps: string[]
  /** If set, shows a "↩ loops back" indicator to this label */
  loop?: string
}

export interface TreeDecisionNode {
  label: string
  branches: TreeBranch[]
}

export type TreeStep = string | TreeDecisionNode

export interface TreeChart {
  type: "tree"
  title?: string
  color?: ChartColor
  steps: TreeStep[]
}

/* ── Union ──────────────────────────────────────────────────────── */

export type BlogChart =
  | PipelineChart
  | ComparisonChart
  | PieChartDef
  | TreeChart
