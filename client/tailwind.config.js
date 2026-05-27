/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Sets Poppins as default
      },
      colors: {
        primary: '#2563eb',
        dark: '#0f172a',
        light: '#F8FAFC',
      }
    },
  },
  plugins: [],
}
