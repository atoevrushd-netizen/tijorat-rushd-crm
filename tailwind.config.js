/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-grad': 'var(--bg-grad)',
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        },
        elevated: 'var(--elevated)',
        // границы-разделители
        line: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-2)',
        },
        // текст (используем text-ink / text-ink-2 / text-ink-3)
        ink: {
          DEFAULT: 'var(--text)',
          2: 'var(--text-2)',
          3: 'var(--text-3)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          600: 'var(--accent-600)',
          700: 'var(--accent-700)',
          soft: 'var(--accent-soft)',
          ring: 'var(--accent-ring)',
        },
        'on-accent': 'var(--on-accent)',
        info: { DEFAULT: 'var(--info)', soft: 'var(--info-soft)' },
        warn: { DEFAULT: 'var(--warn)', soft: 'var(--warn-soft)' },
        danger: { DEFAULT: 'var(--danger)', soft: 'var(--danger-soft)' },
      },
      borderColor: {
        DEFAULT: 'var(--border)',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '22px',
        full: '999px',
      },
      fontFamily: {
        sans: ['Hanken Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        sh1: 'var(--sh-1)',
        sh2: 'var(--sh-2)',
        glow: 'var(--glow)',
      },
      transitionTimingFunction: {
        kit: 'cubic-bezier(.2,.8,.2,1)',
      },
      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { backgroundPosition: '-200% 0' },
        },
        ringPulse: {
          '0%': { boxShadow: '0 0 0 0 var(--accent-ring)' },
          '70%': { boxShadow: '0 0 0 12px rgba(59,130,246,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(59,130,246,0)' },
        },
        barGrow: {
          from: { transform: 'scaleY(.05)' },
          to: { transform: 'scaleY(1)' },
        },
      },
      animation: {
        rise: 'rise .25s cubic-bezier(.2,.8,.2,1) backwards',
        shimmer: 'shimmer 1.4s linear infinite',
        'ring-pulse': 'ringPulse 1.8s cubic-bezier(.2,.8,.2,1) infinite',
        'bar-grow': 'barGrow .6s cubic-bezier(.2,.8,.2,1) both',
      },
    },
  },
  plugins: [],
}
