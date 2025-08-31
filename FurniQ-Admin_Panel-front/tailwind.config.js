/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3a7c8c',
        secondary: '#e2b894',
        accent: '#c46d5e',
        light: '#f8f5f1',
        dark: '#2d3e40',
      }
    },
  },
  plugins: [],
}