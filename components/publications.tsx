import { BookOpen, ExternalLink } from "lucide-react"
import { AnimatedSection } from "./animated-section"

const papers = [
  {
    title: "Stream temperature predictions for river basin management in the Pacific Northwest and mid-Atlantic regions using machine learning",
    type: "Journal Article",
    year: "2022",
    venue: "Water, MDPI",
    detail: "Volume 14, Issue 7, Pages 1032",
    tags: ["Machine Learning", "Hydrology", "Stream Temperature"],
  },
  {
    title: "Classical Machine Learning for Widespread Stream Temperature Predictions: Demonstrations in the Pacific Northwest and Mid Atlantic Regions",
    type: "Conference Abstract",
    year: "2022",
    venue: "AGU Fall Meeting Abstracts",
    detail: "Volume 2022, Pages H12E-04",
    tags: ["Machine Learning", "Spatial Modeling"],
  },
  {
    title: "Multiscale Effects of Climate-driven Disturbances on River Water Quality",
    type: "Journal Article",
    year: "2022",
    venue: "Frontiers in Hydrology",
    detail: "Pages 152-01",
    tags: ["Climate Change", "Water Quality", "Environmental Science"],
  },
  {
    title: "Investigating the Impacts of Climate-driven Disturbances on River Water Quality using Machine Learning and Statistical Modeling Approaches",
    type: "Conference Abstract",
    year: "2021",
    venue: "AGU Fall Meeting Abstracts",
    detail: "Volume 2021, Pages H22E-01",
    tags: ["Machine Learning", "Statistical Modeling"],
  },
  {
    title: "Data-Model Integration and Machine Learning Approaches for Hydrobiogeochemical Modeling Applications",
    type: "Conference Abstract",
    year: "2021",
    venue: "AGU Fall Meeting Abstracts",
    detail: "Volume 2021, Pages B15J-1551",
    tags: ["Data Integration", "Biogeochemistry"],
  },
  {
    title: "Predicting Stream Temperature Across Spatial Scales With Low Complexity ML",
    type: "Conference Abstract",
    year: "2021",
    venue: "AGU Fall Meeting Abstracts",
    detail: "Volume 2021, Pages H35D-1070",
    tags: ["Machine Learning", "Spatial Scales"],
  },
]

export function Publications() {
  return (
    <AnimatedSection id="research" className="py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6">
        {/* Section header */}
        <div className="mb-16 text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            Research Publications
          </span>
          <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl text-balance">
            Contributing to{" "}
            <span className="gradient-text">ML & environmental science</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Research focus on machine learning applications in hydrology and environmental science
          </p>
        </div>

        {/* Papers list */}
        <div className="flex flex-col gap-4">
          {papers.map((paper, i) => (
            <AnimatedSection key={paper.title} delay={i * 80}>
              <div className="group rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:glow-blue sm:p-6">
                <div className="flex gap-4">
                  <div className="hidden shrink-0 items-start sm:flex">
                    <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-sm font-semibold leading-snug text-foreground sm:text-base">
                        {paper.title}
                      </h3>
                      <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 font-medium text-primary">
                        {paper.type}
                      </span>
                      <span>{paper.year}</span>
                      <span className="hidden sm:inline">{"/"}</span>
                      <span className="hidden sm:inline">{paper.venue}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{paper.detail}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {paper.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Google Scholar link */}
        <AnimatedSection delay={600} className="mt-8 text-center">
          <a
            href="https://scholar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
          >
            View Google Scholar Profile
            <ExternalLink className="h-4 w-4" />
          </a>
        </AnimatedSection>
      </div>
    </AnimatedSection>
  )
}
