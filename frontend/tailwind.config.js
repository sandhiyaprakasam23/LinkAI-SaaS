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
        cyber: {
          900: '#070a12',
          850: '#0b0f19',
          800: '#0f172a',
          700: '#1e293b',
          border: 'rgba(255, 255, 255, 0.08)',
          glow: 'rgba(0, 245, 255, 0.15)',
        },
        neon: {
          cyan: '#00f5ff',
          purple: '#a855f7',
          pink: '#ec4899',
          emerald: '#10b981',
          blue: '#3b82f6',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glowPulse: {
          '0%': { boxShadow: '0 0 10px rgba(0, 245, 255, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 245, 255, 0.6), 0 0 40px rgba(168, 85, 247, 0.3)' },
        }
      }
    },
  },
  plugins: [],
}
