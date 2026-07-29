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
        /**
         * Brand tokens.
         *
         * `pink` is an accent for dark surfaces: #FEB9FF on #0A0A0A passes
         * WCAG AA comfortably, but on white it lands around 1.4:1, so it must
         * not be used for body copy on light backgrounds. Use `ink` there.
         */
        black: '#0A0A0A',
        white: '#FFFFFF',
        pink: '#FEB9FF',
        ink: '#151515',
        cream: '#F7F5F3',

        // Superseded palette, still referenced by the existing components.
        // Being migrated page by page.
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
        // Handwriting display face: logo wordmark and large hero headings
        // only, in white/cream. Too thin to carry pink or small sizes.
        display: ['var(--font-display)', 'ui-serif', 'cursive'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Figures, data and source references.
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace']
      }
    }
  },
  plugins: [typography]
};

export default config;
