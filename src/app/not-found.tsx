import './globals.css';

/**
 * Global fallback for requests that never reach a locale segment (the
 * `[locale]` layout is the root layout, so this page needs its own html/body).
 */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center font-sans">
        <div className="px-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-kratos-900">
            Page not found
          </h1>
          <p className="mt-4 text-kratos-700">
            The page you were looking for does not exist.
          </p>
          <a
            href="/"
            className="mt-8 inline-block text-kratos-700 underline underline-offset-4"
          >
            Back to home
          </a>
        </div>
      </body>
    </html>
  );
}
