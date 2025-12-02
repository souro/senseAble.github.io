/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#06B6D4',
        danger: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.6875rem', { lineHeight: '1rem' }],      // 11px
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],   // 13px
        base: ['0.875rem', { lineHeight: '1.5rem' }],   // 14px
        lg: ['1rem', { lineHeight: '1.75rem' }],        // 16px
        xl: ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
        '2xl': ['1.25rem', { lineHeight: '2rem' }],     // 20px
        '3xl': ['1.5rem', { lineHeight: '2.25rem' }],   // 24px
      }
    },
  },
  plugins: [],
}
