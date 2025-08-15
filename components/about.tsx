"use client"

import { GraduationCap, Award, Users, Code } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { CardReveal } from "@/components/ui/unified-reveal"
import { SectionWrapper } from "@/components/ui/section-wrapper"
import { SectionHeader } from "@/components/ui/section-header"
import { AboutCard } from "@/components/ui/about-card"

export function About() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const cards = [
    {
      icon: GraduationCap,
      title: "Education",
      subtitle: "UC Berkeley",
      description: "B.A. Computer Science",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Award,
      title: "Publications",
      subtitle: "6 Research Papers",
      description: "Machine Learning & Hydrology",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Leadership",
      subtitle: "Cross-functional teams",
      description: "Mentorship & Training",
      color: "from-teal-500 to-green-500",
    },
    {
      icon: Code,
      title: "Open Source",
      subtitle: "Django Contributor",
      description: "Community Impact",
      color: "from-orange-500 to-red-500",
    },
  ]

  return (
    <SectionWrapper id="about" delay={100} ref={ref}>
      <SectionHeader 
        title="About"
        subtitle="Me"
        description="Software Engineer and AI/ML Specialist passionate about creating scalable solutions that drive innovation. With experience at companies like Apple and GitHub, I blend technical expertise with research acumen to build impactful systems."
        className="mb-8"
      />
      
      <div className="flex justify-center mb-16">
        <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 opacity-60 hover:opacity-100 transition-opacity duration-500">
          ML
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <CardReveal 
            key={index} 
            direction={index % 2 === 0 ? 'left' : 'right'} 
            delay={index * 100}
          >
            <AboutCard
              icon={card.icon}
              title={card.title}
              subtitle={card.subtitle}
              description={card.description}
              gradient={card.color}
              inView={inView}
            />
          </CardReveal>
        ))}
      </div>
    </SectionWrapper>
  )
}
