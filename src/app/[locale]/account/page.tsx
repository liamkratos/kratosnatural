import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {isLocale} from '@/i18n/routing';
import {readToken, SESSION_COOKIE} from '@/lib/account';
import {getOrdersByEmail, carrierLabel, type Order} from '@/lib/orders';
import {formatDate, formatPrice} from '@/lib/utils';
import Container from '@/components/Container';
import Card from '@/components/Card';

/**
 * Account overview: orders and their delivery state, read live from Stripe, plus
 * the returns steps. Nothing about the customer is stored by this app — the
 * session cookie holds only a signed email address.
 */
export const dynamic = 'force-dynamic';

function OrderRow({
  order,
  t,
  locale
}: {
  order: Order;
  t: any;
  locale: 'en' | 'nl';
}) {
  return (
    <li className="border border-ink/10 p-6 text-left">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-black">
          {t('orderRef', {reference: order.reference})}
        </p>
        <p className="font-mono text-xs uppercase tracking-widest text-black">
          {formatDate(order.createdAt.slice(0, 10), locale)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-2xl leading-none">
          {t(`state_${order.state}`)}
        </p>
        <p className="font-mono text-lg tabular-nums">
          {formatPrice(order.amountCents, locale)}
        </p>
      </div>

      {order.lines.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm text-black">
          {order.lines.map((line, index) => (
            <li key={index}>
              {line.quantity}&times; {line.description}
            </li>
          ))}
        </ul>
      )}

      {order.trackingNumber && (
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-black">
          {carrierLabel(order.carrier)} · {order.trackingNumber}
          {order.trackingUrl && (
            <>
              {' — '}
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-cream"
              >
                {t('track')}
              </a>
            </>
          )}
        </p>
      )}
    </li>
  );
}

export default async function AccountPage({
  params: {locale}
}: {
  params: {locale: string};
}) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const email = readToken(cookies().get(SESSION_COOKIE)?.value, 'session');
  // English is the default locale and carries no prefix, so building the path
  // by hand would add a redundant /en hop.
  if (!email) {
    redirect(locale === 'en' ? '/account/login' : `/${locale}/account/login`);
  }

  const t = await getTranslations('Account');

  // A Stripe outage must not take the account page down with it.
  let orders: Order[] = [];
  let ordersFailed = false;
  try {
    orders = await getOrdersByEmail(email);
  } catch (error) {
    console.error('could not load orders', error);
    ordersFailed = true;
  }

  const steps = [1, 2, 3, 4] as const;

  return (
    <Container className="max-w-3xl py-24">
      <Card>
        <h1 className="quoted font-display text-5xl font-bold uppercase leading-tight">
          {t('title')}
        </h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-widest text-black">
          {t('signedInAs', {email})}
        </p>

        <form action="/api/account/signout" method="post" className="mt-4">
          <button
            type="submit"
            className="font-display text-lg uppercase leading-none text-black underline underline-offset-4 transition-colors duration-200 hover:text-cream"
          >
            {t('signOut')}
          </button>
        </form>
      </Card>

      <Card className="mt-6">
        <h2 className="quoted font-display text-4xl font-bold uppercase leading-tight">
          {t('orders')}
        </h2>

        {ordersFailed ? (
          <p className="mt-6 text-xl text-black">
            {t('noOrders')}
          </p>
        ) : orders.length === 0 ? (
          <p className="mt-6 text-xl text-black">
            {t('noOrders')}
          </p>
        ) : (
          <ul className="mt-8 space-y-4">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} t={t} locale={locale} />
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="quoted font-display text-4xl font-bold uppercase leading-tight">
          {t('returns')}
        </h2>
        <p className="mt-3 text-xl text-black">
          {t('returnsIntro')}
        </p>

        <ol className="mt-8 space-y-4 text-left">
          {steps.map((step) => (
            <li key={step} className="floating flex gap-5 bg-white p-6">
              <span className="font-mono text-lg tabular-nums text-black">
                0{step}
              </span>
              <span>
                <span className="block font-display text-2xl uppercase leading-none">
                  {t(`step${step}Title`)}
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-black">
                  {t(`step${step}Body`)}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </Card>
    </Container>
  );
}
