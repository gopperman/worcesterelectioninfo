module.exports = function (eleventyConfig) {
  // Passthroughs
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("images");

  //Config
  eleventyConfig.setOutputDirectory("docs");
  eleventyConfig.setLayoutsDirectory("_layouts");
  eleventyConfig.setTemplateFormats("html,liquid");
  eleventyConfig.addGlobalData('layout', 'default.liquid')
}
