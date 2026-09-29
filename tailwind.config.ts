import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        cream: 'rgb(var(--cream) / <alpha-value>)',
        sand: 'rgb(var(--sand) / <alpha-value>)',
        paper: 'rgb(var(--paper) / <alpha-value>)',
        brand: 'rgb(var(--brand) / <alpha-value>)',
        brandDark: 'rgb(var(--brand-dark) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        chrome: 'rgb(var(--chrome) / <alpha-value>)',
        footer: 'rgb(var(--footer) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-text)'],
        serif: ['var(--font-text)'],
      },
      spacing: {
        page: 'var(--space-page)',
        section: 'var(--space-section)',
        stack: 'var(--space-stack)',
      },
      maxWidth: {
        page: 'var(--measure)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
      },
    },
  },
  plugins: [],
};

export default config;
