"use client"

import { PortfolioCard, IconContainer, CardContent, CardHeader, CardTitle } from "@/components/ui/portfolio-card"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, Github, Linkedin, GraduationCap, Send, FileDown } from "lucide-react"
import { useInView } from "react-intersection-observer"
import Link from "next/link"
import Image from "next/image"

export function Contact() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      value: "michaelle.lubich@gmail.com",
      href: "mailto:michaelle.lubich@gmail.com",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+1 (415) 275-0094",
      href: "tel:+14152750094",
      gradient: "from-green-500 to-teal-500",
    },
    {
      icon: MapPin,
      title: "Location",
      value: "San Francisco Bay Area",
      href: "#",
      gradient: "from-red-500 to-pink-500",
    },
  ]

  const socialLinks = [
    {
      icon: Linkedin,
      label: "LinkedIn",
      href: "https://linkedin.com/in/misha-lubich",
      gradient: "from-blue-600 to-blue-700",
    },
    {
      icon: Github,
      label: "GitHub",
      href: "https://github.com/ml-lubich",
      gradient: "from-gray-700 to-gray-900",
    },
    {
      icon: GraduationCap,
      label: "Google Scholar",
      href: "https://scholar.google.com/citations?user=Be6ZA78AAAAJ&hl=en",
      gradient: "from-purple-600 to-indigo-600",
    },
    {
      icon: FileDown,
      label: "Download Resume",
      href: "/lubich_michaelle_swe.pdf",
      gradient: "from-emerald-600 to-teal-600",
      isDownload: true,
    },
  ]

  return (
    <section id="contact" className="py-20 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Let's{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Connect
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Ready to collaborate on innovative projects and drive technical excellence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactMethods.map((method, index) => {
            const IconComponent = method.icon
            return (
              <PortfolioCard
                key={index}
                variant="default"
                animation="slow"
                inView={inView}
                animationDelay={index * 100}
                showAnimation={true}
                className="text-center"
              >
                <CardHeader>
                  <IconContainer 
                    gradient={method.gradient}
                    className="mx-auto mb-4"
                  >
                    <IconComponent className="h-8 w-8 text-white" />
                  </IconContainer>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">{method.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {method.href !== "#" ? (
                    <Button
                      asChild
                      variant="outline"
                      className="w-full group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white transition-all duration-300 bg-transparent"
                    >
                      <Link href={method.href}>{method.value}</Link>
                    </Button>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300">{method.value}</p>
                  )}
                </CardContent>
              </PortfolioCard>
            )
          })}
        </div>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Find me on these platforms
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon
              return (
                <Button
                  key={index}
                  asChild
                  variant="outline"
                  size="lg"
                  className={`bg-gradient-to-r ${social.gradient} hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl`}
                >
                  <Link
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...(social.isDownload && { download: true })}
                  >
                    <IconComponent className="mr-2 h-5 w-5" />
                    {social.label}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
