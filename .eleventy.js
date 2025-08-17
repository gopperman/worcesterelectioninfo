module.exports = function (eleventyConfig) {
  // Passthroughs
  eleventyConfig.addPassthroughCopy("style.css")
  eleventyConfig.addPassthroughCopy("images")

  //Config
  eleventyConfig.setOutputDirectory("docs")
  eleventyConfig.setLayoutsDirectory("_layouts")
  eleventyConfig.setTemplateFormats("html,liquid")
  eleventyConfig.addGlobalData('layout', 'default.liquid')

  // Collections
  eleventyConfig.addCollection("candidates", (collectionApi) => {
    return collectionApi.getFilteredByGlob("./candidates/*.liquid")
  })

  // Filters
  eleventyConfig.addFilter("district", (v) => {
    if (v[0] && v[0] === 'atlarge') {
      return v[0].replace("atlarge", "At-Large")
    } else {
      return v[0] && v[0].toUppercase
    }
  })
}
