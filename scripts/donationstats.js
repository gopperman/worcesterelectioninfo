const fs = require('fs')
const { parse } = require('csv-parse')

let candidates = [
  { name: 'Satya Mitra' },
  { name: 'Joe Petty' },
  { name: 'Moe Bergman' },
  { name: 'Donna Colorio' },
  { name: 'Cayden Davis' }
]

const processfile = (candidate) => {
  let totalDonations = 0
  let rows = 0
  let worcDonations = 0
  let maDonations = 0
  let oosDonations = 0
  let results

  return new Promise( (resolve, reject) => {
    // We expect filenames to be kebab-case'd versions of the candidates names
    const file = `data/2024-2025/${candidate.name.replace(' ','-').toLowerCase()}.csv`
    fs.createReadStream(file)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => {
        rows++
        const amount = +row.Amount.replace('$','').replace(',','')
        totalDonations += amount

        if (row.State !== 'MA') {
          oosDonations += amount
        } else {
          if (row.City == 'Worcester') {
            worcDonations += amount
          } else {
            maDonations += amount
          }
        }
      })
      .on('end', () => {
        const percents = {
          worcPct: worcDonations / totalDonations,
          maPct: maDonations / totalDonations,
          oosPct: oosDonations / totalDonations,
        }
        results = {
          ...percents,
          worcDonations: +worcDonations.toFixed(2),
          maDonations: +maDonations.toFixed(2),
          oosDonations: +oosDonations.toFixed(2),
          totalDonations: +totalDonations.toFixed(2),
          averageDonation: +(totalDonations / rows).toFixed(2),
          donations: rows
        }

        resolve({
          ...candidate,
          ...results
        })
      })
      .on('error', (err) => {
        reject(err)
    })
  })
}

const promises = candidates.map((c) => processfile(c))
Promise.all(promises).then((v) => {
  const writeFile = '../_data/candidates.json'
  const data = JSON.stringify(v, null, 2)

  fs.writeFile(writeFile, data, (err) => {
      if (err) {
          console.error("Error writing file:", err)
          return;
      }
      console.log("File written ")
  })
})

