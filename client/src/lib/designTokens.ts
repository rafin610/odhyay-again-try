/* ODHYAY design system — quiet editorial, premium, minimal. */
export const colors = {
  // Neutral base
  background: "#111015",
  surface: "#16131c",
  elevated: "#1c1a27",
  border: "#2a273d",

  // Text
  text: "#f3eee6",
  mutedText: "#8f8996",
  subText: "#716a79",

  // Accent (Odhyay amethyst)
  accent: "#b7a4d7",
  accentHover: "#a895c7",
  accentLight: "#d1c8d5",

  // States
  success: "#a3be8c",
  warning: "#eBCB8B",
  error: "#BF616A",

  // Gradients / subtle
  gradientStart: "#24202a",
  gradientEnd: "#16131c",
} as const

export const typography = {
  display: {
    xs: "text-xs font-semibold uppercase tracking-[.18em]",
    sm: "text-sm font-medium tracking-[.15em]",
    md: "text-base font-medium tracking-[.14em]",
    lg: "text-lg font-medium tracking-[.13em]",
    xl: "text-xl font-semibold tracking-[.12em]",
    "2xl": "text-2xl font-semibold tracking-[.11em]",
    "3xl": "text-3xl font-display leading-[.90] tracking-[-.03em]",
    "4xl": "text-4xl font-display leading-[.85] tracking-[-.02em]",
    "5xl": "text-5xl font-display leading-[.80] tracking-[-.02em]",
    "6xl": "text-6xl font-display leading-[.75]",
  },
  body: {
    base: "text-base leading-relaxed",
    lg: "text-lg leading-relaxed",
    md: "text-md leading-relaxed",
    sm: "text-sm leading-relaxed",
    xs: "text-xs leading-relaxed",
  },
  caption: "text-xs text-[#8f8996] tracking-[.12em]",
  metadata: "text-sm text-[#a9a1ad] tracking-[.10em]",
} as const

export const spacing = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
} as const

export const borderRadius = {
  sm: "0.125rem",
  md: "0.25rem",
  lg: "0.5rem",
  xl: "0.75rem",
  full: "9999px",
} as const

export const shadow = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
} as const

export const zIndex = {
  base: 0,
  header: 50,
  overlay: 100,
  drawer: 200,
  modal: 300,
  toast: 400,
} as const