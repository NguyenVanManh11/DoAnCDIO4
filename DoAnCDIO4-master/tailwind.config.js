/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'coffee-bg': '#f7f4e9',
        'coffee-grid': '#e8e5d6',
        'coffee-green': '#307848',
        'coffee-yellow': '#dfb252',
        'coffee-dark': '#3b2c25',
        'coffee-cup': '#f3e1a9'
      },
      fontFamily: {
        'sans': ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
