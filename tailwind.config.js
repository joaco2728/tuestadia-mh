/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50:  '#fdf9f0',
          100: '#f7eedb',
          200: '#eedcb4',
          300: '#e2c47f',
          400: '#d4a84b',
          500: '#c4912a',
          600: '#a97620',
          700: '#875c1c',
          800: '#6d4a1e',
          900: '#5a3d1c',
        },
        ocean: {
          50:  '#f0f7ff',
          100: '#e0eefe',
          200: '#b9dcfd',
          300: '#7cc0fb',
          400: '#36a0f6',
          500: '#0c82e7',
          600: '#0065c4',
          700: '#00519f',
          800: '#054683',
          900: '#0a3b6d',
        },
        dusk: '#1a1f2e',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
