/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          300: '#5eebca', 400: '#2dd4b0',
          500: '#14b897', 600: '#0d9279',
          700: '#0f7462',
        },
        surface: {
          950: '#070b0f', 900: '#0d1117',
          800: '#131920', 700: '#1a2230',
          600: '#1e2a3a',
        },
      },
      animation: {
        'fade-up':   'fadeUp 0.55s cubic-bezier(.16,1,.3,1) both',
        'fade-in':   'fadeIn 0.35s ease both',
        'spin-slow': 'spinSlow 1s linear infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity:'0', transform:'translateY(22px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        fadeIn:   { from: { opacity:'0' }, to: { opacity:'1' } },
        spinSlow: { to: { transform:'rotate(360deg)' } },
      },
    },
  },
  plugins: [],
}
