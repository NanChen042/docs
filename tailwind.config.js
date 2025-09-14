/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./docs/**/*.{vue,js,ts,jsx,tsx,md}",
    "./docs/.vitepress/**/*.{vue,js,ts,jsx,tsx}",
    "./docs/.vitepress/theme/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      zIndex: {
        '1': '1',
      },
      maxWidth: {
        '1400': '1400px',
      }
    },
  },
  plugins: [],
}
