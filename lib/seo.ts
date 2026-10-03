/**
 * Single JSON-LD @graph for the site (Person, WebSite, ProfilePage,
 * BreadcrumbList, ItemList). Plain TS (no JSX/CSS) so vitest can import it.
 */
import { SITE_URL } from "@/lib/site-config"

/** Default <title> (<= 60 chars). */
export const SEO_TITLE = "Misha Lubich | Staff AI Engineer — Portfolio"

/** Default meta / og / twitter description (140-160 chars). */
export const SEO_DESCRIPTION =
  "Misha Lubich is a Staff AI Engineer at EchoStar, previously Apple, Walmart and Lawrence Berkeley National Lab, working on ML, MLOps, LLMs and agents."

const personSchema = {
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: "Misha Lubich",
  givenName: "Misha",
  familyName: "Lubich",
  url: SITE_URL,
  image: {
    "@type": "ImageObject",
    url: `${SITE_URL}/misha-headshot.png`,
    width: 1122,
    height: 1402,
  },
  jobTitle: "Staff AI Engineer",
  description:
    "Staff AI Engineer at EchoStar, previously Apple, Walmart, and Lawrence Berkeley National Lab. Specialising in machine learning, MLOps, LLMs, agents, and full-stack development.",
  sameAs: [
    "https://github.com/ml-lubich",
    "https://www.linkedin.com/in/misha-lubich/",
    "https://x.com/Machine_Lubich",
    "https://scholar.google.com/citations?hl=en&user=Be6ZA78AAAAJ",
    "https://orcid.org/0000-0003-2329-4454",
    "https://mlubich.substack.com",
    "https://substack.com/@mlubich",
  ],
  knowsAbout: [
    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning",
    "MLOps",
    "Large Language Models",
    "Natural Language Processing",
    "Computer Vision",
    "Software Engineering",
    "Python",
    "TypeScript",
    "React",
    "Next.js",
    "Data Science",
    "Neural Networks",
    "Transformer Models",
    "RAG",
    "Fine-Tuning",
    "Multi-Agent Systems",
    "Prompt Engineering",
    "AI Safety",
    "TensorFlow",
    "PyTorch",
    "Kubernetes",
    "Docker",
  ],
  worksFor: {
    "@type": "Organization",
    name: "EchoStar",
    url: "https://www.echostar.com",
  },
  alumniOf: [
    { "@type": "Organization", name: "Apple", url: "https://apple.com" },
    { "@type": "Organization", name: "Walmart" },
    { "@type": "Organization", name: "Lawrence Berkeley National Laboratory" },
    { "@type": "Organization", name: "Polaris Wireless" },
    { "@type": "Organization", name: "Honda Innovations" },
  ],
  hasOccupation: {
    "@type": "Occupation",
    name: "Staff AI Engineer",
    occupationLocation: {
      "@type": "Country",
      name: "United States",
    },
    skills:
      "Machine Learning, Deep Learning, MLOps, LLMs, Python, TypeScript, React, Next.js, TensorFlow, PyTorch",
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": SITE_URL,
  },
}

const webSiteSchema = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Misha Lubich — Staff AI Engineer",
  description:
    "Portfolio of Misha Lubich, a Staff AI Engineer building production AI pipelines. Projects, research, and engineering insights.",
  publisher: {
    "@id": `${SITE_URL}/#person`,
  },
  inLanguage: "en-US",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/blog?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
}

const profilePageSchema = {
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/#profilepage`,
  url: SITE_URL,
  name: "Misha Lubich | Staff AI Engineer — Portfolio",
  description:
    "Portfolio showcasing AI/ML projects, professional experience at EchoStar, Apple, Walmart, and Lawrence Berkeley National Lab, and research publications.",
  mainEntity: {
    "@id": `${SITE_URL}/#person`,
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
    ],
  },
}

const breadcrumbSchema = {
  "@type": "BreadcrumbList",
  "@id": `${SITE_URL}/#breadcrumb`,
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: `${SITE_URL}/blog`,
    },
  ],
}

/**
 * ItemList of in-site destinations — valid structured data (Schema.org ListItem)
 * for navigation, replacing invalid parallel-array SiteNavigationElement.
 */
const siteNavigationSchema = {
  "@id": `${SITE_URL}/#site-navigation`,
  "@type": "ItemList",
  name: "Site navigation",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "About", item: `${SITE_URL}/#about` },
    { "@type": "ListItem", position: 3, name: "Experience", item: `${SITE_URL}/#journey` },
    { "@type": "ListItem", position: 4, name: "Consulting", item: `${SITE_URL}/#consulting` },
    { "@type": "ListItem", position: 5, name: "Clients", item: `${SITE_URL}/#testimonials` },
    { "@type": "ListItem", position: 6, name: "Projects", item: `${SITE_URL}/#projects` },
    { "@type": "ListItem", position: 7, name: "Skills", item: `${SITE_URL}/#skills` },
    { "@type": "ListItem", position: 8, name: "Publications", item: `${SITE_URL}/#research` },
    { "@type": "ListItem", position: 9, name: "Blog", item: `${SITE_URL}/blog` },
    { "@type": "ListItem", position: 10, name: "Contact", item: `${SITE_URL}/#contact` },
  ],
}


export const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [personSchema, webSiteSchema, profilePageSchema, breadcrumbSchema, siteNavigationSchema],
}
