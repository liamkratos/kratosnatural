import type {Config} from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx,mdx}',
    './src/components/**/*.{ts,tsx,mdx}',
    './src/content/**/*.{md,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        kratos: {
          50: '#f4f7f4',
          100: '#e3ebe3',
          300: '#a8c0a8',
          500: '#4f7a4f',
          700: '#2f4a2f',
          900: '#1a2a1a'
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: [typography]
};

export default config;
