"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <section id="contact" className="py-20 px-4 bg-white/50 dark:bg-slate-900/50" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Let's{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Connect</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Open to opportunities in software engineering, technical leadership, and innovative projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactMethods.map((method, index) => {
            const IconComponent = method.icon
            return (
              <Card
                key={index}
                className={`group text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200/20 dark:border-gray-700/20 ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div
                    className={`h-16 w-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${method.gradient} p-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
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
              </Card>
            )
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {socialLinks.map((social, index) => {
            const IconComponent = social.icon
            return (
              <Button
                key={index}
                asChild
                size="lg"
                className={`bg-gradient-to-r ${social.gradient} hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                {social.isDownload ? (
                  <a 
                    href={social.href} 
                    download="Michaelle_Lubich_Resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconComponent className="mr-2 h-5 w-5" />
                    {social.label}
                  </a>
                ) : (
                  <Link href={social.href} target="_blank">
                    <IconComponent className="mr-2 h-5 w-5" />
                    {social.label}
                  </Link>
                )}
              </Button>
            )
          })}
        </div>

        <div
          className={`p-8 bg-gradient-to-r from-blue-50 via-purple-50 to-teal-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-2xl border border-gray-200/20 dark:border-gray-700/20 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="text-center">
            <Send className="h-12 w-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Currently Seeking</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
              Opportunities to combine technical expertise and leadership capabilities in roles focused on:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-4xl mx-auto">
              {[
                "Innovation and scalability in software engineering",
                "Technical leadership and team mentorship",
                "Meaningful societal contributions through technology",
                "Open-source contributions and community impact",
              ].map((item, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-blue-600 dark:text-blue-400 mr-3">•</span>
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with Logo */}
        <div className="flex flex-col items-center justify-center mt-16 pt-8 border-t border-gray-200/20 dark:border-gray-700/20">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Misha Lubich Logo"
              width={60}
              height={60}
              className="object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
              sizes="60px"
              loading="lazy"
            />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
            © 2025 Misha Lubich. Crafted with passion for innovation and excellence.
          </p>
        </div>
      </div>
    </section>
  )
}
