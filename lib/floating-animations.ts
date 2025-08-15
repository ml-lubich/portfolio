/**
 * Consolidated animation utilities for consistent DRY implementation
 * Includes floating animations, scroll-synced waves, and standard transitions
 */

export type FloatingVariant = 'subtle' | 'medium' | 'bounce' | 'gentle'
export type ScrollSyncMode = 'onScroll' | 'onView' | 'always' | 'wave'

// Import existing animations for consolidation
export const animations = {
  // Transition durations - standardized across all components
  fast: "duration-100",
  normal: "duration-150", 
  slow: "duration-200",
  
  // Common hover effects
  hoverScale: "hover:scale-105",
  hoverScaleLarge: "hover:scale-110",
  hoverShadow: "hover:shadow-xl",
  hoverShadowLarge: "hover:shadow-2xl",
  
  // Transition combinations
  scaleTransition: "transition-transform duration-100",
  allTransition: "transition-all duration-100",
  allTransitionNormal: "transition-all duration-150",
  
  // Card hover effects
  cardHover: "hover:shadow-2xl hover:scale-105 transition-all duration-100",
  buttonHover: "hover:scale-105 transition-all duration-100",
  iconHover: "group-hover:scale-110 transition-transform duration-100",
  
  // Gradient button base
  gradientButton: "border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-100",
  
  // Outline button base  
  outlineButton: "border-2 bg-white/10 dark:bg-slate-800/20 backdrop-blur-sm hover:scale-105 transition-all duration-100",
} as const

export const gradients = {
  primary: "from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
  secondary: "from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
  tertiary: "from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
} as const

export interface FloatingAnimationConfig {
  variant: FloatingVariant
  delay?: number
  scrollSync?: ScrollSyncMode
}

/**
 * Gets the appropriate floating animation class based on variant and delay
 */
export function getFloatingAnimation(config: FloatingAnimationConfig): string {
  const { variant, delay = 0 } = config
  
  const baseClass = getFloatingVariantClass(variant)
  const delayClass = getDelayClass(delay)
  
  return `${baseClass} ${delayClass}`.trim()
}

/**
 * Gets floating animation class for a specific variant
 */
function getFloatingVariantClass(variant: FloatingVariant): string {
  const variantMap: Record<FloatingVariant, string> = {
    subtle: 'animate-float-subtle',
    medium: 'animate-float-medium', 
    bounce: 'animate-float-bounce',
    gentle: 'animate-gentle-float'
  }
  
  return variantMap[variant]
}

/**
 * Gets delay class for animation timing
 */
function getDelayClass(delay: number): string {
  if (delay === 0) return ''
  
  const delayMap: Record<number, string> = {
    200: 'animation-delay-200',
    400: 'animation-delay-400',
    600: 'animation-delay-600',
    800: 'animation-delay-800',
    1000: 'animation-delay-1000',
    1200: 'animation-delay-1200',
    1500: 'animation-delay-1500',
    2000: 'animation-delay-2000'
  }
  
  return delayMap[delay] || ''
}

/**
 * Gets floating animation for carousel items with automatic variant cycling
 */
export function getCarouselFloatingAnimation(index: number, baseDelay: number = 0): string {
  const variants: FloatingVariant[] = ['subtle', 'medium', 'bounce', 'gentle']
  const variant = variants[index % variants.length]
  const delay = baseDelay + (index * 200)
  
  return getFloatingAnimation({ variant, delay })
}

/**
 * Gets floating animation for grid items (like about cards)
 */
export function getGridFloatingAnimation(index: number, baseDelay: number = 200): string {
  const variants: FloatingVariant[] = ['subtle', 'medium', 'bounce', 'gentle']
  const variant = variants[index % variants.length]
  const delay = baseDelay + (index * 400)
  
  return getFloatingAnimation({ variant, delay })
}

/**
 * Utility function to create scroll-synchronized floating animations for icons
 */
export function createScrollSyncIconFloat(
  variant: FloatingAnimationConfig['variant'],
  delay: number = 0,
  scrollSync: ScrollSyncMode = 'onView'
) {
  return {
    variant,
    delay,
    scrollSync
  }
}

/**
 * Creates wave-based floating animation for smooth scroll transitions
 */
export function createWaveFloat(
  variant: FloatingAnimationConfig['variant'],
  delay: number = 0
) {
  return {
    variant,
    delay,
    scrollSync: 'wave' as const
  }
}

/**
 * Predefined floating animation configurations for common use cases
 */
export const floatingPresets = {
  aboutCards: (index: number) => getGridFloatingAnimation(index, 200),
  skillIcons: () => getFloatingAnimation({ variant: 'subtle' }),
  projectIcons: () => getFloatingAnimation({ variant: 'bounce' }),
  researchIcons: () => getFloatingAnimation({ variant: 'medium' }),
  timelineDots: () => getFloatingAnimation({ variant: 'subtle' }),
  heroElements: (index: number) => getFloatingAnimation({ 
    variant: 'gentle', 
    delay: index * 500 
  }),
  // Wave-based presets for smooth scroll transitions
  waveCards: (index: number) => createWaveFloat('subtle', index * 100),
  waveIcons: (index: number) => createWaveFloat('medium', index * 150),
  waveElements: (index: number) => createWaveFloat('gentle', index * 200)
}