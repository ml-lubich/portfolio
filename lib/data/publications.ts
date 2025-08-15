export interface Publication {
  title: string
  journal: string
  year: string
  volume: string
  type: "Journal Article" | "Conference Abstract"
  gradient: string
  href: string
  tags: string[]
}

export const publications: Publication[] = [
  {
    title:
      "Stream temperature predictions for river basin management in the Pacific Northwest and mid-Atlantic regions using machine learning",
    journal: "Water, MDPI",
    year: "2022",
    volume: "Volume 14, Issue 7, Pages 1032",
    type: "Journal Article",
    gradient: "from-blue-500 to-cyan-500",
    href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:qjMakFHDy7sC",
    tags: ["Machine Learning", "Hydrology", "Stream Temperature", "Water Management"],
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
    tags: ["Machine Learning", "Stream Temperature", "Hydrology", "Spatial Modeling"],
  },
  {
    title: "Multiscale Effects of Climate-driven Disturbances on River Water Quality",
    journal: "Frontiers in Hydrology",
    year: "2022",
    volume: "Pages 152-01",
    type: "Journal Article",
    gradient: "from-teal-500 to-green-500",
    href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:d1gkVwhDpl0C",
    tags: ["Climate Change", "Water Quality", "Environmental Science", "Multiscale Analysis"],
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
    tags: ["Machine Learning", "Statistical Modeling", "Water Quality", "Climate Impact"],
  },
  {
    title: "Data-Model Integration and Machine Learning Approaches for Hydrobiogeochemical Modeling Applications",
    journal: "AGU Fall Meeting Abstracts",
    year: "2021",
    volume: "Volume 2021, Pages B15J-1551",
    type: "Conference Abstract",
    gradient: "from-indigo-500 to-purple-500",
    href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:9yKSN-GCB0IC",
    tags: ["Data Integration", "Machine Learning", "Biogeochemistry", "Modeling"],
  },
  {
    title: "Predicting Stream Temperature Across Spatial Scales With Low Complexity ML",
    journal: "AGU Fall Meeting Abstracts",
    year: "2021",
    volume: "Volume 2021, Pages H35D-1070",
    type: "Conference Abstract",
    gradient: "from-pink-500 to-rose-500",
    href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Be6ZA78AAAAJ&citation_for_view=Be6ZA78AAAAJ:u-x6o8ySG0sC",
    tags: ["Machine Learning", "Stream Temperature", "Spatial Scales", "Low Complexity"],
  },
]
