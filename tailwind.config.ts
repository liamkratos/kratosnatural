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
        /*
         * One face across the whole site. `sans` and `mono` deliberately point
         * at the same display font, so existing font-sans / font-mono classes
         * keep their meaning and the decision can be reversed by editing these
         * three lines rather than every component.
         */
        display: ['var(--font-display)', 'ui-serif', 'cursive'],
        sans: ['var(--font-display)', 'ui-serif', 'cursive'],
        mono: ['var(--font-display)', 'ui-serif', 'cursive'],
        // Article prose only, so a meta-analysis reads like a paper rather than
        // a poster. Everything outside `.prose` stays on the display face.
        reading: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        figures: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace']
      }
    }
  },
  plugins: [typography]
};

export default config;
