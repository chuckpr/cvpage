# Curriculum Vitae

Personal CV website built with [Eleventy](https://www.11ty.dev/).

**🔗 Live Site**: [https://chuckpr.github.io/cvpage](https://chuckpr.github.io/cvpage)

## Development

```bash
# Install dependencies
npm install

# Start development server with live reload
npm run serve

# Build for production
npm run build

# Clean build artifacts
npm run clean
```

The development server will be available at http://localhost:8080/

## Project Structure

```
├── src/
│   ├── _data/           # JSON data files
│   │   ├── profile.json     # Name, title, description
│   │   ├── experience.json  # Work experience
│   │   ├── education.json   # Education history
│   │   └── sidebar.json     # Contact, links, skills
│   ├── _includes/       # Nunjucks templates
│   │   ├── layouts/         # Page layouts
│   │   └── partials/        # Reusable components
│   ├── assets/          # CSS and static files
│   └── index.njk        # Main page template
├── _site/               # Generated output (git ignored)
├── .eleventy.js         # Eleventy configuration
└── package.json         # Project dependencies
```

## Updating Content

- **Profile info**: Edit `src/_data/profile.json`
- **Work experience**: Edit `src/_data/experience.json`
- **Education**: Edit `src/_data/education.json`
- **Contact/Links/Skills**: Edit `src/_data/sidebar.json`
- **Styling**: Edit `src/assets/styles.css`

## License

MIT
