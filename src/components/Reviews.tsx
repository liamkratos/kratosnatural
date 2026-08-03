import {useLocale, useTranslations} from 'next-intl';
import Container from '@/components/Container';
import Card from '@/components/Card';
import Reveal from '@/components/Reveal';
import {
  GOOGLE_REVIEW_URL,
  REVIEWS,
  averageRating,
  type Review
} from '@/lib/reviews';

/**
 * Reviews block, shown on the homepage.
 *
 * No `AggregateRating` markup: see the note in lib/reviews.ts. This exists to
 * show the reviews to a reader and to send them to the profile where the stars
 * that appear in search actually come from.
 *
 * Renders nothing when there are no reviews. An empty "what people say" block
 * says something, and it is not flattering.
 */
function Stars({rating}: {rating: number}) {
  return (
    <span
      className="inline-flex gap-0.5 align-middle"
      role="img"
      aria-label={`${rating} / 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={`h-4 w-4 ${star <= Math.round(rating) ? 'fill-pink' : 'fill-ink/20'}`}
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </span>
  );
}

export default function Reviews({reviews = REVIEWS}: {reviews?: Review[]}) {
  const t = useTranslations('Reviews');
  const locale = useLocale() as 'en' | 'nl';
  const average = averageRating(reviews);

  if (reviews.length === 0 || average === null) return null;

  return (
    <Container className="mt-3 max-w-5xl px-3 sm:px-5">
      <Card className="py-16">
        <Reveal>
          <h2 className="quoted font-display text-3xl font-bold uppercase leading-tight sm:text-4xl">
            {t('title')}
          </h2>

          <p className="mt-4 flex items-center justify-center gap-3">
            <Stars rating={average} />
            <span className="font-mono text-xs uppercase tracking-widest text-black">
              {t('summary', {rating: average, count: reviews.length})}
            </span>
          </p>
        </Reveal>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {reviews.map((review, index) => (
            <Reveal key={review.author} delay={index * 60}>
              <li className="floating h-full bg-white p-6 text-left">
                <Stars rating={review.rating} />
                <p className="mt-4 text-base uppercase leading-snug">
                  {review.body[locale] ?? review.body.en ?? review.body.nl}
                </p>
                <p className="mt-4 font-mono text-xs uppercase tracking-widest text-black">
                  {review.author}
                </p>
              </li>
            </Reveal>
          ))}
        </ul>

        {/* Only rendered once the profile link is set. */}
        {GOOGLE_REVIEW_URL && (
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center justify-center rounded-[20px] bg-black px-8 py-4 font-display text-xl uppercase leading-none text-white transition-colors duration-200 hover:text-pink"
          >
            {t('write')}
          </a>
        )}
      </Card>
    </Container>
  );
}
