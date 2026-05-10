// HydroSense Design System - Dark Botanical Luxury Theme

export const Colors = {
  // Primary Palette
  background: '#06111E',
  surface: '#0D1F35',
  surfaceElevated: '#122540',
  surfaceHigh: '#1A3050',

  // Brand Colors
  primary: '#00D4A1',       // Emerald teal
  primaryDark: '#00A87E',
  primaryLight: '#33DDBB',
  primaryGlow: 'rgba(0, 212, 161, 0.15)',

  secondary: '#4FACFE',     // Electric blue
  secondaryDark: '#2E8FE0',
  secondaryGlow: 'rgba(79, 172, 254, 0.15)',

  accent: '#F7B731',        // Warm amber
  accentGlow: 'rgba(247, 183, 49, 0.15)',

  danger: '#FF5E6C',
  dangerGlow: 'rgba(255, 94, 108, 0.15)',

  warning: '#FFA94D',
  warningGlow: 'rgba(255, 169, 77, 0.15)',

  success: '#00D4A1',
  info: '#4FACFE',

  // Text
  textPrimary: '#F0F8FF',
  textSecondary: '#8BA8C4',
  textMuted: '#4D6B8A',
  textInverse: '#06111E',

  // Borders
  border: 'rgba(255,255,255,0.07)',
  borderActive: 'rgba(0, 212, 161, 0.4)',

  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#00D4A1', '#0099CC'],
  gradientSurface: ['#0D1F35', '#06111E'],
  gradientHero: ['#0A2340', '#061828'],
  gradientDanger: ['#FF5E6C', '#CC2836'],
  gradientWarning: ['#FFA94D', '#E08020'],
  gradientAmber: ['#F7B731', '#E09000'],
};

export const Typography = {
  // Font families
  display: 'serif',     // Will use system serif for bold headers
  body: 'sans-serif',

  // Sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 38,
  hero: 48,

  // Weights
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '900',

  // Line heights
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  section: 64,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const Shadow = {
  primary: {
    shadowColor: '#00D4A1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  secondary: {
    shadowColor: '#4FACFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
};
