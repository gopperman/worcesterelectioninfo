const fs = require('fs')
const { parse } = require('csv-parse')

let candidates = [
  { name: 'Satya Mitra' },
  { name: 'Joe Petty' },
  { name: 'Moe Bergman' },
  { name: 'Donna Colorio' },
  { name: 'Cayden Davis' },
  { name: 'Charles Luster' },
  { name: 'Edson Montero' },
  { name: 'Gary Rosen' },
  { name: 'Jermoh Kamara' },
  { name: 'Jessica Pepple' },
  { name: 'Kate Toomey' },
  { name: 'Candy Mero-Carlson'},
  { name: 'Owura Sarkodieh'},
  { name: 'Khrystian King'}
]

let allDonors = {}

const processAllTime = (candidate) => {
  return new Promise( (resolve, reject) => {
    let donors = {}
    let annualDonations = {}
    // We expect filenames to be kebab-case'd versions of the candidates names
    const file = `data/alltime/${candidate.name.replace(' ','-').toLowerCase()}.csv`
    fs.createReadStream(file)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => {
        const year = row.Date.slice(-4)
        const amt = +row.Amount.replace('$','').replace(',','')
        const { Contributor, City, State } = row

        if (year in annualDonations) {
          annualDonations[year] += amt
        } else {
          annualDonations[year] = amt

        }

        if (Contributor in donors) {
          donors[Contributor].total += amt
        } else {
          donors[Contributor] = {
            total: amt,
            city: City,
            state: State
          }
        }

        if (Contributor in allDonors) {

        } else {

        }
      })
      .on('end', () => {
        let sortableDonors = []
        for (d in donors) {
          sortableDonors.push([d, donors[d].total, donors[d].city, donors[d].state])
        }

        sortableDonors.sort((a,b) => {
          return b[1] - a[1]
        });

        let topDonors = {}
        sortableDonors.slice(0,20).forEach(d => {
          topDonors[d[0]] = {
            total: d[1],
            city: d[2],
            state: d[3]
          }
        })

        results = {
          annualDonations,
          topDonors
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

const processfile = (candidate) => {
  return new Promise( (resolve, reject) => {
    let totalDonations = 0
    let rows = 0
    let worcDonations = 0
    let maDonations = 0
    let oosDonations = 0
    let results
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
          worcPct: (worcDonations / totalDonations) || 0,
          maPct: (maDonations / totalDonations) || 0,
          oosPct: (oosDonations / totalDonations) || 0,
        }
        results = {
          ...percents,
          worcDonations: +worcDonations.toFixed(2),
          maDonations: +maDonations.toFixed(2),
          oosDonations: +oosDonations.toFixed(2),
          totalDonations: +totalDonations.toFixed(2),
          averageDonation: +((totalDonations / rows) || 0).toFixed(2),
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

const allTimePromises = candidates.map((c) => processAllTime(c))

const currentPromises = candidates.map((c) => processfile(c))

Promise.all(currentPromises).then((x) => {
  Promise.all(allTimePromises).then((y) => {
    const z = x.map((candidate) => {
      const allTime = y.find((el) => el.name === candidate.name)
      return {
        ...candidate,
        annualDonations: allTime.annualDonations,
        topDonorsAllTime: allTime.topDonors
      }
    })

    const writeFile = '../_data/candidates.json'
    const data = JSON.stringify(z, null, 2)

    fs.writeFile(writeFile, data, (err) => {
        if (err) {
            console.error("Error writing file:", err)
            return;
        }
        console.log("File written ")
    })
  })
})

