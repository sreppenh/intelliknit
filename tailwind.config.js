/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // IntelliKnit Design System Colors
        sage: {
          50: '#f0f9f0',   // Very light sage (if needed)
          100: '#d1e4d1',  // Light backgrounds, selection states
          500: '#4a8a4a',  // Primary buttons, main actions
          600: '#468146',  // Deep accents, hover states
          700: '#3a6b3a',  // Darker accents (if needed)
        },
        yarn: {
          50: '#fefdf8',   // Very light cream/beige - warm background
          100: '#fdefc4',  // Light backgrounds, warm accents
          600: '#b8761a',  // Accent buttons, highlights
          700: '#a66914',  // Darker orange (if needed)
        },
        wool: {
          50: '#fafafa',   // Very light (if needed)
          100: '#f4f4f5',  // Card backgrounds, light surfaces
          400: '#9ca3af',  // Light text (use sparingly)
          500: '#6b7280',  // Secondary text, placeholders
          700: '#374151',  // Primary text, headings
          800: '#1f2937',  // Very dark text (if needed)
        },
        // NEW: Lavender accent color
        lavender: {
          50: '#faf7ff',   // Very light backgrounds
          100: '#f3ebff',  // Light backgrounds, info states
          200: '#e5d4ff',  // Borders, subtle accents
          500: '#8b5dff',  // Information, cool accents
          600: '#7c4dff',  // Active states, links
        },
        // Semantic colors
        red: {
          500: '#ef4444',
          600: '#dc2626',
        }
      },
      fontFamily: {
        'sans': [
          '-apple-system',
          'BlinkMacSystemFont', 
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif'
        ]
      }
    },
  },
  plugins: [],
}