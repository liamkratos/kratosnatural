import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import type {Guide} from '@/lib/guides';
import type {PriceInfo} from '@/lib/pricing';
import {formatPrice} from '@/lib/utils';

/**
 * One guide on the shop page.
 *
 * The pillar e-book carries a badge, because a reader landing on a domain needs
 * to know at a glance which of these is the whole thing and which is one
 * problem out of it. Everything else is the same card, so the two read as the
 * same kind of object at different sizes rather than as two products.
 */
export default function GuideCard({
  guide,
  price
}: {
  guide: Guide;
  price: PriceInfo | null;
}) {
  const t = useTranslations('Guides');

  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="floating group flex h-full flex-col overflow-hidden bg-white text-left transition-shadow duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.14)]"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-kratos-50">
        <Image
          src={guide.cover}
          alt={guide.title}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {guide.pillar && (
          <span className="absolute left-3 top-3 rounded-full bg-olive px-3 py-1 font-display text-xs uppercase leading-none text-pink">
            {t('ebook')}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-bold uppercase leading-tight text-black">
          {guide.title}
        </h3>
        <p className="mt-2 flex-1 text-base leading-snug text-black">
          {guide.summary}
        </p>

        <div className="mt-4 flex items-baseline justify-between gap-3">
          <span className="font-display text-lg uppercase leading-none text-olive">
            {price
              ? formatPrice(price.amountCents, guide.locale)
              : t('priceUnavailable')}
          </span>
          {guide.pages && (
            <span className="font-mono text-xs uppercase tracking-widest text-black">
              {t('pages', {count: guide.pages})}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
