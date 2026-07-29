import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import type {Product} from '@/lib/products';
import type {PriceInfo} from '@/lib/pricing';
import {formatPrice} from '@/lib/utils';

/**
 * Product card, following the collection layout on elvou.com: no card chrome at
 * all — no border, no shadow, no panel — just a rounded image well with the
 * text sitting directly on the page. The radius is 20px rather than elvou's 8,
 * to match the buttons and the nav bar.
 *
 * Products without photography yet get a neutral well rather than a broken
 * image, so the grid still reads as intentional.
 */
export default function ProductCard({
  product,
  price
}: {
  product: Product;
  price: PriceInfo | null;
}) {
  const t = useTranslations('Shop');

  return (
    <article className="flex h-full flex-col">
      <Link
        href={`/shop/${product.slug}`}
        className="group flex h-full flex-col"
      >
        <span className="relative block aspect-square overflow-hidden rounded-[20px] bg-ink/5">
          {product.image ? (
            <Image
              src={product.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <span className="flex h-full items-center justify-center font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink/35">
              {t('photoComingSoon')}
            </span>
          )}

          {product.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-black px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-cream">
              {product.badge}
            </span>
          )}
        </span>

        <h3 className="mt-5 font-display text-2xl uppercase leading-tight transition-colors duration-200 group-hover:text-pink">
          {product.title}
        </h3>

        <p className="mt-1 font-display text-lg uppercase leading-snug text-ink/60">
          {product.description}
        </p>

        <p className="mt-3 font-mono text-sm tabular-nums text-ink">
          {price ? (
            <>
              {formatPrice(price.amountCents, product.locale)}
              {price.taxInclusive && (
                <span className="text-ink/50"> {t('inclVat')}</span>
              )}
            </>
          ) : (
            <span className="text-ink/40">{t('priceUnavailable')}</span>
          )}
        </p>
      </Link>
    </article>
  );
}
