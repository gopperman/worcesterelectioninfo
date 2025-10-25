const fs = require('fs')
const { parse } = require('csv-parse')
const utils = require('./utils.js')

const processDonorInfo = () => {
  const file = `data/donor-info.csv`
  fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
          console.error('Error reading file:', err)
          return
      }
      const fileContent = parse(data, { columns: true, skip_empty_lines: true }, (err, parsedData) => {
        if (err) {
          console.error('Error parsing file:', err)
          return
        }
        return parsedData
      })
  })
}

console.log('hey!')
processDonorInfo()



