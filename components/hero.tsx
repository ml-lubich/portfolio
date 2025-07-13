"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, Mail, ArrowDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: mousePosition.x / 10,
            top: mousePosition.y / 10,
            transform: "translate(-50%, -50%)",
          }}
        />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-teal-400/20 to-blue-400/20 rounded-full blur-2xl animate-bounce" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse" />
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-block mb-4">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full animate-pulse">
              Available for new opportunities
            </span>
          </div>

          {/* Profile Photo */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-full blur-sm opacity-40 group-hover:opacity-60 transition-all duration-1000 animate-slow-pulse"></div>
              <div className="relative">
                <Image
                  src="/profile.png"
                  alt="Misha Lubich"
                  width={280}
                  height={280}
                  className="rounded-full object-cover shadow-2xl group-hover:scale-105 transition-transform duration-700 ring-4 ring-white/30 dark:ring-slate-800/30 backdrop-blur-sm animate-gentle-float"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in-up animation-delay-200">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent animate-gradient-x">
              misha lubich
            </span>
          </h1>

          <div className="text-xl md:text-3xl text-gray-600 dark:text-gray-300 mb-6 animate-fade-in-up animation-delay-400">
            <span className="inline-block animate-typewriter">Software Engineer & Technical Leader</span>
          </div>

          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-600">
            Crafting scalable solutions and leading cross-functional teams at industry leaders like{" "}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-fade-in-up animation-delay-1000">
          {[
            { value: "50%", label: "Deployment time reduction", color: "from-blue-500 to-cyan-500" },
            { value: "300%", label: "Backend performance boost", color: "from-purple-500 to-pink-500" },
            { value: "100M+", label: "macOS users impacted", color: "from-teal-500 to-green-500" },
          ].map((stat, index) => (
            <div
              key={index}
              className="group bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/20 dark:border-gray-700/20 hover:bg-white/20 dark:hover:bg-slate-800/20 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div
                className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300`}
              >
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrow positioned at the very bottom of the screen */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
        <ArrowDown className="h-6 w-6 text-gray-400" />
      </div>
    </section>
  )
}
