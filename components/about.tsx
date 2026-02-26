import { GraduationCap, BookOpen, Users, Code2, Award, Briefcase } from "lucide-react"
import { AnimatedSection } from "./animated-section"

const highlights = [
  {
    icon: GraduationCap,
    title: "Education",
    subtitle: "UC Berkeley",
    detail: "B.A. Computer Science",
    gradient: "from-primary/10 to-accent/10",
  },
  {
    icon: Briefcase,
    title: "Experience",
    subtitle: "Apple, Walmart, GitHub",
    detail: "Fortune 500 + Startups",
    gradient: "from-accent/10 to-[hsl(180,70%,50%)]/10",
  },
  {
    icon: BookOpen,
    title: "Publications",
    subtitle: "6 Research Papers",
    detail: "Machine Learning & Hydrology",
    gradient: "from-[hsl(180,70%,50%)]/10 to-primary/10",
  },
  {
    icon: Award,
    title: "Recognition",
    subtitle: "100M+ Users Reached",
    detail: "Industry Impact",
    gradient: "from-primary/10 to-[hsl(280,75%,60%)]/10",
  },
  {
    icon: Users,
    title: "Leadership",
    subtitle: "Team Lead & Mentor",
    detail: "Cross-functional Teams",
    gradient: "from-accent/10 to-primary/10",
  },
  {
    icon: Code2,
    title: "Open Source",
    subtitle: "Django Contributor",
    detail: "Community Driven",
    gradient: "from-[hsl(280,75%,60%)]/10 to-accent/10",
  },
]

export function About() {
  return (
    <AnimatedSection id="about" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute right-1/3 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute left-1/3 bottom-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl animate-float" style={{ animationDelay: "4s" }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-16 text-center">
          <span className="inline-block font-mono text-xs uppercase tracking-widest text-primary animate-fade-in">
            About Me
          </span>
          <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl text-balance animate-fade-in-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
            Building at the intersection of{" "}
            <span className="gradient-text">AI and Engineering</span>
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg animate-fade-in-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
            As a Software Engineer and AI/ML Specialist, I architect scalable intelligent systems 
            that blend cutting-edge research with production-grade engineering. My work spans from 
            fine-tuning large language models to building distributed ML pipelines serving millions of users.
          </p>
        </div>

        {/* Bio paragraph */}
        <AnimatedSection delay={200}>
          <div className="group mx-auto mb-16 max-w-4xl overflow-hidden rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:bg-card hover-lift sm:p-8">
            {/* Corner glow */}
            <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-150" />
            <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-accent/10 blur-3xl opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-150" />
            
            <p className="relative text-base leading-relaxed text-foreground">
              With experience at{" "}
              <span className="font-semibold text-primary">Apple</span>,{" "}
              <span className="font-semibold text-primary">Walmart</span>, and{" "}
              <span className="font-semibold text-primary">Lawrence Berkeley National Lab</span>, 
              I've contributed to systems impacting over 100 million users. My expertise ranges from 
              deploying real-time ML inference pipelines to publishing peer-reviewed research in 
              machine learning applications for hydrology and environmental science. I'm passionate 
              about democratizing AI, having co-founded{" "}
              <span className="font-semibold text-primary">Equiverse.ml</span> to improve educational equity 
              for 5,000+ underrepresented students through AI-driven solutions.
            </p>
          </div>
        </AnimatedSection>

        {/* Highlight cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item, i) => (
            <AnimatedSection key={item.title} delay={i * 80}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-sm transition-all duration-500 hover:border-primary/40 hover:bg-card hover-lift">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                
                {/* Corner accent */}
                <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${item.gradient} blur-2xl opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-150`} />
                
                <div className="relative p-6">
                  <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${item.gradient} p-3 ring-1 ring-border transition-all duration-300 group-hover:scale-110 group-hover:ring-2`}>
                    <item.icon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:rotate-12" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm font-medium text-primary">{item.subtitle}</p>
                  <p className="mt-1 text-xs text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                    {item.detail}
                  </p>
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
