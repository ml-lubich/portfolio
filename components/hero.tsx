"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, Mail, ArrowDown, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { FallingCode } from "./falling-code"

export function Hero() {
  const [nameText, setNameText] = useState("")
  const [titleText, setTitleText] = useState("")
  const [nameComplete, setNameComplete] = useState(false)
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0)
  const [isTypingName, setIsTypingName] = useState(false)

  // Function to open Calendly in a smaller popup window
  const openCalendly = () => {
    const width = 800
    const height = 600
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2
    
    window.open(
      "https://calendly.com/michaelle-lubich/",
      "calendly",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    )
  }

  const fullName = "misha lubich"
  const titles = [
    "Software Engineer & Technical Leader",
    "Full-Stack Developer",
    "AI/ML Research Engineer", 
    "Ex-Apple Software Engineer",
    "Ex-Walmart Tech Innovator",
    "React & Next.js Specialist",
    "Cloud Architecture Expert",
    "Published Research Author",
    "Performance Optimization Expert",
    "Team Innovation Leader"
  ]

  useEffect(() => {
    let timeout: NodeJS.Timeout

    // Type out name once with a small delay
    const typeName = () => {
      setIsTypingName(true)
      let index = 0
      const type = () => {
        if (index < fullName.length) {
          setNameText(fullName.slice(0, index + 1))
          index++
          timeout = setTimeout(type, 120)
        } else {
          setIsTypingName(false)
          setNameComplete(true)
          // Start cycling titles after name is complete
          timeout = setTimeout(() => startTitleCycle(), 500)
        }
      }
      timeout = setTimeout(type, 2000) // Initial delay before typing starts
    }

    // Cycle through titles continuously
    const startTitleCycle = () => {
      const typeTitle = (titleIndex: number) => {
        const currentTitle = titles[titleIndex]
        let charIndex = 0
        
        // Type out the title
        const typeChar = () => {
          if (charIndex < currentTitle.length) {
            setTitleText(currentTitle.slice(0, charIndex + 1))
            charIndex++
            timeout = setTimeout(typeChar, 80)
          } else {
            // Hold the complete title for 2 seconds
            timeout = setTimeout(() => {
              // Erase the title
              eraseTitle(titleIndex)
            }, 2000)
          }
        }
        typeChar()
      }

      const eraseTitle = (titleIndex: number) => {
        const currentTitle = titles[titleIndex]
        let charIndex = currentTitle.length
        
        const eraseChar = () => {
          if (charIndex > 0) {
            setTitleText(currentTitle.slice(0, charIndex - 1))
            charIndex--
            timeout = setTimeout(eraseChar, 40)
          } else {
            // Move to next title
            const nextIndex = (titleIndex + 1) % titles.length
            setCurrentTitleIndex(nextIndex)
            // Short pause before typing next title
            timeout = setTimeout(() => typeTitle(nextIndex), 300)
          }
        }
        eraseChar()
      }

      // Start with first title
      typeTitle(0)
    }

    // Start typing name
    typeName()

    return () => clearTimeout(timeout)
  }, [])

  return (
    <section 
      id="hero" 
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-slow-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-slow-pulse animation-delay-1000"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-teal-600/10 rounded-full blur-2xl animate-slow-pulse animation-delay-2000"></div>
      </div>
      
      {/* Falling Code Background */}
      <div className="absolute inset-0 pointer-events-none">
        <FallingCode />
      </div>

      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          {/* Profile Photo */}
          <div className="relative group mb-8 mt-8 sm:mt-12 md:mt-16 animate-fade-in-up">
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
            <h1 className="text-6xl md:text-8xl font-bold mb-2 tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                {nameText}
              </span>
              {(isTypingName || nameComplete) && (
                <span className="animate-pulse text-blue-600 ml-1">|</span>
              )}
            </h1>
          </div>

          {/* Title with typing animation */}
          <div className="mb-6 animate-fade-in-up animation-delay-400 h-20 flex items-center justify-center">
            <h2 className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 font-light text-center">
              {titleText}
              {nameComplete && titleText && (
                <span className="animate-pulse text-purple-600 ml-1">|</span>
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
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Link href="#contact">
              <Mail className="mr-2 h-5 w-5" />
              Get In Touch
            </Link>
          </Button>
          <Button
            size="lg"
            onClick={openCalendly}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Calendar className="mr-2 h-5 w-5" />
            Schedule a Call
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-2 border-gray-300 dark:border-gray-600 bg-white/10 dark:bg-slate-800/20 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-slate-700/30 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 transition-all duration-200"
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
            className="border-2 border-gray-300 dark:border-gray-600 bg-white/10 dark:bg-slate-800/20 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-slate-700/30 hover:border-purple-500 dark:hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-105 transition-all duration-200"
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
