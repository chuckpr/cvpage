# Curriculum Vitae

Personal résumé website built with [Eleventy](https://www.11ty.dev/).

**🔗 Live Site**: [https://chuckpr.github.io/cvpage](https://chuckpr.github.io/cvpage)

## Variants

The résumé is rendered once per variant. Each variant sets its own permalink, title,
description, skill clusters, and — the core idea — an explicit **selection** of which
bullets and publications to show. The variant with `permalink: "/"` is the default
résumé; others deploy at `/cvpage/<permalink>` (e.g. `/cvpage/tech/`). A PDF is
generated per variant as `resume-<key>.pdf`.

### Bullet bank + explicit selection

`experience.json` is a **bullet bank**: each job has a stable `id` and a `bullets`
map keyed by short stable bullet ids, holding every bullet you've written for that
job (including ones no variant currently shows), each with optional per-variant
wording. Nothing in the bank displays on its own.

Each variant's `select` map (in `variants.json`) lists, per job id, the **ordered
array of bullet ids** to display. A job appears in a variant only if its id is a key
in `select`; the id order is the display order. Publications and invited talks work
the same way: `publications.json` and `talks.json` are keyed banks, and a variant's
`publications` / `talks` fields are ordered lists of ids to show.

To retune a résumé you edit id lists, never the prose. To park a bullet without
showing it, leave it in the bank and out of every `select`.

### Tailored variants (local-only)

`src/_data/tailored.json` (git-ignored, never deployed) defines per-job-posting
variants. Each inherits a base variant (`compbio`/`tech`) and overrides only what it
needs — usually the title and the per-job bullet selection — reusing the base's
wording and skills. They build locally (`npm run serve`, `npm run pdf`) at
`/tailored/<key>/`. Copy `tailored.example.json` to `tailored.json` to start. Because
the file is absent in CI, tailored pages can never leak to the live site.

`src/_data/renderVariants.js` merges the base variants with any tailored ones and is
what the template paginates over.

### Layout

Each printed page is an explicit `.sheet`: page 1 is the main résumé (its sections
distribute vertically to fill the page), and a back-matter sheet holds publications
and invited talks (it flows across pages if long). On screen the sheets render as
distinct letter pages with margins, matching the PDF 1:1.

There is no CSS framework: `src/assets/styles.css` is hand-written, with a `CONFIG`
block of custom properties at the top for the values you tune most often — vertical
and horizontal page margins (`--margin-v` / `--margin-h`), font sizes, spacing, and
colors. Icons are inlined as SVG via the `{% icon %}` shortcode backed by `icons.js`
— no icon CDN or runtime JS.

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
│   │   ├── variants.json         # Base variants: permalinks, titles, skills, select/publications
│   │   ├── renderVariants.js     # Merges base + tailored variants (pagination source)
│   │   ├── tailored.example.json # Reference shape for tailored.json (copy to start)
│   │   ├── profile.json          # Shared facts: name, location
│   │   ├── experience.json       # Bullet bank: jobs with id + keyed bullets map
│   │   ├── education.json        # Education history
│   │   ├── publications.json     # Publication bank, keyed by id
│   │   ├── talks.json            # Invited-talk bank, keyed by id
│   │   └── sidebar.json          # Contact info and links
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

- **Variants (titles, descriptions, skills, bullet/pub selection)**: Edit
  `src/_data/variants.json` — each variant's `select` map picks bullets per job and
  `publications` picks pubs, both by ordered id list
- **Name/location**: Edit `src/_data/profile.json`
- **Work experience**: Edit `src/_data/experience.json` — add or edit bullets in a
  job's `bullets` map (each keyed by a stable id), with optional per-variant wording
  via `variants: { key: "..." }`; then reference the ids you want from a variant's
  `select`
- **Education**: Edit `src/_data/education.json`
- **Publications**: Edit `src/_data/publications.json` (keyed by id); select which
  show per variant via `publications` in `variants.json`
- **Invited talks**: Edit `src/_data/talks.json` (keyed by id); select which show per
  variant via `talks` in `variants.json`
- **Tailored résumé for a posting**: Copy `tailored.example.json` to
  `src/_data/tailored.json` and edit (local-only, never deployed)
- **Contact/Links**: Edit `src/_data/sidebar.json`
- **Styling**: Edit `src/assets/styles.css`
