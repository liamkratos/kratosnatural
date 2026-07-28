# Kratos Natural

Next.js 14 (App Router) + TypeScript + Tailwind CSS, with next-intl for
domain-based internationalisation.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Locally the production domains do not match, so routing falls back to path
prefixes: http://localhost:3000/en and http://localhost:3000/nl.

## Structure

```
messages/                 UI translations (en.json, nl.json)
src/app/[locale]/         all pages, one segment per locale
src/components/           shared UI components
src/content/en/           MDX articles (English)
src/content/nl/           MDX articles (Dutch)
src/i18n/                 routing config, request config, navigation helpers
src/lib/                  Stripe client, Schema.org builders, SEO helpers
src/middleware.ts         applies the locale/domain routing
```

## Internationalisation

Locales are `en` (default) and `nl`.

**Domain routing is configured in `src/i18n/routing.ts`, not in
`next.config.js`.** The `i18n.domains` option in `next.config.js` is a Pages
Router feature and has no effect in the App Router; next-intl's middleware does
the equivalent work:

| Domain             | Locale | URL shape                        |
| ------------------ | ------ | -------------------------------- |
| `kratosnatural.com`| `en`   | `kratosnatural.com/articles`     |
| `kratosnatural.nl` | `nl`   | `kratosnatural.nl/articles`      |

Because each domain declares exactly one locale and `localePrefix` is
`as-needed`, production URLs carry no locale prefix while still resolving to the
`[locale]` segment internally.

Always import `Link`, `redirect`, `usePathname` and `useRouter` from
`@/i18n/navigation` rather than from `next/link` or `next/navigation`, so the
domain strategy is applied consistently.

### Adding a locale

1. Add it to `locales` in `src/i18n/routing.ts` and, if it gets its own domain,
   to `routing.domains` and `localeDomains`.
2. Add `messages/<locale>.json`.
3. Add `src/content/<locale>/`.

## Content

Articles are MDX files in `src/content/<locale>/`. The filename is the slug.
Required frontmatter is `title` and `date`; `description`, `updated`, `author`,
`image`, `tags` and `draft` are optional. Drafts render in development and are
excluded from production builds.

Article slugs are independent per locale — the Dutch translation of an article
can have a Dutch slug. When linking between them, pass an explicit per-locale
pathname map to `buildMetadata({alternates})` so hreflang stays correct.

## Environment variables

See `.env.example`. `STRIPE_SECRET_KEY` is only read when `getStripe()` is
called, so builds succeed without it.

## Scripts

| Script                 | Purpose                          |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Development server               |
| `npm run build`        | Production build                 |
| `npm run start`        | Serve the production build       |
| `npm run lint`         | ESLint                           |
| `npm run typecheck`    | TypeScript, no emit              |
| `npm run format`       | Prettier write                   |
| `npm run format:check` | Prettier check                   |

## Local domain testing

To exercise real domain routing locally, point the hostnames at your machine in
`/etc/hosts` and browse to `http://kratosnatural.com:3000`. Note that
`routing.domains` matches on hostname only, so the port does not interfere.

```
127.0.0.1 kratosnatural.com
127.0.0.1 kratosnatural.nl
```
