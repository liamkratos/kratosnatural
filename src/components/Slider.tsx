'use client';

import {useState} from 'react';
import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';

export type Slide = {
  title: string;
  body: string;
  cta: string;
  href: string;
  image: string;
};

/**
 * Slideshow modelled on the one at the foot of liamkratos.nl.
 *
 * All slides stay in the DOM and are cross-faded, rather than the current one
 * being swapped in: that keeps the block a fixed height so nothing below it
 * jumps, and lets the browser fetch every image once up front.
 *
 * Off-screen slides are hidden from assistive tech and removed from the tab
 * order, so a keyboard user cannot tab into a slide they cannot see.
 */
export default function Slider({slides}: {slides: Slide[]}) {
  const t = useTranslations('About');
  const [index, setIndex] = useState(0);
  const total = slides.length;

  const go = (next: number) => setIndex((next + total) % total);

  return (
    <div className="floating relative overflow-hidden">
      <div className="relative aspect-[3/4] sm:aspect-[21/9]">
        {slides.map((slide, i) => (
          <div
            key={slide.title}
            aria-hidden={i !== index}
            className={cn(
              'absolute inset-0 transition-opacity duration-500',
              i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
            )}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25"
            />

            <div className="relative flex h-full flex-col items-center justify-end gap-3 p-6 text-center sm:p-12">
              <h3 className="quoted font-display text-2xl font-bold uppercase leading-none text-pink sm:text-4xl">
                {slide.title}
              </h3>
              <p className="max-w-lg text-base leading-snug text-cream sm:text-lg">
                {slide.body}
              </p>
              <Link
                href={slide.href}
                tabIndex={i === index ? undefined : -1}
                className="mt-2 rounded-[20px] bg-white px-6 py-3 font-display text-lg uppercase leading-none text-black transition-colors duration-200 hover:text-pink"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => go(index - 1)}
        aria-label={t('prev')}
        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-cream transition-colors hover:text-pink"
      >
        &#8249;
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        aria-label={t('next')}
        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-cream transition-colors hover:text-pink"
      >
        &#8250;
      </button>

      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => go(i)}
            aria-label={slide.title}
            aria-current={i === index}
            className={cn(
              'h-2 rounded-full transition-all duration-200',
              i === index ? 'w-6 bg-pink' : 'w-2 bg-white/60 hover:bg-white'
            )}
          />
        ))}
      </div>
    </div>
  );
}
