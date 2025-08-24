module.exports = function (eleventyConfig) {
  // Passthroughs
  eleventyConfig.addPassthroughCopy("style.css")
  eleventyConfig.addPassthroughCopy("charts.js")
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

  eleventyConfig.addFilter("count", (v) => {
    return Object.keys(v).length
  })

  eleventyConfig.addFilter("json", (v) => {
    return JSON.stringify(v, null, 2);
  })


  eleventyConfig.addFilter("money", (v) => {
    return '$' + Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  })

  eleventyConfig.addFilter("percent", (v) => {
    return (v * 100).toFixed(1)
  })

  eleventyConfig.addFilter("firstlast", (v) => {
    if (v.includes(', ')) {
      const split = v.split(', ')
      return `${split[1]} ${split[0]}`
    } else {
      return v
    }
  })

  eleventyConfig.addFilter("titlecase", (v) => {
    return v.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  )
  })

  eleventyConfig.addFilter("isAtLarge", (v) => {
    return v.data.tags.includes("atlarge")
  })
}
