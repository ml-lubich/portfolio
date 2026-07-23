/* ── Hero section constants & data ─────────────────────────────────── */

export const statSets = [
  [
    { value: "100M+", label: "Users Impacted" },
    { value: "6", label: "Research Papers" },
    { value: "150%", label: "ML Performance Gains" },
    { value: "5+", label: "Years Experience" },
  ],
  [
    { value: "2", label: "Apple & Walmart" },
    { value: "15+", label: "ML Models Deployed" },
    { value: "99.5%", label: "System Uptime" },
    { value: "5x", label: "Cost Reduction" },
  ],
  [
    { value: "4", label: "Active Client Brands" },
    { value: "965", label: "Recruiting Roles Indexed" },
    { value: "21", label: "Event Stories Rebuilt" },
    { value: "320+", label: "Enrichment Fields Live" },
  ],
  [
    { value: "5K+", label: "Students Reached" },
    { value: "1.5K+", label: "Startup Users" },
    { value: "25%", label: "Hiring Bias Reduced" },
    { value: "8", label: "Engineers Led" },
  ],
]

export const roles = [
  "AI Engineering Consultant",
  "Senior Software Engineer",
  "Agent Systems Architect",
  "Applied Machine Learning Engineer",
  "Technical Product Partner",
]

/** ms between stat set changes */
export const STAT_ROTATE_INTERVAL = 5500

/** ms stagger between each card's animation */
export const STAT_STAGGER_DELAY = 120
