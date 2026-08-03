import type {MetadataRoute} from 'next';
import {localeDomains} from '@/i18n/routing';

/**
 * robots.txt, generated per request so the sitemap link points at the domain
 * the crawler actually arrived on.
 *
 * AI crawlers are named explicitly and split in two, because they are two
 * different questions:
 *
 * - Search and citation bots (OAI-SearchBot, ChatGPT-User, Claude-SearchBot,
 *   PerplexityBot, Google-Extended) fetch a page to answer a question and cite
 *   it. Allowing these is how the analyses get quoted with a link back.
 * - Training crawlers (GPTBot, ClaudeBot) take content into a model, where it
 *   surfaces later without attribution.
 *
 * Both are allowed. That is a decision, not a default: publishing every study
 * we read, including the ones that found nothing, only matters if the work can
 * travel. The cost is that a competitor can reach the same verified research
 * through a model. Flip the training crawlers to `disallow` if that trade stops
 * being worth it; the citation bots should stay allowed either way, since those
 * are what put the site in an answer with a source line.
 *
 * Account pages and checkout confirmations are excluded from everything: they
 * are private, and a confirmation page in an index is a page someone can reach
 * without having bought anything.
 */
const PRIVATE = ['/account', '/account/', '/shop/success', '/api/'];

const CITATION_BOTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended'
];

const TRAINING_BOTS = ['GPTBot', 'ClaudeBot', 'CCBot'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {userAgent: '*', allow: '/', disallow: PRIVATE},
      ...CITATION_BOTS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: PRIVATE
      })),
      ...TRAINING_BOTS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: PRIVATE
      }))
    ],
    // Both domains are listed on both, so a crawler that finds one finds the
    // other. They are separate sites to a search engine, linked by hreflang.
    sitemap: [
      `${localeDomains.en}/sitemap.xml`,
      `${localeDomains.nl}/sitemap.xml`
    ],
    host: localeDomains.en
  };
}
