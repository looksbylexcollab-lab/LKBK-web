import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Legacy tokens kept for backward compat
        pearl: {
          50:  '#FDFCFA',
          100: '#FAF8F5',
          200: '#F5EFE6',
          300: '#EDE5D8',
          400: '#DDD3C4',
        },
        gold: {
          50:  '#FBF6E3',
          100: '#F5E7B2',
          200: '#E8CA6A',
          300: '#D4AF37',
          400: '#C9A42E',
          500: '#B8940C',
          600: '#9A7B0A',
        },
        charcoal: {
          DEFAULT: '#1C1C1A',
          light:   '#2E2E2C',
          muted:   '#6B6B67',
        },
        // New warm cream design system
        cream: {
          50:  '#FDFCFB',
          100: '#F8F5F0',
          200: '#F2EDE6',
          300: '#EAE4DC',
          400: '#DDD6CC',
          500: '#C5BDB3',
        },
        bark: {
          DEFAULT: '#1C1916',
          light:   '#2E2B27',
          muted:   '#7A7268',
          subtle:  '#A09690',
        },
        tan: {
          200: '#C4B49E',
          300: '#A0896E',
          400: '#8B7355',
          500: '#7A6448',
        },
      },
      fontFamily: {
        sans:  ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', "'Playfair Display'", 'Georgia', 'serif'],
      },
      letterSpacing: {
        luxury: '0.25em',
        wide:   '0.15em',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
