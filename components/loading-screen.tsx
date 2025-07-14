"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface LoadingScreenProps {
  isLoading: boolean
  onLoadingComplete: () => void
}

export function LoadingScreen({ isLoading, onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isLoading) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer)
            setTimeout(onLoadingComplete, 500)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 150)

      return () => clearInterval(timer)
    }
  }, [isLoading, onLoadingComplete])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 transition-all duration-500">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-gradient-to-r from-teal-400/10 to-blue-400/10 rounded-full blur-2xl animate-bounce" />
        <div className="absolute bottom-1/4 left-3/4 w-48 h-48 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-2xl animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
          <Image
            src="/logo.png"
            alt="Misha Lubich Logo"
            width={80}
            height={80}
            className="relative object-contain animate-pulse"
            priority
          />
        </div>

        {/* Loading spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin border-t-transparent"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading text */}
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Loading Portfolio</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {progress < 30 ? "Initializing..." : 
             progress < 60 ? "Loading assets..." :
             progress < 90 ? "Preparing experience..." :
             "Almost ready..."}
          </p>
        </div>
      </div>
    </div>
  )
} 