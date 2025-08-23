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
      return v[0] ? v[0].toUpperCase() : ''
    }
  })

  eleventyConfig.addFilter("money", (v) => {
    return '$' + Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  })

  eleventyConfig.addFilter("percent", (v) => {
    return (v * 100).toFixed(1)
  })
}
