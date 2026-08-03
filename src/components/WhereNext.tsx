import {useTranslations} from 'next-intl';
import Card from '@/components/Card';
import Slider, {type Slide} from '@/components/Slider';

/**
 * "Where to go next" — the slider that sends a reader on to the research, the
 * university or the shop.
 *
 * Shared by the About page and the homepage rather than written twice: the
 * three destinations and their copy have to stay identical on both, and two
 * copies of a list like this drift the moment one of them is edited.
 *
 * Copy stays in the `About` namespace, which is where it was authored.
 */
export default function WhereNext({className}: {className?: string}) {
  const t = useTranslations('About');

  const slides: Slide[] = [
    {
      title: t('slide1Title'),
      body: t('slide1Body'),
      cta: t('slide1Cta'),
      href: '/articles',
      image: '/slow-down-aging.png'
    },
    {
      title: t('slide2Title'),
      body: t('slide2Body'),
      cta: t('slide2Cta'),
      href: '/articles',
      image: '/hero.jpg'
    },
    {
      title: t('slide3Title'),
      body: t('slide3Body'),
      cta: t('slide3Cta'),
      href: '/shop',
      image: '/products/salt-lamp-lit.jpg'
    }
  ];

  return (
    <Card className={className}>
      <h2 className="quoted font-display text-3xl font-bold uppercase leading-tight sm:text-4xl">
        {t('sliderTitle')}
      </h2>
      <div className="mt-8">
        <Slider slides={slides} />
      </div>
    </Card>
  );
}
