import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import type {Product} from '@/lib/products';
import type {PriceInfo} from '@/lib/pricing';
import {cn, formatPrice} from '@/lib/utils';

/**
 * Product card: a square photograph closed by the title, description and price.
 *
 * The photographs are shot on moss rather than cut out on white, so they fill
 * the well edge to edge. An earlier version composited a packshot over a shared
 * moss backdrop; with photographs that already carry their own setting that
 * would put moss on moss.
 *
 * On hover the card crossfades to the product's second photograph, so a visitor
 * scanning the grid sees the product from another angle without opening it. The
 * second image is stacked underneath rather than swapped into the same tag: an
 * `src` swap would fetch on first hover and flash, while both being present
 * means the browser has already decoded them.
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
  const hoverImage = product.images[0];

  return (
    <article className="group floating flex h-full flex-col overflow-hidden bg-white">
      <Link href={`/shop/${product.slug}`} className="flex h-full flex-col">
        <span className="relative block aspect-square overflow-hidden bg-ink/5">
          {product.image ? (
            <>
              {hoverImage && (
                <Image
                  src={hoverImage}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              )}
              <Image
                src={product.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className={cn(
                  'object-cover transition-transform duration-500 group-hover:scale-[1.04]',
                  hoverImage &&
                    'transition-[opacity,transform] group-hover:opacity-0'
                )}
              />
            </>
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

          <p className="mt-1 line-clamp-2 flex-1 text-base leading-snug text-black">
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
