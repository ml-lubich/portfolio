"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

declare global {
  interface Window {
    Calendly: {
      initInlineWidget: (options: {
        url: string
        parentElement: HTMLElement
        prefill?: Record<string, string>
        utm?: Record<string, string>
      }) => void
    }
  }
}

interface CalendlyEmbedProps {
  url: string
  height?: string
}

export function CalendlyEmbed({ url, height = "700px" }: CalendlyEmbedProps) {
  const calendlyRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://assets.calendly.com/assets/external/widget.js"
    script.async = true
    
    script.onload = () => {
      if (window.Calendly && calendlyRef.current) {
        // Clear any existing widget
        calendlyRef.current.innerHTML = ""
        
        // Initialize Calendly widget with theme support
        window.Calendly.initInlineWidget({
          url: `${url}?hide_gdpr_banner=1&background_color=${theme === 'dark' ? '1e293b' : 'ffffff'}&text_color=${theme === 'dark' ? 'f1f5f9' : '334155'}&primary_color=3b82f6`,
          parentElement: calendlyRef.current,
        })
      }
    }

    // Only append script if it doesn't exist
    if (!document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]')) {
      document.head.appendChild(script)
    } else if (window.Calendly && calendlyRef.current) {
      // Script already loaded, initialize widget
      calendlyRef.current.innerHTML = ""
      window.Calendly.initInlineWidget({
        url: `${url}?hide_gdpr_banner=1&background_color=${theme === 'dark' ? '1e293b' : 'ffffff'}&text_color=${theme === 'dark' ? 'f1f5f9' : '334155'}&primary_color=3b82f6`,
        parentElement: calendlyRef.current,
      })
    }

    return () => {
      // Cleanup is handled by Calendly itself
    }
  }, [url, theme])

  return (
    <div className="w-full">
      <div 
        ref={calendlyRef} 
        style={{ 
          minWidth: "320px", 
          height: height,
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid",
          borderColor: theme === 'dark' ? 'rgb(51 65 85)' : 'rgb(226 232 240)'
        }}
        className="bg-white dark:bg-slate-800 shadow-lg"
      />
    </div>
  )
} 