"use client"

import React from 'react'

interface PerformanceMetrics {
  fps: number
  memoryUsage: number
  paintTime: number
  scriptDuration: number
  renderBlocking: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 60,
    memoryUsage: 0,
    paintTime: 0,
    scriptDuration: 0,
    renderBlocking: 0
  }
  
  private frameCount = 0
  private lastTime = 0
  private observers: ((metrics: PerformanceMetrics) => void)[] = []
  private isMonitoring = false
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.init()
    }
  }
  
  private init() {
    // Monitor FPS using requestAnimationFrame
    const measureFPS = (currentTime: number) => {
      if (this.lastTime === 0) {
        this.lastTime = currentTime
      }
      
      this.frameCount++
      
      if (currentTime - this.lastTime >= 1000) {
        this.metrics.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime))
        this.frameCount = 0
        this.lastTime = currentTime
        this.notifyObservers()
      }
      
      if (this.isMonitoring) {
        requestAnimationFrame(measureFPS)
      }
    }
    
    if (this.isMonitoring) {
      requestAnimationFrame(measureFPS)
    }
    
    // Monitor memory usage (if available)
    this.updateMemoryUsage()
    
    // Monitor paint performance using PerformanceObserver
    if ('PerformanceObserver' in window) {
      try {
        // Monitor paint events
        const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.paintTime = entry.startTime
            }
          })
          this.notifyObservers()
        })
        paintObserver.observe({ entryTypes: ['paint'] })
        
        // Monitor script execution time
        const measureObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (entry.entryType === 'measure') {
              this.metrics.scriptDuration = entry.duration
            }
          })
          this.notifyObservers()
        })
        measureObserver.observe({ entryTypes: ['measure'] })
        
        // Monitor long tasks (render blocking)
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.metrics.renderBlocking += entry.duration
            }
          })
          this.notifyObservers()
        })
        longTaskObserver.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        // PerformanceObserver not supported in some browsers
        console.warn('PerformanceObserver not fully supported')
      }
    }
  }
  
  private updateMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.metrics.memoryUsage = memory.usedJSHeapSize / (1024 * 1024) // MB
    }
  }
  
  private notifyObservers() {
    this.observers.forEach(observer => observer(this.metrics))
  }
  
  public startMonitoring() {
    this.isMonitoring = true
    if (typeof window !== 'undefined') {
      this.init()
    }
  }
  
  public stopMonitoring() {
    this.isMonitoring = false
  }
  
  public subscribe(callback: (metrics: PerformanceMetrics) => void) {
    this.observers.push(callback)
    return () => {
      const index = this.observers.indexOf(callback)
      if (index > -1) {
        this.observers.splice(index, 1)
      }
    }
  }
  
  public getMetrics(): PerformanceMetrics {
    this.updateMemoryUsage()
    return { ...this.metrics }
  }
  
  public markStart(name: string) {
    if ('performance' in window && performance.mark) {
      performance.mark(`${name}-start`)
    }
  }
  
  public markEnd(name: string) {
    if ('performance' in window && performance.mark && performance.measure) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
    }
  }
  
  public getPerformanceScore(): 'good' | 'needs-improvement' | 'poor' {
    const { fps, memoryUsage, renderBlocking } = this.metrics
    
    if (fps >= 55 && memoryUsage < 50 && renderBlocking < 100) {
      return 'good'
    } else if (fps >= 30 && memoryUsage < 100 && renderBlocking < 300) {
      return 'needs-improvement'  
    } else {
      return 'poor'
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    paintTime: 0,
    scriptDuration: 0,
    renderBlocking: 0
  })
  
  React.useEffect(() => {
    performanceMonitor.startMonitoring()
    const unsubscribe = performanceMonitor.subscribe(setMetrics)
    
    return () => {
      performanceMonitor.stopMonitoring()
      unsubscribe()
    }
  }, [])
  
  return {
    metrics,
    score: performanceMonitor.getPerformanceScore(),
    markStart: performanceMonitor.markStart.bind(performanceMonitor),
    markEnd: performanceMonitor.markEnd.bind(performanceMonitor)
  }
}

