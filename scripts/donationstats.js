const fs = require('fs')
const { parse } = require('csv-parse')

let candidates = [
  {
    name: 'Satya Mitra',
    file: 'data/2023-2025/satya-mitra.csv'
  },
  {
    name: 'Joe Petty',
    file: 'data/2023-2025/joe-petty.csv'
  }
]

const processfile = (candidate) => {
  let totalDonations = 0
  let rows = 0
  let worcDonations = 0
  let maDonations = 0
  let oosDonations = 0
  let results

  return new Promise( (resolve, reject) => {
    fs.createReadStream(candidate.file)
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
        results = {
          worcDonations: worcDonations.toFixed(2),
          maDonations: maDonations.toFixed(2),
          oosDonations: oosDonations.toFixed(2),
          totalDonations: totalDonations.toFixed(2),
          averageDonation: (totalDonations / rows).toFixed(2),
          donations: rows,
        }
        /*const index = candidates.findIndex(({name}) => name === candidate.name)
        candidates[index] = {
          ...candidate,
          ...results
        }*/
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
  console.log(v)
})

