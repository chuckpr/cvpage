# Curriculum Vitae

Personal résumé website built with [Eleventy](https://www.11ty.dev/).

**🔗 Live Site**: [https://chuckpr.github.io/cvpage](https://chuckpr.github.io/cvpage)

## Variants

The résumé is rendered once per variant defined in `src/_data/variants.json`. Each
variant sets its own permalink, title, description, and skill clusters. The variant
with `permalink: "/"` is the default résumé; other variants deploy at
`/cvpage/<permalink>` (e.g. `/cvpage/tech/`). A PDF is generated per variant as
`resume-<key>.pdf`.

There is no CSS framework: `src/assets/styles.css` is hand-written, with a `CONFIG`
block of custom properties at the top for the values you tune most often — vertical
and horizontal page margins (`--margin-v` / `--margin-h`), font sizes, spacing, and
colors. Icons are inlined as SVG via the `{% icon %}` shortcode backed by `icons.js`
— no icon CDN or runtime JS.

On screen a red **page-break guide** marks where each printed 8.5×11in page ends, so
you can see when an edit pushes content onto another page. It is screen-only (never
in the PDF); delete its block in `styles.css` to turn it off.

## Development

```bash
# Install dependencies
npm install

# Start development server with live reload
npm run serve

# Build for production
npm run build

# Build and render PDFs (requires the build; uses headless Chromium)
npm run pdf

# Clean build artifacts
npm run clean
```

The development server will be available at http://localhost:8080/cvpage/

## Project Structure

```
├── src/
│   ├── _data/           # JSON data files
│   │   ├── variants.json     # Résumé variants: permalinks, titles, skill clusters
│   │   ├── profile.json      # Shared facts: name, location
│   │   ├── experience.json   # Work + teaching experience (per-variant notes)
│   │   ├── education.json    # Education history
│   │   ├── publications.json # Publications (per-variant via "only")
│   │   └── sidebar.json      # Contact info and links
│   ├── _includes/       # Nunjucks templates
│   │   ├── layouts/         # Page layouts
│   │   └── partials/        # Reusable components
│   ├── assets/          # CSS, fonts
│   └── index.njk        # Résumé template (paginated over variants)
├── scripts/
│   └── generate-pdfs.js # Renders each variant to PDF with Puppeteer
├── _site/               # Generated output (git ignored)
├── icons.js             # Inline SVG icon paths (see the {% icon %} shortcode)
├── .eleventy.js         # Eleventy configuration
└── package.json         # Project dependencies
```

Deployment happens automatically via GitHub Actions
(`.github/workflows/deploy.yml`) on every push to `main`: build, generate PDFs,
publish to GitHub Pages.

## Updating Content

- **Variants (titles, descriptions, skills)**: Edit `src/_data/variants.json`
- **Name/location**: Edit `src/_data/profile.json`
- **Work experience**: Edit `src/_data/experience.json` — entries and notes can
  target variants with `only: [...]` / `except: [...]`, be hidden with
  `hidden: true`, carry per-variant wording via `variants: { key: "..." }`, and set
  bullet order with `rank` (a number, or per-variant `{ key: n }`)
- **Education**: Edit `src/_data/education.json`
- **Publications**: Edit `src/_data/publications.json`
- **Contact/Links**: Edit `src/_data/sidebar.json`
- **Styling**: Edit `src/assets/styles.css`
