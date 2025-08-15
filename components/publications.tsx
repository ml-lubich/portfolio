"use client"

import { ActionButton } from "@/components/ui/action-button"
import { ResearchCard } from "@/components/ui/research-card"
import { ExternalLink } from "lucide-react"
import { CardReveal } from "@/components/ui/unified-reveal"
import { SectionWrapper } from "@/components/ui/section-wrapper"
import { SectionHeader } from "@/components/ui/section-header"
import { publications } from "@/lib/data"

export function Publications() {
  return (
    <SectionWrapper id="publications" delay={200}>
      <SectionHeader 
        title="Research"
        subtitle="Publications"
        description="Contributing to the intersection of machine learning and environmental science"
      />

      {/* Responsive, scalable grid with equal-height cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {publications.map((pub, index) => (
          <CardReveal key={index} direction="up" delay={index * 100}>
            <ResearchCard
              title={pub.title}
              journal={pub.journal}
              year={pub.year}
              volume={pub.volume}
              type={pub.type}
              gradient={pub.gradient}
              href={pub.href}
              tags={pub.tags}
            />
          </CardReveal>
        ))}
      </div>

      <CardReveal delay={400}>
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
            Research focus on machine learning applications in hydrology and environmental science
          </p>
          <ActionButton
            variant="outline"
            href="https://scholar.google.com/citations?user=Be6ZA78AAAAJ&hl=en"
            external
            className="bg-transparent hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            View Google Scholar Profile
          </ActionButton>
        </div>
      </CardReveal>
    </SectionWrapper>
  )
}
