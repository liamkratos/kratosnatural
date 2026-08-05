'use client';

import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {useScrolled} from '@/lib/use-scrolled';
import {cn} from '@/lib/utils';

/**
 * Full-viewport hero: edge-to-edge photograph, wordmark set large in the
 * display face, in the manner of liamkratos.nl.
 *
 * The scrim is not decoration. The banner is a light photograph (pale sky,
 * mid-green canopy), and the pink wordmark measures around 1.4:1 against it —
 * unreadable. Darkening the image puts the wordmark on a dark surface, which is
 * the only context pink is legible in, so the intended look and the contrast
 * rule agree instead of competing.
 */
/**
 * Shared button treatment: olive fill, white label, fill lightens on hover.
 * Colour-only change, so nothing reflows and the hit area stays put.
 */
const heroButton =
  'inline-flex items-center justify-center rounded-[20px] bg-olive px-8 py-4 font-display text-xl uppercase leading-none text-white transition-colors duration-200 hover:text-pink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive sm:text-2xl';

export default function Hero() {
  const t = useTranslations('Home');
  const scrolled = useScrolled();

  return (
    /*
     * The hero tracks the navigation bar's shape. At the top of the page both
     * are square and run to the edges, so the photograph reads as the page
     * itself; once scrolled, both pull in and take the 20px button radius
     * together. Driven by the shared threshold so the two never round at
     * different moments.
     */
    <section
      className={cn(
        'relative isolate flex min-h-[calc(100svh-8rem)] flex-col justify-center overflow-hidden transition-[margin,border-radius] duration-300 ease-out',
        scrolled
          ? 'mx-3 rounded-[20px] sm:mx-5'
          : 'mx-0 rounded-none sm:mx-0'
      )}
    >
      <Image
        src="/hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-center"
      />

      {/* Scrim: heavier at the foot so the wordmark and CTAs stay legible,
          lighter at the top so the sky is still visible behind the header. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/30 to-black/80"
      />

      <div className="mx-auto w-full max-w-5xl px-6 py-16 text-center sm:pb-28">
        {/* `quoted` adds the curly marks every other heading on the site
            carries. It also sets black, which the pink utility overrides —
            utilities outrank the components layer, so the wordmark stays
            pink and only the quotation marks are inherited.

            Sized in vw with nowrap rather than in steps, so the wordmark
            stays on one line at every width. Fixed sizes broke it on phones:
            the two quotation marks pushed "Natural" onto a second line. */}
        <h1
          className="quoted whitespace-nowrap font-display font-bold uppercase leading-[0.85] text-pink drop-shadow-sm"
          style={{fontSize: 'clamp(2rem, 10.5vw, 9rem)'}}
        >
          Kratos Natural
        </h1>

        <p
          className="mx-auto mt-6 whitespace-nowrap font-display uppercase leading-tight text-white"
          style={{fontSize: 'clamp(0.72rem, 2.8vw, 1.9rem)'}}
        >
          {t('tagline')}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/shop" className={heroButton}>
            {t('ctaShop')}
          </Link>
          <Link href="/articles" className={heroButton}>
            {t('ctaLearn')}
          </Link>
        </div>
      </div>

      {/* Watched by the header to decide transparent vs solid. */}
      <div id="hero-sentinel" aria-hidden="true" className="absolute bottom-0 h-px w-full" />
    </section>
  );
}
