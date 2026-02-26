"use client"

import { Briefcase, MapPin } from "lucide-react"
import { ScrollStackCards } from "./scroll-stack-cards"

const experiences = [
  {
    title: "Software Development Engineer in Test & Developer",
    company: "Polaris Wireless",
    period: "September 2024 - Present",
    location: "San Francisco, CA",
    bullets: [
      "Engineered robust CI/CD pipelines using Jenkins, reducing deployment time by 50%",
      "Led and mentored a cross-functional team of 4 engineers across QA, DevOps, and backend",
      "Designed scalable data ingestion pipelines processing over 10 million records daily",
    ],
    tags: ["Jenkins", "Python", "Maven", "Apache Spark"],
    gradient: "from-primary to-accent",
    accent: "hsl(217 91% 60%)",
    number: "01",
  },
  {
    title: "Software Development Engineer in Test, CoreOS - File Systems",
    company: "Apple",
    period: "January 2023 - July 2024",
    location: "Cupertino, CA",
    bullets: [
      "Migrated and optimized 20+ legacy test scripts achieving 300% automation efficiency improvement",
      "Managed and resolved over 1,100 high-priority tickets for APFS updates impacting 100M+ macOS users",
      "Implemented streamlined workflows using Ansible, reducing manual intervention by 30%",
    ],
    tags: ["Python", "Ansible", "APFS", "macOS"],
    gradient: "from-accent to-[hsl(180,70%,50%)]",
    accent: "hsl(265 80% 65%)",
    number: "02",
  },
  {
    title: "Software Engineer Intern",
    company: "Walmart",
    period: "May 2022 - August 2022",
    location: "Sunnyvale, CA",
    bullets: [
      "Built and optimized REST APIs managing over 50,000 data items daily with 60% latency reduction",
      "Enhanced backend performance by 300% using optimization techniques in Java and Spring Boot",
      "Designed user flows using Figma and implemented them in Angular",
    ],
    tags: ["Java", "Spring Boot", "Angular", "REST APIs"],
    gradient: "from-[hsl(180,70%,50%)] to-primary",
    accent: "hsl(180 70% 50%)",
    number: "03",
  },
  {
    title: "Software Engineer Intern, Machine Learning",
    company: "Lawrence Berkeley National Laboratory",
    period: "May 2021 - August 2021",
    location: "Berkeley, CA",
    bullets: [
      "Enhanced ML model clustering accuracy from 82% to 87% using K-Means and hierarchical clustering",
      "Performed extensive data correlation analysis, identifying trends and improving hypothesis testing",
      "Streamlined data processing workflows, saving over 200 hours annually",
    ],
    tags: ["Python", "Machine Learning", "K-Means", "Data Analysis"],
    gradient: "from-primary to-[hsl(280,75%,60%)]",
    accent: "hsl(280 75% 60%)",
    number: "04",
  },
  {
    title: "Software Engineer Intern",
    company: "Honda Innovations",
    period: "January 2021 - May 2021",
    location: "Mountain View, CA",
    bullets: [
      "Engineered fleet optimization solutions achieving 500% improvement in medical supply delivery rates",
      "Implemented Agile methodologies and facilitated stand-ups, increasing team productivity by 30%",
      "Automated CI/CD workflows using GitHub Actions, improving code integration efficiency by 35%",
    ],
    tags: ["GitHub Actions", "Agile", "Fleet Optimization", "Data Analytics"],
    gradient: "from-[hsl(280,75%,60%)] to-accent",
    accent: "hsl(265 80% 65%)",
    number: "05",
  },
]

export function Journey() {
  const stackCards = experiences.map((exp, i) => ({
    id: exp.company,
    children: (
      <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/20 transition-all duration-500 hover:border-primary/40">
        {/* Full-width gradient accent strip */}
        <div className={`h-1 w-full bg-gradient-to-r ${exp.gradient}`} />

        {/* Ambient glow blobs */}
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-20 blur-3xl transition-opacity duration-700 group-hover:opacity-40"
          style={{ background: exp.accent }}
        />
        <div
          className="pointer-events-none absolute -left-20 -bottom-20 h-60 w-60 rounded-full opacity-10 blur-3xl transition-opacity duration-700 group-hover:opacity-30"
          style={{ background: exp.accent }}
        />

        <div className="relative p-6 sm:p-8 md:p-10">
          {/* Top row: number + period */}
          <div className="flex items-center justify-between">
            <span
              className="font-mono text-5xl font-black tracking-tighter opacity-10"
              style={{ color: exp.accent }}
            >
              {exp.number}
            </span>
            <span className="rounded-full border border-border/80 bg-secondary/60 px-4 py-1 font-mono text-xs text-muted-foreground backdrop-blur-sm">
              {exp.period}
            </span>
          </div>

          {/* Company + title block */}
          <div className="mt-4 flex items-start gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${exp.gradient} shadow-lg shadow-black/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
            >
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">
                {exp.company}
              </p>
              <h3 className="mt-1 text-lg font-bold leading-tight text-foreground transition-colors duration-300 group-hover:text-primary sm:text-xl">
                {exp.title}
              </h3>
              <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{exp.location}</span>
              </div>
            </div>
          </div>

          {/* Bullets */}
          <ul className="mt-6 flex flex-col gap-3">
            {exp.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex gap-3 text-sm leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-foreground/90"
              >
                <span
                  className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r ${exp.gradient}`}
                />
                {bullet}
              </li>
            ))}
          </ul>

          {/* Tags */}
          <div className="mt-6 flex flex-wrap gap-2">
            {exp.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/60 bg-secondary/40 px-3 py-1 font-mono text-xs text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-primary/30 hover:bg-secondary/80 hover:text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Shimmer overlay on hover */}
        <div className="absolute inset-0 shimmer opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
    ),
  }))

  return (
    <section id="journey" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background FX */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-20 text-center">
          <span className="inline-block font-mono text-xs uppercase tracking-[0.25em] text-primary">
            Experience
          </span>
          <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl text-balance">
            From Apple to Walmart, delivering{" "}
            <span className="gradient-text">impactful solutions</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            A track record of driving innovation and building scalable systems
            at leading tech companies.
          </p>
        </div>

        {/* ★ Scroll-stacking cards */}
        <ScrollStackCards
          cards={stackCards}
          stickyTop={100}
          stackOffset={25}
          scrollPerCard={50}
        />
      </div>
    </section>
  )
}
