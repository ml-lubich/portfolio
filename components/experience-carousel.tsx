"use client"

import { PortfolioCard, CardContent, CardHeader, CardTitle } from "@/components/ui/portfolio-card"
import { CalendarDays, MapPin } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { TechBadge } from "@/components/ui/tech-badge"
import { animations } from "@/lib/animations"

const experiences = [
  {
    title: "Software Development Engineer in Test & Developer",
    company: "Polaris Wireless",
    period: "September 2024 - Present",
    location: "San Francisco, CA",
    highlights: [
      "Engineered robust CI/CD pipelines using Jenkins, reducing deployment time by 50%",
      "Led and mentored a cross-functional team of 4 engineers across QA, DevOps, and backend",
      "Designed scalable data ingestion pipelines processing over 10 million records daily",
      "Developed comprehensive testing frameworks increasing test coverage by 35%",
      "Migrated Ant-based build systems to Maven, optimizing dependency management by 25%",
    ],
    technologies: ["Jenkins", "Python", "Maven", "Apache Spark", "Hadoop", "PyTest", "JUnit", "Ansible"],
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Software Development Engineer in Test, CoreOS - File Systems",
    company: "Apple",
    period: "January 2023 - July 2024",
    location: "Cupertino, CA",
    highlights: [
      "Migrated and optimized 20+ legacy test scripts achieving 300% automation efficiency improvement",
      "Managed and resolved over 1,100 high-priority tickets for APFS updates impacting 100M+ macOS users",
      "Implemented streamlined workflows using Ansible, reducing manual intervention by 30%",
      "Designed modular Python test suites, enhancing code reusability by 40%",
      "Authored technical documentation reducing onboarding time for new hires by 50%",
    ],
    technologies: ["Python", "Ansible", "APFS", "macOS", "Git", "Automated Testing", "CI/CD"],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Software Engineer Intern",
    company: "Walmart",
    period: "May 2022 - August 2022",
    location: "Sunnyvale, CA",
    highlights: [
      "Built and optimized REST APIs managing over 50,000 data items daily with 60% latency reduction",
      "Enhanced backend performance by 300% using optimization techniques in Java and Spring Boot",
      "Designed user flows using Figma and implemented them in Angular, achieving 25% increase in user satisfaction",
      "Developed scalable advertisement delivery systems increasing revenue by $2 million annually",
      "Automated recurring tasks, saving over 1,400 work hours annually and reducing costs by $4 million",
    ],
    technologies: ["Java", "Spring Boot", "Angular", "REST APIs", "Figma", "AdTech"],
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Software Engineer Intern, Machine Learning",
    company: "Lawrence Berkeley National Laboratory",
    period: "May 2021 - August 2021",
    location: "Berkeley, CA",
    highlights: [
      "Enhanced ML model clustering accuracy from 82% to 87% using K-Means and hierarchical clustering",
      "Performed extensive data correlation analysis, identifying trends and improving hypothesis testing",
      "Streamlined data processing workflows, saving over 200 hours annually in repetitive tasks",
      "Built reusable data visualization libraries, improving reporting efficiency across multiple projects",
    ],
    technologies: ["Python", "Machine Learning", "K-Means", "Data Analysis", "Visualization", "Jupyter"],
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "Software Engineer Intern",
    company: "Honda Innovations",
    period: "January 2021 - May 2021",
    location: "Mountain View, CA",
    highlights: [
      "Engineered fleet optimization solutions achieving 500% improvement in medical supply delivery rates",
      "Implemented Agile methodologies and facilitated stand-ups, increasing team productivity by 30%",
      "Automated CI/CD workflows using GitHub Actions, improving code integration efficiency by 35%",
      "Led high-impact Capstone Project delivering $1 million cost-saving outcome through data-driven decisions",
      "Collaborated with cross-functional teams ensuring alignment on strategic goals",
    ],
    technologies: ["GitHub Actions", "Agile", "Fleet Optimization", "Data Analytics", "CI/CD"],
    gradient: "from-orange-500 to-red-500",
  },
]

function TimelineCard({ experience, index, isLeft }: { experience: typeof experiences[0]; index: number; isLeft: boolean }) {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
    rootMargin: '100px 0px',
  })

  return (
    <div 
      ref={ref}
            className={`relative transition-all duration-500 ease-out ${
        inView
          ? "opacity-100 translate-x-0 scale-100"
          : `opacity-0 ${isLeft ? "translate-x-[-50px]" : "translate-x-[50px]"} scale-98`
      }`}
      style={{
        transitionDelay: `${index * 100}ms`
      }}
    >
      {/* Timeline connector dot */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${experience.gradient} shadow-lg border-4 border-white dark:border-gray-900 transition-all duration-300 ${inView ? 'scale-100' : 'scale-0'}`} />
      </div>

      {/* Card positioned left or right */}
      <div className={`flex ${isLeft ? 'justify-start pr-8' : 'justify-end pl-8'} mb-16`}>
        <div className={`w-full max-w-lg ${isLeft ? 'mr-8' : 'ml-8'}`}>
          <PortfolioCard 
            variant="minimal" 
            size="full"
            className="group overflow-visible [perspective:1200px] [transform-style:preserve-3d] transition-transform duration-100 hover:[transform:rotateX(4deg)_rotateY(2deg)_translateZ(8px)] hover:shadow-2xl"
          >
            <CardHeader className="p-4 sm:p-6 [transform:translateZ(20px)]">
              <div className="flex flex-col gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gray-900 dark:text-white mb-2 leading-tight">
                    {experience.title}
                  </CardTitle>
                  <p
                    className={`text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r ${experience.gradient} bg-clip-text text-transparent`}
                  >
                    {experience.company}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <CalendarDays className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{experience.period}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{experience.location}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 [transform:translateZ(10px)]">
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {experience.highlights.slice(0, 3).map((highlight, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {highlight}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {experience.technologies.slice(0, 4).map((tech, idx) => (
                  <TechBadge key={idx}>
                    {tech}
                  </TechBadge>
                ))}
              </div>
            </CardContent>
          </PortfolioCard>
        </div>
      </div>
    </div>
  )
}

export function ExperienceCarousel() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section id="experience" className="py-20 px-4" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <div
          className={`text-center mb-20 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            My{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Journey
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            From Apple to Walmart, delivering impactful solutions across diverse tech environments
          </p>
        </div>

        {/* Timeline with Zigzag Layout */}
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-600 via-purple-600 to-teal-600 opacity-30" />
          
          {/* Timeline Cards */}
          <div className="relative space-y-8">
            {experiences.map((experience, index) => (
              <TimelineCard 
                key={index} 
                experience={experience} 
                index={index} 
                isLeft={index % 2 === 0}
              />
            ))}
          </div>

          {/* Timeline End Marker */}
          <div className="flex justify-center mt-12">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg border-4 border-white dark:border-gray-900 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  )
}
