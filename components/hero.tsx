"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, Mail, ArrowDown, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { LazyFallingCode } from "./lazy-falling-code"

export function Hero() {
  const [nameText, setNameText] = useState("")
  const [titleText, setTitleText] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  const fullName = "misha lubich"
  const fullTitle = "Software Engineer & Technical Leader"

  useEffect(() => {
    let timeout: NodeJS.Timeout

    const typeText = (text: string, setter: (text: string) => void, delay = 100) => {
      let index = 0
      const type = () => {
        if (index < text.length) {
          setter(text.slice(0, index + 1))
          index++
          timeout = setTimeout(type, delay)
        } else if (setter === setNameText) {
          // Start typing title after name is complete
          setTimeout(() => typeText(fullTitle, setTitleText, 80), 500)
        } else {
          setIsTyping(false)
        }
      }
      type()
    }

    // Start typing name
    typeText(fullName, setNameText, 120)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 w-full h-full">
        <LazyFallingCode />
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-teal-500/5" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-1000" />

      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          {/* Profile Photo */}
          <div className="relative group mb-8 animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-full blur-sm opacity-40 group-hover:opacity-60 transition-all duration-1000 animate-slow-pulse"></div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20"></div>
              <Image
                src="/profile.jpg"
                alt="Misha Lubich"
                width={300}
                height={360}
                className="rounded-full object-cover shadow-2xl group-hover:scale-105 transition-transform duration-700 ring-4 ring-white/30 dark:ring-slate-800/30 backdrop-blur-sm animate-gentle-float"
                style={{borderRadius: '150px'}}
                quality={100}
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-slate-900/10 to-slate-900/20 opacity-80 group-hover:opacity-60 transition-opacity duration-500" style={{borderRadius: '150px'}}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>

          {/* Name with typing animation */}
          <div className="mb-4 animate-fade-in-up animation-delay-200">
            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
              {nameText}
              {isTyping && nameText.length < fullName.length && (
                <span className="animate-pulse text-blue-600">|</span>
              )}
            </h1>
          </div>

          {/* Title with typing animation */}
          <div className="mb-6 animate-fade-in-up animation-delay-400">
            <h2 className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 font-light">
              {titleText}
              {isTyping && titleText.length < fullTitle.length && nameText.length >= fullName.length && (
                <span className="animate-pulse text-purple-600">|</span>
              )}
            </h2>
          </div>

          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8 animate-fade-in-up animation-delay-600">
            Crafting scalable solutions and innovating within cross-functional teams at industry leaders like{" "}
            <span className="text-blue-600 dark:text-blue-400 font-semibold">Apple</span> and{" "}
            <span className="text-blue-600 dark:text-blue-400 font-semibold">Walmart</span>
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in-up animation-delay-800">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
          >
            <Link href="#contact">
              <Mail className="mr-2 h-5 w-5" />
              Get In Touch
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 text-white border-0"
          >
            <Link href="https://calendly.com/michaelle-lubich/" target="_blank" rel="noopener noreferrer">
              <Calendar className="mr-2 h-5 w-5" />
              Schedule a Call
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="hover:scale-105 transition-all duration-200 bg-transparent"
          >
            <Link href="https://github.com/ml-lubich" target="_blank">
              <Github className="mr-2 h-5 w-5" />
              GitHub
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="hover:scale-105 transition-all duration-200 bg-transparent"
          >
            <Link href="https://linkedin.com/in/misha-lubich" target="_blank">
              <Linkedin className="mr-2 h-5 w-5" />
              LinkedIn
            </Link>
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 animate-fade-in-up animation-delay-1000">
          {[
            { number: "100M+", label: "Users Impacted", color: "from-blue-600 to-cyan-600" },
            { number: "6", label: "Research Papers", color: "from-purple-600 to-pink-600" },
            { number: "300%", label: "Performance Gains", color: "from-teal-600 to-green-600" },
            { number: "5+", label: "Years Experience", color: "from-orange-600 to-red-600" },
          ].map((stat, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-white/80 dark:bg-slate-800/20 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div
                className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300`}
              >
                {stat.number}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="animate-bounce animate-fade-in-up animation-delay-1200">
          <Link href="#about" className="inline-block text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <ArrowDown className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </section>
  )
}
