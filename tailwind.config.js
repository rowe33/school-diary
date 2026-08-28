/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"Inter"',
          'system-ui',
          'sans-serif'
        ]
      },
      colors: {
        accent: {
          DEFAULT: '#0A84FF',
          light: '#409CFF',
          dark: '#0060DF'
        },
        surface: {
          light: 'rgba(255, 255, 255, 0.72)',
          dark: 'rgba(30, 30, 34, 0.72)'
        }
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0, 0, 0, 0.08)',
        'soft-dark': '0 8px 30px rgba(0, 0, 0, 0.4)',
        card: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)'
      },
      borderRadius: {
        xl2: '1.25rem'
      }
    }
  },
  plugins: []
}
