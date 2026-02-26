import { AnimatedSection } from "./animated-section"

const skillCategories = [
  {
    category: "Languages",
    items: ["Python", "TypeScript", "Rust", "Go", "Java", "JavaScript", "SQL", "Bash"],
  },
  {
    category: "AI/ML & Frameworks",
    items: ["PyTorch", "TensorFlow", "Transformers", "LangChain", "Next.js 16", "React 19", "FastAPI", "tRPC"],
  },
  {
    category: "Cloud & DevOps",
    items: ["AWS EC2", "AWS S3", "AWS Lambda", "SageMaker", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "GitHub Actions"],
  },
  {
    category: "Databases & Tools",
    items: ["PostgreSQL", "Redis", "MongoDB", "Pinecone", "Supabase", "Prisma", "Drizzle", "GraphQL"],
  },
  {
    category: "Methodologies",
    items: ["MLOps", "CI/CD", "Agile/Scrum", "TDD", "Infrastructure as Code", "Site Reliability Engineering"],
  },
  {
    category: "Leadership & Soft Skills",
    items: ["Team Leadership", "Mentorship", "Strategic Planning", "Public Speaking", "Technical Documentation"],
  },
]

export function Skills() {
  return (
    <AnimatedSection id="skills" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-16 text-center">
          <span className="inline-block font-mono text-xs uppercase tracking-widest text-primary animate-fade-in">
            Technical Skills
          </span>
          <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl text-balance animate-fade-in-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
            Comprehensive expertise across the{" "}
            <span className="gradient-text">full technology stack</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
            Deep proficiency in modern AI/ML frameworks, cloud infrastructure, and full-stack development 
            with a focus on building production-grade scalable systems.
          </p>
        </div>

        {/* Skills grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skillCategories.map((cat, i) => (
            <AnimatedSection key={cat.category} delay={i * 80}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 transition-all duration-500 hover:border-primary/40 hover:bg-card hover-lift">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-accent/0 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:from-primary/5 group-hover:via-accent/5 group-hover:to-primary/5 group-hover:opacity-100" />
                
                {/* Animated corner accent */}
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-150" />
                
                <div className="relative">
                  <h3 className="mb-5 text-base font-bold text-foreground transition-colors group-hover:text-primary sm:text-lg">
                    {cat.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((item, idx) => (
                      <span
                        key={item}
                        className="group/tag rounded-lg border border-border bg-secondary/50 px-3 py-1.5 font-mono text-xs text-muted-foreground transition-all duration-300 hover:scale-105 hover:border-primary/40 hover:bg-secondary hover:text-foreground hover:shadow-md hover:shadow-primary/10 animate-slide-up"
                        style={{ animationDelay: `${idx * 50}ms`, opacity: 0 }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Shimmer effect */}
                <div className="absolute inset-0 shimmer opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
