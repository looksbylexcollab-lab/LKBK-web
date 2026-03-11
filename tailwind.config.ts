import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf8ee',
          100: '#f9edcf',
          200: '#f2d89b',
          300: '#e8bb60',
          400: '#dfa03a',
          500: '#c98528',
          600: '#b06a1e',
          700: '#8e521c',
          800: '#73421e',
          900: '#5f371c',
        },
      },
    },
  },
  plugins: [],
}

export default config
