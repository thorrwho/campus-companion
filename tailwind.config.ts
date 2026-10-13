import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#14306B',
          900: '#0B1F44',
        },
        accent: {
          100: '#E0F2FE',
          200: '#BAE6FD',
        },
        surface: '#FFFFFF',
        canvas: '#F6F8FB',
        border: '#E4E8EF',
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
        },
        status: {
          success: '#15803D',
          'success-bg': '#DCFCE7',
          warning: '#B45309',
          'warning-bg': '#FEF3C7',
          error: '#B91C1C',
          'error-bg': '#FEE2E2',
          info: '#1D4ED8',
          'info-bg': '#DBEAFE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        display: ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600' }],
        h2: ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        h3: ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        body: ['0.875rem', { lineHeight: '1.375rem', fontWeight: '400' }],
        small: ['0.8125rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        caption: ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
      },
      borderRadius: {
        button: '10px',
        input: '10px',
        card: '14px',
        modal: '18px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)',
        overlay: '0 10px 25px -5px rgba(15,23,42,0.12), 0 8px 10px -6px rgba(15,23,42,0.08)',
      },
      transitionTimingFunction: {
        'out-custom': 'cubic-bezier(0, 0, 0.2, 1)',
      },
      transitionDuration: {
        DEFAULT: '180ms',
      },
    },
  },
  plugins: [],
}

export default config
