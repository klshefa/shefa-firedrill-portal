/**
 * Shared Tailwind CSS Preset for Shefa School Portals
 * 
 * This preset provides:
 * - Standard Shefa color palette
 * - Inter font configuration
 * - Standard spacing, border radius, shadows
 * - Standard animations
 * 
 * Copied from DESIGN_SYSTEM/tailwind.preset.js for deployment compatibility
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        shefa: {
          blue: {
            50: '#eef7ff',
            100: '#d9edff',
            200: '#bce0ff',
            300: '#8ecdff',
            400: '#53b3ff',
            500: '#3898ec',  // PRIMARY
            600: '#2a7acc',
            700: '#1e5fa3',
            800: '#164a7a',  // Headers
            900: '#0f3652',
          },
          green: {
            50: '#f4fbea',
            100: '#e5f5cf',
            200: '#cceaa5',
            300: '#b8e27a',
            400: '#a4d65d',  // PRIMARY
            500: '#8bc34a',
            600: '#6fa336',
            700: '#547c29',
          },
          gold: {
            light: '#ffc940',
            DEFAULT: '#f5a623',
            dark: '#d48806',
          },
          red: {
            light: '#fef2f2',
            DEFAULT: '#e74c3c',
            dark: '#c0392b',
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
}
