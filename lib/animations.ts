// Standardized animation utilities following DRY principles

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
