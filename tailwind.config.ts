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
         * `olive` is the brand's main colour and carries every dark surface:
         * the header, buttons, markers, the footer. `cream` is the accent that
         * sits on it — #EDE3D1 on #3E4A2C is about 8:1, comfortably past WCAG
         * AA for body copy.
         *
         * The pairing only works in that direction. Cream on white is roughly
         * 1.1:1, so an accent on a light surface must be `olive`, never cream.
         * `oliveSoft` is for hover on olive fills, where a plain lightening
         * reads as a state change without introducing a third hue.
         */
        black: '#0A0A0A',
        white: '#FFFFFF',
        olive: '#3E4A2C',
        oliveSoft: '#55663D',
        ink: '#151515',
        cream: '#EDE3D1',

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
        // Running text outside headings. See the note in layout.tsx.
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        figures: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace']
      }
    }
  },
  plugins: [typography]
};

export default config;
