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
    <article className="group floating flex h-full flex-col overflow-hidden bg-white">
      <Link href={`/shop/${product.slug}`} className="flex h-full flex-col">
        <span className="relative block aspect-square overflow-hidden bg-ink/5">
          {/* Moss backdrop, a square crop of the site's own stream photograph, so
              the packshot sits on something rather than floating on grey. */}
          <Image
            src="/moss.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-black/15"
          />

          {product.image ? (
            <Image
              src={product.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="relative object-contain p-5 drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <span className="flex h-full items-center justify-center font-mono text-[0.65rem] uppercase tracking-[0.2em] text-black">
              {t('photoComingSoon')}
            </span>
          )}

          {product.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-black px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-cream">
              {product.badge}
            </span>
          )}
        </span>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-xl uppercase leading-tight transition-colors duration-200 group-hover:text-pink">
            {product.title}
          </h3>

          <p className="mt-1 line-clamp-2 flex-1 font-display text-base uppercase leading-snug text-black">
            {product.description}
          </p>

          <p className="mt-3 font-mono text-sm tabular-nums text-ink">
            {price ? (
              <>
                {formatPrice(price.amountCents, product.locale)}
                {price.taxInclusive && (
                  <span className="text-black"> {t('inclVat')}</span>
                )}
              </>
            ) : (
              <span className="text-black">{t('priceUnavailable')}</span>
            )}
          </p>
        </div>
      </Link>
    </article>
  );
}
