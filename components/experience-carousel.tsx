"use client"

import { PortfolioCard, CardContent, CardHeader, CardTitle } from "@/components/ui/portfolio-card"
import { CalendarDays, MapPin } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { CardReveal } from "@/components/ui/unified-reveal"
import { SectionWrapper } from "@/components/ui/section-wrapper"
import { SectionHeader } from "@/components/ui/section-header"
import { TechBadge } from "@/components/ui/tech-badge"
import { animations } from "@/lib/animations"
import { experiences, type Experience } from "@/lib/data"

function TimelineCard({ experience, index, isLeft }: { experience: Experience; index: number; isLeft: boolean }) {
  return (
    <div className="relative">
      {/* Timeline connector dot (behind text) */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-0">
        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${experience.gradient} shadow border-2 border-white dark:border-gray-900`} />
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
    <SectionWrapper id="experience" maxWidth="5xl" delay={125} ref={ref}>
      <SectionHeader 
        title="My"
        subtitle="Journey"
        description="From Apple to Walmart, delivering impactful solutions across diverse tech environments"
        size="lg"
      />

      {/* Timeline with Zigzag Layout */}
      <div className="relative">
        {/* Vertical Timeline Line (send behind cards, non-interactive) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-600 via-purple-600 to-teal-600 opacity-30 -z-10 pointer-events-none select-none" />
        
        {/* Timeline Cards */}
        <div className="relative space-y-8 z-10">
          {experiences.map((experience, index) => (
            <CardReveal 
              key={index} 
              direction={index % 2 === 0 ? "left" : "right"} 
              delay={index * 150}
            >
              <TimelineCard 
                experience={experience} 
                index={index} 
                isLeft={index % 2 === 0}
              />
            </CardReveal>
          ))}
        </div>

        {/* Timeline End Marker */}
        <CardReveal delay={600}>
          <div className="flex justify-center mt-12">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg border-4 border-white dark:border-gray-900 animate-pulse" />
          </div>
        </CardReveal>
      </div>
    </SectionWrapper>
  )
}
