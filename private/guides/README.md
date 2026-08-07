# Guide files

The PDFs sold in `/guides` live here, deliberately outside `public/`.

Anything under `public/` is served by URL to anyone who knows or guesses the
filename, which would make the paywall decorative. These are read from disk by
`src/app/api/download/[slug]/route.ts`, which checks against Stripe that the
signed-in person actually bought the guide before handing the bytes over.

A guide's frontmatter names its file, e.g. `file: 'houding-schouders-nl.pdf'`.

Note the one file that does **not** belong here: `longevity-basics.pdf` is the
free lead magnet and lives in `public/downloads/`, because it is meant to be
handed out without a purchase and is linked directly from the welcome email.
