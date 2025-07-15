/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Outfit', 'system-ui', 'sans-serif'],
        'mono': ['Space Grotesk', 'ui-monospace', 'monospace'],
        'display': ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Cores principais do tema escuro
        primary: {
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
          950: '#172554',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          850: '#1a1d24',
          900: '#111827',
          925: '#0f1419',
          950: '#0a0b0f',
        },
        // Cores customizadas baseadas nas variáveis CSS
        dark: {
          primary: '#0a0b0f',
          secondary: '#121419',
          tertiary: '#1a1d24',
          card: '#1e2128',
          hover: '#252832',
          border: '#2a2d36',
          'border-light': '#363a45',
        },
        text: {
          primary: '#ffffff',
          secondary: '#b4b8c4',
          muted: '#7c8396',
          accent: '#3b82f6',
        },
        accent: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
          green: '#10b981',
          orange: '#f59e0b',
          red: '#ef4444',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #1e2128 0%, #252832 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'sm-dark': '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        'md-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        'lg-dark': '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
        'xl-dark': '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'pulse-custom': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'loading': 'loading 1.5s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideIn: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        loading: {
          '0%': {
            backgroundPosition: '200% 0',
          },
          '100%': {
            backgroundPosition: '-200% 0',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
    },
  },
  plugins: [
    // Plugin personalizado para adicionar utilitários
    function({ addUtilities }) {
      const newUtilities = {
        '.text-gradient': {
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.glass-effect': {
          background: 'rgba(30, 33, 40, 0.8)',
          'backdrop-filter': 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.card-hover': {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            'box-shadow': '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            'border-color': '#3b82f6',
          },
        },
      }
      addUtilities(newUtilities)
    }
  ],
} 