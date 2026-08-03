import Image from 'next/image';
import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import PolicyMenu from '@/components/PolicyMenu';
import Container from '@/components/Container';

/**
 * Footer modelled on liamkratos.nl: logo and social icons on black, then a
 * full-bleed pink rule with the policy links beneath it.
 *
 * The mailing-list signup lives in <Newsletter />, in its own section above the
 * footer, so it reads as part of the page rather than as footer furniture.
 *
 * The policy list is collapsed to a single label and expands on hover. It also
 * expands on keyboard focus (focus-within), because a hover-only disclosure is
 * unreachable by keyboard and invisible to touch.
 */

/** The two markets run separate Instagram accounts. */
const instagram = {
  en: 'https://www.instagram.com/kratos.natural/',
  nl: 'https://www.instagram.com/kratos_natural/'
} as const;

const socials = [
  {
    label: 'Instagram',
    href: instagram.en,
    path: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.4A6.4 6.4 0 1 0 18.4 12 6.4 6.4 0 0 0 12 5.6zm0 10.6A4.2 4.2 0 1 1 16.2 12 4.2 4.2 0 0 1 12 16.2zm6.6-10.9a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5z'
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    path: 'M23 12s0-3.4-.4-5a2.6 2.6 0 0 0-1.8-1.8C19.2 4.7 12 4.7 12 4.7s-7.2 0-8.8.5A2.6 2.6 0 0 0 1.4 7C1 8.6 1 12 1 12s0 3.4.4 5a2.6 2.6 0 0 0 1.8 1.8c1.6.5 8.8.5 8.8.5s7.2 0 8.8-.5A2.6 2.6 0 0 0 22.6 17c.4-1.6.4-5 .4-5zM9.7 15.3V8.7L15.5 12z'
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    path: 'M20.4 3H3.6A.6.6 0 0 0 3 3.6v16.8a.6.6 0 0 0 .6.6h16.8a.6.6 0 0 0 .6-.6V3.6a.6.6 0 0 0-.6-.6zM8.3 18.3H5.6V9.7h2.7zM6.9 8.5a1.6 1.6 0 1 1 1.6-1.6 1.6 1.6 0 0 1-1.6 1.6zm11.4 9.8h-2.7v-4.2c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2v4.3H9.9V9.7h2.6V11a2.9 2.9 0 0 1 2.6-1.4c2.7 0 3.2 1.8 3.2 4.2z'
  }
];

export default function Footer() {
  const t = useTranslations('Footer');
  const tSite = useTranslations('Site');

  // Mirrors the documents in src/content/policies. Cookie preferences are not
  // listed: there is no cookie banner on this site yet, so the link would have
  // gone nowhere.
  const locale = useLocale();
  const policies = [
    'privacy',
    'refund',
    'terms',
    'shipping',
    'contact',
    'legal'
  ] as const;

  return (
    <footer className="mx-3 mb-3 mt-3 rounded-[20px] border border-white/10 bg-black text-cream sm:mx-5 sm:mb-5">
      <Container className="max-w-6xl py-16">
        <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center">
            <Link
              href="/"
              aria-label={tSite('name')}
              className="inline-block shrink-0"
            >
              <Image
                src="/logo.png"
                alt={tSite('name')}
                width={1000}
                height={380}
                className="h-14 w-auto"
              />
            </Link>

          </div>

          <div>
            <h2 className="quoted font-display text-2xl font-bold uppercase leading-none">
              {t('stayConnected')}
            </h2>
            <ul className="mt-6 flex justify-center gap-4">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.label === 'Instagram' ? (instagram[locale as keyof typeof instagram] ?? instagram.en) : social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition-colors duration-200 hover:border-pink hover:text-pink"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-5 w-5"
                    >
                      <path d={social.path} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* Full-bleed pink rule, edge to edge. */}
      <div aria-hidden="true" className="h-0.5 w-full bg-pink" />

      <Container className="max-w-6xl py-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
          <PolicyMenu policies={policies} />

          <p className="text-base uppercase leading-none text-cream">
            &copy; {new Date().getFullYear()} {tSite('name')}. {t('rights')}
          </p>
        </div>
      </Container>
    </footer>
  );
}
