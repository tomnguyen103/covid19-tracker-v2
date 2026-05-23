/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: {
    preflight: false,
  },
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
