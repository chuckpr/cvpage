// Render each CV variant from the built _site to a PDF with headless Chromium.
// Runs the page's JS (Iconify icons) and honors the print CSS. Reads the variant
// list from src/_data/variants.json so new variants are picked up automatically.

const http = require("http");
const fs = require("fs");
const path = require("path");

const SITE_DIR = path.join(__dirname, "..", "_site");
const VARIANTS = require(path.join(__dirname, "..", "src", "_data", "variants.json"));
const PATH_PREFIX = "/cvpage";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
};

// Serve _site under the /cvpage/ base so absolute /cvpage/assets/... links resolve.
function startServer() {
  const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath.startsWith(PATH_PREFIX)) urlPath = urlPath.slice(PATH_PREFIX.length);
    if (urlPath.endsWith("/")) urlPath += "index.html";
    const filePath = path.join(SITE_DIR, urlPath);
    // Guard against path traversal outside _site.
    if (!filePath.startsWith(SITE_DIR)) {
      res.writeHead(403).end();
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
      res.end(data);
    });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function main() {
  if (!fs.existsSync(path.join(SITE_DIR, "index.html"))) {
    throw new Error("_site not built. Run `npm run build` first.");
  }

  const { default: puppeteer } = await import("puppeteer");
  const server = await startServer();
  const port = server.address().port;
  // --no-sandbox: CI runners disable unprivileged user namespaces; safe here
  // because we only ever render our own built site.
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const variant of VARIANTS) {
      const url = `http://127.0.0.1:${port}${PATH_PREFIX}${variant.permalink}`;
      const outFile = path.join(SITE_DIR, `cv-${variant.key}.pdf`);
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle0" });

      // Give the Iconify web component a chance to render its SVGs before printing.
      try {
        await page.waitForFunction(
          () =>
            [...document.querySelectorAll("iconify-icon")].every(
              (el) => el.shadowRoot && el.shadowRoot.querySelector("svg")
            ),
          { timeout: 8000 }
        );
      } catch {
        console.warn(`  (icons did not all resolve for ${variant.key}; continuing)`);
      }
      // Ensure the self-hosted web fonts are fully loaded before printing.
      await page.evaluate(() => document.fonts.ready);
      await new Promise((r) => setTimeout(r, 300));

      await page.pdf({ path: outFile, printBackground: true, preferCSSPageSize: true });
      await page.close();
      console.log(`Wrote ${path.relative(process.cwd(), outFile)}`);
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
