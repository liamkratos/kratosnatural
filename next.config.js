const createNextIntlPlugin = require('next-intl/plugin');

// Points the plugin at the request config that resolves locale + messages.
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Domain-based routing note
 * -------------------------
 * The `i18n` key in this file (with its `domains` option) is a **Pages Router**
 * feature and is ignored by the App Router. Domain -> locale mapping therefore
 * lives in `src/i18n/routing.ts` and is applied by `src/middleware.ts`:
 *
 *   kratosnatural.com -> locale "en"
 *   kratosnatural.nl  -> locale "nl"
 *
 * Adding an `i18n` block here would break the build, so don't.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  images: {
    remotePatterns: [
      {protocol: 'https', hostname: 'kratosnatural.com'},
      {protocol: 'https', hostname: 'kratosnatural.nl'}
    ]
  }
};

module.exports = withNextIntl(nextConfig);
