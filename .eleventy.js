module.exports = function (eleventyConfig) {
  // Globals
  eleventyConfig.addGlobalData("baseUrl", "file:///Users/gopperman/sites/worcesterelectioninfo/_site/");

  // Passthroughs
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("images");

  //Config
  eleventyConfig.setLayoutsDirectory("_layouts");
  eleventyConfig.setTemplateFormats("html,liquid");
}
