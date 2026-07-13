module.exports = function(eleventyConfig) {
  // Copy assets to output directory
  eleventyConfig.addPassthroughCopy("src/assets");

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

  // Custom filter for date range formatting
  eleventyConfig.addFilter("formatDateRange", function(begin, end) {
    return `${begin}–${end}`;
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

  // Resolve a note's text for a variant (a plain string stays a string)
  eleventyConfig.addFilter("noteText", function(note, variantKey) {
    return (note && typeof note === "object")
      ? ((note.variants && note.variants[variantKey]) || note.text)
      : note;
  });

  // Reorder/filter the skills section for a variant; other sections pass through unchanged
  eleventyConfig.addFilter("sidebarForVariant", function(sections, variant) {
    return sections.map(function(section) {
      if (section.heading !== "skills") return section;
      const byKey = Object.fromEntries(section.items.map(i => [i.key, i]));
      const order = (variant && variant.skills) || section.items.map(i => i.key);
      return Object.assign({}, section, {
        items: order.map(k => byKey[k]).filter(Boolean)
      });
    });
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