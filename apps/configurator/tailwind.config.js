/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#f7d08a',
          DEFAULT: '#e2bf7f',
          dark: '#c59b4c'
        },
        rose: {
          light: '#f5c2b8',
          DEFAULT: '#e8a399',
          dark: '#c47d73'
        },
        platinum: {
          light: '#ffffff',
          DEFAULT: '#f4f4f6',
          dark: '#d6d6da'
        }
      }
    },
  },
  plugins: [],
}
