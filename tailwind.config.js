/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        dseg: ['DSEG14', 'monospace'],
      },
      colors: {
        'labo-orange': '#ff5a00',
        'labo-dark': '#1a1a1a',
      }
    },
  },
  plugins: [],
}