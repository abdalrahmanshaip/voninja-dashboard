/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5',
          light: '#6366f1',
          dark: '#4338ca',
        },
        secondary: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
        voninja: {
          DEFAULT: '#4b5563', // bg-gray-600
          light: '#6b7280',
          dark: '#374151',
        },
      },
      boxShadow: {
        card: '0 2px 5px 0 rgba(0, 0, 0, 0.16)',
      },
      transitionProperty: {
        height: 'height',
        spacing: 'margin, padding',
      },
    },
  },
  plugins: [],
}