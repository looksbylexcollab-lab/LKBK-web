import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
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
      },
      fontFamily: {
        sans: ['Calibri', 'Candara', "'Segoe UI'", "'Trebuchet MS'", 'sans-serif'],
      },
      letterSpacing: {
        luxury: '0.25em',
        wide:   '0.15em',
      },
    },
  },
  plugins: [],
}

export default config
