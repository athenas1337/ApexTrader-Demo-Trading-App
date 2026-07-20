/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0b0e14',
          800: '#121722',
          700: '#1a2130',
          600: '#252e42',
          500: '#323f59',
        },
        trade: {
          green: '#00c076',
          'green-hover': '#00a364',
          red: '#ff4d52',
          'red-hover': '#e03e43',
          accent: '#3b82f6',
          gold: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-green': 'glowGreen 2s ease-in-out infinite alternate',
        'glow-red': 'glowRed 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glowGreen: {
          '0%': { boxShadow: '0 0 5px rgba(0, 192, 118, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 192, 118, 0.6)' },
        },
        glowRed: {
          '0%': { boxShadow: '0 0 5px rgba(255, 77, 82, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 77, 82, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
