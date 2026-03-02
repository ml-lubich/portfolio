/* ══════════════════════════════════════════════════════════════════════
 *  Architecture Diagram configs — each diagram type has positioned
 *  nodes and edges that render as an animated SVG graph.
 * ══════════════════════════════════════════════════════════════════════ */

export interface DiagramNode {
  label: string
  x: number
  y: number
  size?: "sm" | "md" | "lg"
}

export interface DiagramConfig {
  nodes: DiagramNode[]
  edges: [number, number][]
}

export const diagramConfigs: Record<string, DiagramConfig> = {
  pipeline: {
    nodes: [
      { label: "Input", x: 10, y: 50, size: "sm" },
      { label: "Transform", x: 30, y: 30, size: "md" },
      { label: "Validate", x: 30, y: 70, size: "md" },
      { label: "Process", x: 55, y: 50, size: "lg" },
      { label: "Cache", x: 75, y: 30, size: "sm" },
      { label: "Output", x: 90, y: 50, size: "sm" },
    ],
    edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 5]],
  },
  microservices: {
    nodes: [
      { label: "API Gateway", x: 50, y: 10, size: "lg" },
      { label: "Auth", x: 15, y: 35, size: "md" },
      { label: "Users", x: 40, y: 40, size: "md" },
      { label: "Orders", x: 65, y: 40, size: "md" },
      { label: "Events", x: 85, y: 35, size: "sm" },
      { label: "DB", x: 25, y: 70, size: "sm" },
      { label: "Cache", x: 50, y: 75, size: "sm" },
      { label: "Queue", x: 75, y: 70, size: "sm" },
    ],
    edges: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [2, 5], [2, 6], [3, 6], [3, 7], [4, 7]],
  },
  "ml-pipeline": {
    nodes: [
      { label: "Data Lake", x: 10, y: 50, size: "md" },
      { label: "Feature Eng", x: 30, y: 30, size: "md" },
      { label: "Training", x: 50, y: 50, size: "lg" },
      { label: "Evaluation", x: 70, y: 30, size: "md" },
      { label: "Registry", x: 70, y: 70, size: "sm" },
      { label: "Serving", x: 90, y: 50, size: "md" },
    ],
    edges: [[0, 1], [1, 2], [2, 3], [2, 4], [3, 5], [4, 5], [3, 2]],
  },
  fullstack: {
    nodes: [
      { label: "Client", x: 50, y: 8, size: "lg" },
      { label: "CDN", x: 15, y: 30, size: "sm" },
      { label: "Next.js", x: 50, y: 35, size: "lg" },
      { label: "API", x: 85, y: 30, size: "md" },
      { label: "Auth", x: 20, y: 60, size: "sm" },
      { label: "DB", x: 50, y: 65, size: "md" },
      { label: "Storage", x: 80, y: 60, size: "sm" },
      { label: "Workers", x: 50, y: 90, size: "sm" },
    ],
    edges: [[0, 1], [0, 2], [0, 3], [2, 4], [2, 5], [2, 6], [3, 5], [5, 7]],
  },
  agents: {
    nodes: [
      { label: "Orchestrator", x: 50, y: 15, size: "lg" },
      { label: "Planner", x: 20, y: 40, size: "md" },
      { label: "Researcher", x: 50, y: 45, size: "md" },
      { label: "Writer", x: 80, y: 40, size: "md" },
      { label: "Tools / MCP", x: 15, y: 70, size: "sm" },
      { label: "Vector DB", x: 50, y: 75, size: "sm" },
      { label: "Critic", x: 85, y: 70, size: "sm" },
    ],
    edges: [[0, 1], [0, 2], [0, 3], [1, 4], [2, 5], [3, 6], [6, 0], [1, 2], [2, 3]],
  },
  cicd: {
    nodes: [
      { label: "Push", x: 8, y: 50, size: "sm" },
      { label: "Build", x: 25, y: 30, size: "md" },
      { label: "Lint", x: 25, y: 70, size: "sm" },
      { label: "Test", x: 45, y: 50, size: "md" },
      { label: "Security", x: 62, y: 30, size: "sm" },
      { label: "Stage", x: 75, y: 50, size: "md" },
      { label: "Deploy", x: 92, y: 50, size: "sm" },
    ],
    edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 5], [5, 6]],
  },
}
