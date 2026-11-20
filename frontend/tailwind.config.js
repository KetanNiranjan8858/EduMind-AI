/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF8F5',
          100: '#F4EFE6', // main canvas background
          200: '#EAE2D5',
          300: '#E0D4C3',
          400: '#D5C5B0',
        },
        sand: {
          50: '#FAF8F5',
          100: '#F5EFEB',
          200: '#E8DFCF', // pill badge background
          300: '#DCD2C0', // pill badge border
          400: '#C9BBA5',
          500: '#8C7E6A',
        },
        teal: {
          50: '#F2F6F6',
          100: '#E5ECEB',
          200: '#C9DCDA',
          600: '#235854',
          700: '#1C4946',
          800: '#173F3D', // main deep forest teal
          850: '#133533',
          900: '#102B2A',
        },
        // Semantic mappings so existing components harmonize with the warm cream / deep teal theme
        dark: {
          950: '#F4EFE6', // outer canvas
          900: '#FFFFFF', // panel card background
          850: '#FAF7F2', // soft card background
          800: '#F2EAE0', // subtle hover
          700: '#E6DFD3', // card borders
          600: '#DCD2C0', // chip borders
          500: '#C9BBA5',
        },
        slate: {
          50: '#FFFFFF',
          100: '#1C1917', // main headings (near black)
          200: '#292524', // primary text
          300: '#44403C', // secondary text
          400: '#78716C', // muted labels
          500: '#8C827A',
          600: '#A89F95',
          700: '#DCD2C0',
          800: '#E6DFD3', // soft card border
          850: '#E8DFCF', // pill badge
          900: '#173F3D',
        },
        brand: {
          50: '#F2F6F6',
          100: '#E5ECEB',
          400: '#235854',
          500: '#173F3D',
          600: '#173F3D',
          700: '#102B2A',
        },
        duo: {
          indigo: '#173F3D',
          indigoLight: '#235854',
          cyan: '#173F3D',
          cyanLight: '#235854',
        },
        gate: {
          purple: '#173F3D',
          rose: '#BE123C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
