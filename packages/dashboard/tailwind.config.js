/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        glass: 'var(--bg-glass)',
        border: 'var(--border)',
        primary: 'var(--text-primary)',
        muted: 'var(--text-muted)',
        brand: {
          purple: '#9945FF',
          green: '#14F195',
        },
        verdict: {
          approve: '#14F195',
          escalate: '#F5A524',
          block: '#F31260',
        },
        score: {
          high: '#14F195',
          mid: '#F5A524',
          low: '#F31260',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}