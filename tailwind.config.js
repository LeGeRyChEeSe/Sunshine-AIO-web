/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        sunshine: {
          violet: '#4c1d95',
          indigo: '#312e81',
          blue: '#1e3a8a',
        },
      },
      backgroundImage: {
        'gradient-sunshine':
          'linear-gradient(135deg, #4c1d95 0%, #312e81 50%, #1e3a8a 100%)',
      },
    },
  },
  plugins: [],
};