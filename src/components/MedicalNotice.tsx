import {useTranslations} from 'next-intl';

/**
 * The medical boundary, stated on every guide.
 *
 * Rendered by the guide pages themselves rather than written into each guide's
 * frontmatter or body, which is the entire point: a notice that an author has
 * to remember is a notice that is missing from guide forty-seven. This one
 * cannot be forgotten, because forgetting it would mean deleting code.
 *
 * The line it draws: these guides are for optimising a healthy body. A
 * diagnosed condition — scoliosis, a hernia, acute pain, anything a doctor is
 * already treating — is not something a PDF should be protocolising, and the
 * guides say so and refer out instead.
 *
 * This is also the honest position for a brand whose whole argument is that
 * claims should be traceable. A protocol built on published research is still
 * not a consultation, and pretending otherwise would be exactly the kind of
 * overreach the research pages exist to argue against.
 */
export default function MedicalNotice({className}: {className?: string}) {
  const t = useTranslations('Guides');

  return (
    <aside
      className={className}
      // Not a warning in the ARIA sense — it is standing context, not an alert
      // raised in response to something the reader just did.
      aria-label={t('noticeTitle')}
    >
      <div className="rounded-[20px] border border-olive/25 bg-kratos-50 p-5 text-left sm:p-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-olive">
          {t('noticeTitle')}
        </h2>
        <p className="longform mt-3 text-base leading-relaxed text-black">
          {t('noticeBody')}
        </p>
      </div>
    </aside>
  );
}
