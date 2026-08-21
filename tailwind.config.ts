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
         * the header, buttons, markers, the footer. White is the accent on it:
         * cream was warmer but read as slightly dirty at small sizes, and this
         * is a brand that has to look clean.
         *
         * This green is the midpoint of the two that were tried on the way to
         * it: #3E4A2C was too dark and #55663D too light. Both are written
         * down because a colour change loses exactly one thing — the value you
         * might want back.
         *
         * On a light surface the accent must be `olive` — white on white is
         * nothing. `oliveSoft` is the hover for olive fills, where lightening
         * the fill reads as a state change without introducing a third hue.
         *
         * `pink` is the accent on those dark surfaces: hovers, focus rings,
         * markers, the wordmark on the hero, the slider titles, the badge on a
         * product photo. About 5:1 on olive. It is 1.4:1 on white, so on a
         * light surface the accent is `olive` and reaching for pink is a bug.
         */
        black: '#0A0A0A',
        white: '#FFFFFF',
        olive: '#495834',
        oliveSoft: '#607445',
        pink: '#FEB9FF',
        ink: '#151515',

        /**
         * Review stars, and nothing else.
         *
         * Deliberately outside the brand palette rather than added to it. A
         * star is a borrowed convention: people read a row of gold stars as a
         * rating before they read anything around it, and rendering them in
         * `olive` made them look like a decorative motif instead. This is the
         * one place the site speaks somebody else's visual language on purpose.
         *
         * Kept out of every other component for the same reason — the moment
         * gold shows up on a button it stops meaning "rating".
         *
         * On contrast: at roughly 1.9:1 on white this would fail as the sole
         * carrier of meaning. It is not one. The rating is stated in words
         * beside it ("5 van de 5, uit 2 Google-reviews"), so the stars are a
         * second reading of a fact already written out.
         */
        gold: '#F0B429',

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
         * Two faces on the whole site, and no more.
         *
         * `display` is Covered By Your Grace, a connected handwriting script.
         * It is for things that are *looked at* — page titles, section
         * headings, the wordmark, nav and buttons — and it carries the
         * sketchbook character the brand is built on. Below roughly 20px a
         * connected script stops giving a word the outline an eye scans for,
         * so it never goes on running text.
         *
         * Everything else is Poppins. `sans` and `mono` used to alias the
         * script, which quietly put handwriting on the announcement bar, VAT
         * lines, spec labels and bylines; they point at Poppins now, so a
         * `font-mono` label is upright and readable while keeping the
         * uppercase, letter-spaced treatment that makes it read as a label.
         *
         * Adding a third face is the thing to resist. Two is the brand.
         */
        display: ['var(--font-display)', 'ui-serif', 'cursive'],
        sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Article prose. Same face; the `.paper` stylesheet handles the rest.
        reading: [
          'var(--font-body)',
          'ui-sans-serif',
          'system-ui',
          'sans-serif'
        ]
      }
    }
  },
  plugins: [typography]
};

export default config;
