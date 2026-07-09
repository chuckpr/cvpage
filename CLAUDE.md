This repo contains a eleventy based build system for my résumé.

`src/_data/` holds my data. E.g. my job experience is in `src/_data/experience.json`.

Eleventy renders the résumé as HTML and the site is hosted on GitHub pages at https://chuckpr.github.io/cvpage. GitHub actions deploys the site when changes are made to the `main` branch.

Résumé variants deploy at `/cvpage/<variant name>` and that data is found in `src/_data/variants.json`.

To preview: `npm run serve` and visit `localhost:8080/cvpage`.
