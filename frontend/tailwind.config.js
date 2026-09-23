/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3faf7',
          100: '#dff6ef',
          500: '#0f766e',
          600: '#0b5d57',
          700: '#0a4d47'
        },
        accent: '#4c1d95',
        amber: '#b45309',
        charcoal: '#1f2937',
        warm: '#f5f1ea'
      },
      boxShadow: {
        soft: '0 10px 24px rgba(15,23,42,0.08)'
      }
    },
  },
  plugins: [],
};
