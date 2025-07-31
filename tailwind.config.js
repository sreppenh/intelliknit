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
          50: '#f0f9f0',   // Very light sage - for light backgrounds
          100: '#d1e4d1',  // Light backgrounds, selection states  
          200: '#b3d4b3',  // Borders, subtle accents
          300: '#94c594',  // Hover states, medium accents
          400: '#6fa76f',  // Medium emphasis
          500: '#4a8a4a',  // Primary buttons, main actions
          600: '#468146',  // Deep accents, hover states
          700: '#3a6b3a',  // Darker accents, text
          800: '#2d5a2d',  // Very dark accents
          900: '#1f3f1f',  // Darkest shade
          150: '#c2ddc2',  // NEW - Between sage-100 and sage-200  
          250: '#a3cda3',  // NEW - Between sage-200 and sage-300
          350: '#84be84',  // NEW - Between sage-300 and sage-400
          75: '#e0f1e0',   // 🆕 NEW - Between sage-50 and sage-100
        },
        yarn: {
          50: '#fefdf8',   // Very light cream/beige - warm background
          100: '#fdefc4',  // Light backgrounds, warm accents
          200: '#fce49a',  // Borders, subtle warm accents
          300: '#fad970',  // Hover states, medium warm accents
          400: '#f8ce46',  // Medium emphasis
          500: '#d4a832',  // Medium yarn color
          600: '#b8761a',  // Accent buttons, highlights
          700: '#a66914',  // Darker orange
          800: '#8a5511',  // Very dark warm accent
          900: '#6d410d',  // Darkest warm shade
          150: '#fde7af',  // NEW - Between yarn-100 and yarn-200
          250: '#fbe085',  // NEW - Between yarn-200 and yarn-300 
          75: '#fef6de',   // 🆕 NEW - Between yarn-50 and yarn-100
        },
        wool: {
          50: '#fafafa',   // Very light gray
          100: '#f4f4f5',  // Card backgrounds, light surfaces
          200: '#e4e4e7',  // Borders, dividers
          300: '#d4d4d8',  // Subtle borders, disabled states
          400: '#9ca3af',  // Light text (use sparingly)
          500: '#6b7280',  // Secondary text, placeholders
          600: '#52525b',  // Medium emphasis text
          700: '#374151',  // Primary text, headings
          800: '#1f2937',  // Very dark text
          900: '#111827',  // Darkest text
          25: '#fcfcfc',   // NEW - Very light (between wool-50 and white)
          75: '#f7f7f8',   // NEW - Between wool-50 and wool-100
        },
        // Lavender accent color - enhanced with more shades
        lavender: {
          50: '#faf7ff',   // Very light backgrounds
          100: '#f3ebff',  // Light backgrounds, info states
          200: '#e5d4ff',  // Borders, subtle accents
          300: '#d7c3ff',  // Hover states, medium accents
          400: '#c9b2ff',  // Medium emphasis
          500: '#8b5dff',  // Information, cool accents
          600: '#7c4dff',  // Active states, links
          700: '#6d3eff',  // Darker accent
          800: '#5e2fdf',  // Very dark accent
          900: '#4f20bf',  // Darkest shade
          75: '#f7f1ff',   // NEW
          150: '#eee0ff',  // NEW - Between lavender-100 and lavender-200

        },
        // Enhanced semantic colors
        red: {
          50: '#fef2f2',   // Very light red backgrounds
          100: '#fee2e2',  // Light red backgrounds
          200: '#fecaca',  // Light red borders
          300: '#fca5a5',  // Medium light red
          400: '#f87171',  // Medium red
          500: '#ef4444',  // Standard red
          600: '#dc2626',  // Dark red
          700: '#b91c1c',  // Darker red
          800: '#991b1b',  // Very dark red
          900: '#7f1d1d',  // Darkest red
          75: '#feeaea', // new red
        },
        // Additional semantic colors for future use
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },

        orange: {
          50: '#fff7ed',  // very light
          75: '#ffeedf',  // custom value: between 50 and 100
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },



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
      },
      // Enhanced spacing system
      spacing: {
        '18': '4.5rem',   // Between 4rem and 5rem
        '22': '5.5rem',   // Between 5rem and 6rem
        '26': '6.5rem',   // Between 6rem and 7rem
        '30': '7.5rem',   // Between 7rem and 8rem
      },
      // Custom border radius for consistency
      borderRadius: {
        'xl': '0.75rem',   // 12px - your standard card radius
        '2xl': '1rem',     // 16px - larger cards
        '3xl': '1.5rem',   // 24px - very large elements
      },
      // Enhanced shadows for your design system
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        // Custom shadows for your components
        'card': '0 2px 4px -1px rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 8px 16px -4px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
      },
      // Animation timing for consistency
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      }
    },
  },
  plugins: [],
}