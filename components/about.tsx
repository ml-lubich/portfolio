"use client"

import { PortfolioCard, IconContainer, CardContent } from "@/components/ui/portfolio-card"
import { GraduationCap, Award, Users, Code } from "lucide-react"
import { useInView } from "react-intersection-observer"
import Image from "next/image"

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
    <section id="about" className="py-20 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Me
            </span>
          </h2>
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.svg"
              alt="Misha Lubich Logo"
              width={80}
              height={80}
              className="opacity-60 hover:opacity-100 transition-opacity duration-500"
              sizes="80px"
              quality={90}
            />
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Software Engineer and AI/ML Specialist passionate about creating scalable solutions that drive innovation.
            With experience at companies like Apple and GitHub, I blend technical expertise with research acumen to
            build impactful systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => {
            const IconComponent = card.icon
            return (
              <PortfolioCard
                key={index}
                variant="soft"
                animation="slow"
                inView={inView}
                animationDelay={index * 100}
                showAnimation={true}
                className="text-center p-6"
              >
                <CardContent className="pt-6">
                  <IconContainer 
                    gradient={card.color}
                    className="mx-auto mb-4"
                  >
                    <IconComponent className="h-8 w-8 text-white" />
                  </IconContainer>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{card.title}</h3>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{card.subtitle}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.description}</p>
                </CardContent>
              </PortfolioCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
