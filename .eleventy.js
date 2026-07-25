const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

module.exports = function(eleventyConfig) {
  // Copy assets to output directory
  eleventyConfig.addPassthroughCopy("src/assets");

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

  // Keep only the entries that apply to a variant. Works on experience/education
  // items and on notes alike: an object may carry `only: [...]` or `except: [...]`,
  // and a plain string (a bare note) always applies. Nested children are filtered too.
  eleventyConfig.addFilter("forVariant", function(entries, variantKey) {
    if (!Array.isArray(entries)) return entries;
    const applies = (e) => {
      if (!e || typeof e !== "object") return true;
      if (e.hidden) return false;              // kept in the data, rendered nowhere
      if (e.only) return e.only.includes(variantKey);
      if (e.except) return !e.except.includes(variantKey);
      return true;
    };
    return entries.filter(applies).map((e) =>
      (e && e.children) ? Object.assign({}, e, { children: e.children.filter(applies) }) : e
    );
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