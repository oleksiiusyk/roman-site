/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#DC2626', // red-600
        secondary: '#000000', // black
        accent: '#EF4444', // red-500
      },
      fontFamily: {
        'racing': ['Orbitron', 'sans-serif'],
        'space': ['Exo 2', 'sans-serif'],
      }
    },
  },
  plugins: [],
}