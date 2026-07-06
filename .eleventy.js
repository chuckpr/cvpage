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