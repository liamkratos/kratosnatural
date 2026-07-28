import {notFound} from 'next/navigation';

/**
 * Catch-all for unmatched paths inside a locale.
 *
 * The middleware rewrites every request into the `[locale]` segment, but a path
 * with no matching page would otherwise fall through to the *root*
 * `app/not-found.tsx` (which is not localised). Matching it here and calling
 * notFound() routes it to `app/[locale]/not-found.tsx` instead, so a bad Dutch
 * URL gets the Dutch 404.
 */
export default function CatchAllPage() {
  notFound();
}
