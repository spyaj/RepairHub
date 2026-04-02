import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F6F3EE',
        'cream-2': '#EDE8DF',
        'cream-3': '#E3DDD2',
        green: '#1D4B20',
        'green-mid': '#2A6430',
        'green-soft': '#3F8447',
        'green-light': '#E6EFE7',
        'green-border': '#B8D4BA',
        amber: '#B35A1E',
        'amber-mid': '#D06D28',
        'amber-light': '#F4E8DC',
        'amber-border': '#E0B899',
        blue: '#1A4568',
        'blue-light': '#E2EDF6',
        'blue-border': '#A8C5DC',
        ink: '#1A1916',
        'ink-60': '#585650',
        'ink-40': '#8F8D87',
        'ink-20': '#C9C7C1',
        card: '#FDFCF9',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(26,25,22,.06), 0 1px 2px rgba(26,25,22,.04)',
        md: '0 4px 12px rgba(26,25,22,.08), 0 2px 4px rgba(26,25,22,.04)',
        lg: '0 12px 32px rgba(26,25,22,.10), 0 4px 8px rgba(26,25,22,.04)',
      },
      spacing: {
        4: '4px',
        6: '6px',
        8: '8px',
        10: '10px',
        12: '12px',
        14: '14px',
        16: '16px',
        20: '20px',
        24: '24px',
        28: '28px',
        32: '32px',
        36: '36px',
        40: '40px',
        48: '48px',
      },
      transitionTimingFunction: {
        'ease-custom': 'cubic-bezier(.4,0,.2,1)',
      },
    },
  },
  plugins: [],
};

export default config;
