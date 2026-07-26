const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const icons = require("./icons.js");

module.exports = function(eleventyConfig) {
  // Copy assets to output directory
  eleventyConfig.addPassthroughCopy("src/assets");

  // Emit an inline SVG for a named icon (see icons.js). currentColor + a 1em
  // .icon rule (styles.css) make it inherit the surrounding text's color/size.
  eleventyConfig.addShortcode("icon", function(name) {
    const d = icons[name];
    if (!d) return "";
    return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="${d}"/></svg>`;
  });

  // Content-hash cache-buster for the stylesheet, so a CSS change always
  // forces browsers to fetch the matching file (prevents new HTML rendering
  // against a stale cached styles.css).
  eleventyConfig.addGlobalData("cssVersion", () => {
    try {
      const css = fs.readFileSync(path.join(__dirname, "src/assets/styles.css"));
      return crypto.createHash("md5").update(css).digest("hex").slice(0, 8);
    } catch (e) {
      return "1";
    }
  });

  // Custom filter to sort by end date (descending), ongoing roles first;
  // ties broken by begin date (descending)
  eleventyConfig.addFilter("sortByDateDesc", function(array) {
    if (!Array.isArray(array)) return array;

    return array.sort((a, b) => {
      const getYear = (date) => {
        if (date === "present") return Infinity;
        return parseInt(date) || 0;
      };
      return (getYear(b.end) - getYear(a.end)) || (getYear(b.begin) - getYear(a.begin));
    });
  });

  // Keep only the jobs a variant selected: a job renders iff its `id` is a key
  // in the variant's `select` map. Omitting an id hides that whole job.
  eleventyConfig.addFilter("selected", function(items, select) {
    if (!Array.isArray(items) || !select) return [];
    return items.filter((i) => i && Object.prototype.hasOwnProperty.call(select, i.id));
  });

  // Pull values from a keyed bank (bullets, publications) in the order an id
  // list declares. Unknown or missing ids are dropped. `ids` absent → nothing.
  eleventyConfig.addFilter("pick", function(bank, ids) {
    if (!bank || !Array.isArray(ids)) return [];
    return ids.map((id) => bank[id]).filter(Boolean);
  });

  // Partition experience entries by section. Items without a `section` key
  // default to "experience", so only Teaching entries need to opt in.
  eleventyConfig.addFilter("section", function(items, name) {
    if (!Array.isArray(items)) return items;
    return items.filter((i) => (i && i.section ? i.section : "experience") === name);
  });

  // Resolve a note's text for a variant (a plain string stays a string)
  eleventyConfig.addFilter("noteText", function(note, variantKey) {
    return (note && typeof note === "object")
      ? ((note.variants && note.variants[variantKey]) || note.text)
      : note;
  });

  // Development server options
  eleventyConfig.setServerOptions({
    liveReload: true,
    domDiff: false,
    port: 8080
  });

  // Return configuration
  return {
    // Path prefix for GitHub Pages subdirectory
    pathPrefix: "/cvpage/",

    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    // Use Nunjucks for all template files
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"]
  };
};