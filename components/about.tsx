"use client"

import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, Award, Users, Code } from "lucide-react"
import { useInView } from "react-intersection-observer"

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
            About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Me</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Passionate about mentorship, knowledge sharing, and contributing to open-source projects that advance
            industry best practices. Seeking opportunities to combine technical expertise and leadership capabilities in
            roles focused on innovation, scalability, and meaningful societal contributions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => {
            const IconComponent = card.icon
            return (
              <Card
                key={index}
                className={`group text-center p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-gray-200/20 dark:border-gray-700/20 ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardContent className="pt-6">
                  <div
                    className={`h-16 w-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${card.color} p-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{card.title}</h3>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{card.subtitle}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
