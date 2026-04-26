import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'hawkins-red': '#C62828',
        'hawkins-amber': '#F57F17',
        'upside-blue': '#1A237E',
        dim: '#0D0D14',
      },
      fontFamily: {
        display: ['"ITC Benguiat Std"', '"Special Elite"', 'serif'],
        body: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
