"use client"

import { PortfolioCard, IconContainer, CardContent, CardHeader, CardTitle } from "@/components/ui/portfolio-card"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, Github, Linkedin, GraduationCap, Send, FileDown, Calendar } from "lucide-react"
import { useInView } from "react-intersection-observer"
import Link from "next/link"
import Image from "next/image"
import { useEffect } from "react"

export function Contact() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  // Load Calendly script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup script if component unmounts
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]')
      if (existingScript) {
        document.body.removeChild(existingScript)
      }
    }
  }, [])

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

  // Proper download handler
  const handleDownloadResume = () => {
    const link = document.createElement('a')
    link.href = '/lubich_michaelle_swe.pdf'
    link.download = 'Misha_Lubich_Resume.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const socialLinks = [
    {
      icon: Calendar,
      label: "Schedule a Call",
      href: "https://calendly.com/michaelle-lubich/",
      gradient: "from-blue-600 to-purple-600",
      isPrimary: true,
    },
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
      onClick: handleDownloadResume,
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

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {contactMethods.map((method, index) => {
            const IconComponent = method.icon
            return (
              <PortfolioCard
                key={index}
                variant="default"
                inView={inView}
                animationDelay={0}
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
                  className="w-full border-2 border-gray-300 dark:border-gray-600 bg-white/10 dark:bg-slate-800/20 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-100"
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

        {/* Calendly Booking Section */}
        <div className="mb-16">
          <div
            className={`text-center mb-8 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            style={{ animationDelay: '400ms' }}
          >
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Schedule a{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Meeting
              </span>
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Book a time that works best for you - let's discuss your project or collaboration opportunities
            </p>
          </div>
          
          <div
            className={`transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            style={{ animationDelay: '600ms' }}
          >
            {/* Calendly inline widget */}
            <div 
              className="calendly-inline-widget" 
              data-url="https://calendly.com/michaelle-lubich/" 
              style={{ minWidth: '320px', height: '700px' }}
            ></div>
          </div>
        </div>

        {/* Social Links */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Or find me on these platforms
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon

              // Handle download button with onClick
              if (social.onClick) {
                return (
                  <Button
                    key={index}
                    onClick={social.onClick}
                    variant="outline"
                    size="lg"
                    className="border-2 border-gray-300 dark:border-gray-600 bg-white/10 dark:bg-slate-800/20 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-slate-700/30 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:scale-110 transition-all duration-100"
                  >
                    <IconComponent className="mr-2 h-5 w-5" />
                    {social.label}
                  </Button>
                )
              }

              return (
                <Button
                  key={index}
                  asChild
                  variant={social.isPrimary ? "default" : "outline"}
                  size="lg"
                  className={`${
                    social.isPrimary 
                      ? `bg-gradient-to-r ${social.gradient} text-white border-0 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-100`
                      : social.label === "LinkedIn"
                      ? `border-2 border-gray-300 dark:border-gray-600 bg-white/10 dark:bg-slate-800/20 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-slate-700/30 hover:border-purple-500 dark:hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-110 transition-all duration-100`
                      : social.label === "GitHub"
                      ? `border-2 border-gray-300 dark:border-gray-600 bg-white/10 dark:bg-slate-800/20 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-slate-700/30 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 transition-all duration-100`
                      : social.label === "Google Scholar"
                      ? `border-2 border-gray-300 dark:border-gray-600 bg-white/10 dark:bg-slate-800/20 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-slate-700/30 hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-110 transition-all duration-100`
                      : `border-2 border-gray-300 dark:border-gray-600 bg-white/10 dark:bg-slate-800/20 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-slate-700/30 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:scale-110 transition-all duration-100`
                  }`}
                >
                  <Link
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
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
