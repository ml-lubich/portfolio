/**
 * Comprehensive JSON-LD structured data for maximum SEO.
 * Injects multiple schema types: Person, WebSite, ProfilePage,
 * Organization (brand), BreadcrumbList, and SiteNavigationElement.
 *
 * This gives Google's Knowledge Graph maximum signals to build
 * an entity card for Misha Lubich, and enables sitelinks search box.
 */

import { SITE_URL } from "@/lib/site-config"

const BASE_URL = SITE_URL

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${BASE_URL}/#person`,
  name: "Misha Lubich",
  givenName: "Misha",
  familyName: "Lubich",
  url: BASE_URL,
  image: {
    "@type": "ImageObject",
    url: `${BASE_URL}/profile.jpg`,
    width: 400,
    height: 400,
  },
  jobTitle: "Senior AI Engineer & Technical Leader",
  description:
    "Senior AI Engineer and Technical Leader with experience at Apple, GitHub, Braintrust Data, Walmart, and Lawrence Berkeley National Lab. Specialising in machine learning, MLOps, LLMs, and full-stack development.",
  sameAs: [
    "https://github.com/ml-lubich",
    "https://linkedin.com/in/mishalubich",
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
  alumniOf: [
    {
      "@type": "Organization",
      name: "Apple",
      url: "https://apple.com",
    },
    {
      "@type": "Organization",
      name: "GitHub",
      url: "https://github.com",
    },
  ],
  worksFor: {
    "@type": "Organization",
    name: "Braintrust Data",
  },
  hasOccupation: {
    "@type": "Occupation",
    name: "AI Engineer",
    occupationLocation: {
      "@type": "Country",
      name: "United States",
    },
    skills:
      "Machine Learning, Deep Learning, MLOps, LLMs, Python, TypeScript, React, Next.js, TensorFlow, PyTorch",
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": BASE_URL,
  },
}

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  url: BASE_URL,
  name: "Misha Lubich — AI Engineer & Technical Leader",
  description:
    "Portfolio of Misha Lubich, a Senior AI Engineer building scalable ML systems. Projects, research, and engineering insights.",
  publisher: {
    "@id": `${BASE_URL}/#person`,
  },
  inLanguage: "en-US",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/blog?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
}

const profilePageSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${BASE_URL}/#profilepage`,
  url: BASE_URL,
  name: "Misha Lubich | AI Engineer & Technical Leader — Portfolio",
  description:
    "Portfolio showcasing AI/ML projects, professional experience at Apple, GitHub, and top-tier companies, and research publications.",
  mainEntity: {
    "@id": `${BASE_URL}/#person`,
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
    ],
  },
}

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: BASE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: `${BASE_URL}/blog`,
    },
  ],
}

/**
 * SiteNavigationElement schema — helps Google understand
 * site structure and can enable sitelinks in search results.
 */
const siteNavigationSchema = {
  "@context": "https://schema.org",
  "@type": "SiteNavigationElement",
  name: [
    "Home",
    "About",
    "Projects",
    "Skills",
    "Experience",
    "Publications",
    "Blog",
    "Contact",
  ],
  url: [
    BASE_URL,
    `${BASE_URL}/#about`,
    `${BASE_URL}/#projects`,
    `${BASE_URL}/#skills`,
    `${BASE_URL}/#journey`,
    `${BASE_URL}/#publications`,
    `${BASE_URL}/blog`,
    `${BASE_URL}/#contact`,
  ],
}

const schemas = [personSchema, webSiteSchema, profilePageSchema, breadcrumbSchema, siteNavigationSchema]

export function JsonLd() {
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
