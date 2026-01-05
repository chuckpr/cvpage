module.exports = function(eleventyConfig) {
  // Copy assets to output directory
  eleventyConfig.addPassthroughCopy("src/assets");

  // Custom filter to sort by begin date (descending) - replicates Quarto's "begin desc"
  eleventyConfig.addFilter("sortByDateDesc", function(array) {
    if (!Array.isArray(array)) return array;

    return array.sort((a, b) => {
      const getYear = (date) => {
        if (date === "present") return new Date().getFullYear();
        return parseInt(date) || 0;
      };
      return getYear(b.begin) - getYear(a.begin);
    });
  });

  // Custom filter for date range formatting
  eleventyConfig.addFilter("formatDateRange", function(begin, end) {
    return `${begin}–${end}`;
  });

  // Development server options
  eleventyConfig.setServerOptions({
    liveReload: true,
    domDiff: false,
    port: 8080
  });

  // Return configuration
  return {
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