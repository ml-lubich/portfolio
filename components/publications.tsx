"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, ExternalLink } from "lucide-react"
import { useInView } from "react-intersection-observer"
import Link from "next/link"

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
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section id="publications" className="py-20 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Research{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Publications
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Contributing to the intersection of machine learning and environmental science
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {publications.map((pub, index) => (
            <Link
              key={index}
              href={pub.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card
                className={`group hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200/20 dark:border-gray-700/20 cursor-pointer ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-r ${pub.gradient} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                    >
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {pub.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs hover:scale-105 transition-transform duration-200">
                          {pub.type}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-gray-100 dark:bg-slate-700 hover:scale-105 transition-transform duration-200"
                        >
                          {pub.year}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{pub.journal}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{pub.volume}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
            Research focus on machine learning applications in hydrology and environmental science
          </p>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="hover:scale-105 transition-all duration-200 bg-transparent"
          >
            <Link href="https://scholar.google.com/citations?user=Be6ZA78AAAAJ&hl=en" target="_blank">
              <ExternalLink className="mr-2 h-5 w-5" />
              View Google Scholar Profile
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
