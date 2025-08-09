"use client"

import { animations } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface StatCardProps {
  number: string
  label: string
  gradient: string
  className?: string
}

export function StatCard({ number, label, gradient, className }: StatCardProps) {
  return (
    <div className={cn(
      "group p-6 rounded-2xl bg-white/80 dark:bg-slate-800/20",
      animations.cardHover,
      className
    )}>
      <div className={cn(
        "text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-2",
        animations.iconHover,
        gradient
      )}>
        {number}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        {label}
      </div>
    </div>
  )
}
