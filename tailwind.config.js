// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          gold:    '#F5A623',
          amber:   '#E8890C',
          dim:     '#B87A10',
        },
        surface: {
          950: '#0A0B0D',
          900: '#111318',
          800: '#181B22',
          700: '#1F232E',
          600: '#272C3A',
        },
        accent: {
          green: '#00D48A',
          red:   '#FF4560',
          blue:  '#3B82F6',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        'gold-sm': '0 0 8px rgba(245,166,35,0.25)',
        'gold-md': '0 0 20px rgba(245,166,35,0.35)',
      },
    },
  },
  plugins: [],
}