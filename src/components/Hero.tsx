import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';

/**
 * Full-viewport hero: edge-to-edge photograph, wordmark set large in the
 * display face, in the manner of liamkratos.nl.
 *
 * The scrim is not decoration. The banner is a light photograph (pale sky,
 * mid-green canopy), and the pink accent measures around 1.4:1 against it —
 * unreadable. Darkening the image puts the wordmark on a dark surface, which is
 * the only context the brand tokens permit pink in, so the intended look and
 * the contrast rule agree instead of competing.
 */
/**
 * Shared button treatment: black fill, white label, label turns pink on hover.
 * Colour-only change, so nothing reflows and the hit area stays put.
 */
const heroButton =
  'inline-flex items-center justify-center rounded-[20px] bg-black px-8 py-4 font-display text-xl uppercase leading-none text-white transition-colors duration-200 hover:text-pink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink sm:text-2xl';

export default function Hero() {
  const t = useTranslations('Home');

  return (
    <section className="relative isolate mx-3 flex min-h-[calc(100svh-8rem)] flex-col justify-center overflow-hidden rounded-[20px] sm:mx-5">
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
        <h1 className="font-display text-6xl font-bold uppercase leading-[0.85] text-pink drop-shadow-sm sm:text-7xl md:text-8xl lg:text-9xl">
          Kratos Natural
        </h1>

        <p className="mx-auto mt-6 whitespace-nowrap font-display uppercase leading-tight text-cream"
          style={{fontSize: 'clamp(0.6rem, 2.3vw, 1.6rem)'}}>
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
