/**
 * Global 404 fallback for requests that never reach the `[locale]` segment.
 * The document shell comes from `app/layout.tsx`, so this renders content only.
 *
 * Localised 404s live in `app/[locale]/not-found.tsx`; unmatched paths inside a
 * locale are routed there by `app/[locale]/[...rest]/page.tsx`.
 */
export default function GlobalNotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24 text-center">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-black">
          Page not found
        </h1>
        <p className="mt-4 text-black">
          The page you were looking for does not exist.
        </p>
        <a
          href="/"
          className="mt-8 inline-block text-black underline underline-offset-4"
        >
          Back to home
        </a>
      </div>
    </div>
  );
}
