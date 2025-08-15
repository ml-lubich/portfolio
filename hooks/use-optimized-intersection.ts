"use client"

import { useEffect, useRef, useCallback, useState } from "react"

interface UseOptimizedIntersectionOptions {
  threshold?: number | number[]
  rootMargin?: string
  triggerOnce?: boolean
  skip?: boolean
  delay?: number
}

interface IntersectionResult {
  ref: (node?: Element | null) => void
  inView: boolean
  entry?: IntersectionObserverEntry
}

// Shared intersection observer instance for better performance
let sharedObserver: IntersectionObserver | null = null
const observedElements = new Map<Element, Set<(entry: IntersectionObserverEntry) => void>>()

function getSharedObserver(options: IntersectionObserverInit): IntersectionObserver {
  const key = `${options.threshold}-${options.rootMargin}`
  
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const callbacks = observedElements.get(entry.target)
        if (callbacks) {
          callbacks.forEach(callback => callback(entry))
        }
      })
    }, options)
  }
  
  return sharedObserver
}

export function useOptimizedIntersection(
  options: UseOptimizedIntersectionOptions = {}
): IntersectionResult {
  const {
    threshold = 0.1,
    rootMargin = "0px",
    triggerOnce = false,
    skip = false,
    delay = 0
  } = options
  
  const [inView, setInView] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const elementRef = useRef<Element | null>(null)
  const hasTriggered = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  
  const setRef = useCallback((node?: Element | null) => {
    if (elementRef.current) {
      // Cleanup previous element
      const callbacks = observedElements.get(elementRef.current)
      if (callbacks) {
        callbacks.clear()
        observedElements.delete(elementRef.current)
        sharedObserver?.unobserve(elementRef.current)
      }
    }
    
    elementRef.current = node || null
    
    if (node && !skip) {
      const observer = getSharedObserver({ threshold, rootMargin })
      
      if (!observedElements.has(node)) {
        observedElements.set(node, new Set())
        observer.observe(node)
      }
      
      const callbacks = observedElements.get(node)!
      const callback = (intersectionEntry: IntersectionObserverEntry) => {
        const isInView = intersectionEntry.isIntersecting
        
        if (isInView && !hasTriggered.current) {
          if (delay > 0) {
            timeoutRef.current = setTimeout(() => {
              setInView(true)
              setEntry(intersectionEntry)
              if (triggerOnce) {
                hasTriggered.current = true
              }
            }, delay)
          } else {
            setInView(true)
            setEntry(intersectionEntry)
            if (triggerOnce) {
              hasTriggered.current = true
            }
          }
        } else if (!isInView && !triggerOnce) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
          }
          setInView(false)
          setEntry(intersectionEntry)
        }
      }
      
      callbacks.add(callback)
    }
  }, [threshold, rootMargin, triggerOnce, skip, delay])
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  
  return {
    ref: setRef,
    inView,
    entry
  }
}

// Cleanup utility - call this when unmounting components that used the hook
export function cleanupSharedObserver() {
  if (sharedObserver) {
    sharedObserver.disconnect()
    sharedObserver = null
    observedElements.clear()
  }
}