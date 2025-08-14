"use client"

import { ActionButton } from "@/components/ui/action-button"
import { ResearchCard } from "@/components/ui/research-card"
import { ExternalLink } from "lucide-react"
import { LazyReveal } from "@/components/ui/lazy-reveal"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

const publications = [
  {
    title:
      "Stream temperature predictions for river basin management in the Pacific Northwest and mid-Atlantic regions using machine learning",
    journal: "Water, MDPI",
    year: "2022",
    volume: "Volume 14, Issue 7, Pages 1032",
    type: "Journal Article",
    gradient: "from-blue-500 to-cyan-500",
    href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:qjMakFHDy7sC",
  },
  {
    title:
      "Classical Machine Learning for Widespread Stream Temperature Predictions: Demonstrations in the Pacific Northwest and Mid Atlantic Regions",
    journal: "AGU Fall Meeting Abstracts",
    year: "2022",
    volume: "Volume 2022, Pages H12E-04",
    type: "Conference Abstract",
    gradient: "from-purple-500 to-pink-500",
    href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:u5HHmVD_uO8C",
  },
  {
    title: "Multiscale Effects of Climate-driven Disturbances on River Water Quality",
    journal: "Frontiers in Hydrology",
    year: "2022",
    volume: "Pages 152-01",
    type: "Journal Article",
    gradient: "from-teal-500 to-green-500",
    href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:d1gkVwhDpl0C",
  },
  {
    title:
      "Investigating the Impacts of Climate-driven Disturbances on River Water Quality using Machine Learning and Statistical Modeling Approaches",
    journal: "AGU Fall Meeting Abstracts",
    year: "2021",
    volume: "Volume 2021, Pages H22E-01",
    type: "Conference Abstract",
    gradient: "from-orange-500 to-red-500",
    href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:2osOgNQ5qMEC",
  },
  {
    title: "Data-Model Integration and Machine Learning Approaches for Hydrobiogeochemical Modeling Applications",
    journal: "AGU Fall Meeting Abstracts",
    year: "2021",
    volume: "Volume 2021, Pages B15J-1551",
    type: "Conference Abstract",
    gradient: "from-indigo-500 to-purple-500",
    href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:9yKSN-GCB0IC",
  },
  {
    title: "Predicting Stream Temperature Across Spatial Scales With Low Complexity ML",
    journal: "AGU Fall Meeting Abstracts",
    year: "2021",
    volume: "Volume 2021, Pages H35D-1070",
    type: "Conference Abstract",
    gradient: "from-pink-500 to-rose-500",
    href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:u-x6o8ySG0sC",
  },
]

export function Publications() {
  return (
    <section id="publications" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <LazyReveal direction="up" duration={500}>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Research{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Publications
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Contributing to the intersection of machine learning and environmental science
            </p>
          </div>
        </LazyReveal>

        {/* Responsive, scalable grid with equal-height cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {publications.map((pub, index) => (
            <ScrollReveal key={index} direction="up" distance={32} lockOnScrollDown={true}>
              <ResearchCard
                title={pub.title}
                journal={pub.journal}
                year={pub.year}
                volume={pub.volume}
                type={pub.type as "Journal Article" | "Conference Abstract"}
                gradient={pub.gradient}
                href={pub.href}
              />
            </ScrollReveal>
          ))}
        </div>

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
      </div>
    </section>
  )
}
