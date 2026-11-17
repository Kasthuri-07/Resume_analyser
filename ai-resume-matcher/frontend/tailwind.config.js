/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        csl: {
          blue: '#1455B8',
          'deep-blue': '#0B2E6F',
          gold: '#F5B83D',
          'light-gold': '#FFD45C',
          bg: '#FCFAF5',
          text: '#111111',
          muted: '#6B7280',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1455B8',
          700: '#0B2E6F',
          800: '#082152',
          900: '#051636',
        }
      },
      boxShadow: {
        'csl-card': '0 2px 8px -2px rgba(11, 46, 111, 0.05), 0 10px 24px -4px rgba(11, 46, 111, 0.07)',
        'csl-card-hover': '0 8px 16px -4px rgba(11, 46, 111, 0.08), 0 20px 32px -4px rgba(11, 46, 111, 0.12)',
        'csl-blue': '0 12px 28px -6px rgba(20, 85, 184, 0.32), 0 4px 12px -2px rgba(20, 85, 184, 0.18)',
        'csl-gold': '0 10px 24px -4px rgba(245, 184, 61, 0.30), 0 4px 10px -2px rgba(245, 184, 61, 0.18)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
