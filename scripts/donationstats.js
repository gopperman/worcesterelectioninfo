const fs = require('fs')
const { parse } = require('csv-parse')

let candidates = [
  { name: 'Candy Mero-Carlson'},
  { name: 'Cayden Davis' },
  { name: 'Charles Luster' },
  { name: 'Donna Colorio' },
  { name: 'Edson Montero' },
  { name: 'Etel Haxhiaj'},
  { name: 'Gary Rosen' },
  { name: 'Jermoh Kamara' },
  { name: 'Jessica Pepple' },
  { name: 'Joe Petty' },
  { name: 'John Fresolo' },
  { name: 'Jose Rivera' },
  { name: 'Kate Toomey' },
  { name: 'Keith Linhares' },
  { name: 'Khrystian King'},
  { name: 'Luis Ojeda'},
  { name: 'Moe Bergman' },
  { name: 'Owura Sarkodieh'},
  { name: 'Rob Bilotta' },
  { name: 'Robert Pezzella' },
  { name: 'Satya Mitra' },
  { name: 'Ted Kostas' },
  { name: 'Tony Economou' },
]

let allTimeDonors = {}
let currentCycleDonors = {}

const sortDonors = (donors) => {
  let sortableDonors = []
  for (d in donors) {
    sortableDonors.push([["name", d], ...Object.entries(donors[d])])
  }

  sortableDonors.sort((a,b) => {
    return b[1][1] - a[1][1]
  });

  return sortableDonors.map(d => Object.fromEntries(d))
}

const electionCycle = (y) => {
  if (+y % 2 === 0) {
    // Even year
    return `${y}-${+y+1}`
  } else {
    return `${+y-1}-${y}`
  }
}
const processAllTime = (candidate) => {
  return new Promise( (resolve, reject) => {
    let donors = {}
    let annualDonations = {}
    let allTimeDonations = 0
    // We expect filenames to be kebab-case'd versions of the candidates names
    const file = `data/alltime/${candidate.name.replace(' ','-').toLowerCase()}.csv`
    fs.createReadStream(file)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => {
        const year = row.Date.slice(-4)
        const amt = +row.Amount.replace('$','').replace(',','')
        const { Contributor, City, State } = row

        allTimeDonations += amt

        const cycleYear = electionCycle(year)
        if (cycleYear in annualDonations) {
          annualDonations[cycleYear] += amt
        } else {
          annualDonations[cycleYear] = amt
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

        if (Contributor in allTimeDonors) {
          allTimeDonors[Contributor].total += amt
          allTimeDonors[Contributor].donations.push({
              name: candidate.name,
              date: row.Date,
              amount: amt
          })
        } else {
          allTimeDonors[Contributor] = {
            total: amt,
            city: City,
            state: State,
            donations: [{
              name: candidate.name,
              date: row.Date,
              amount: amt
            }]
          }
        }
      })
      .on('end', () => {
        resolve({
          ...candidate,
          allTimeDonations,
          annualDonations,
          topDonorsAllTime: sortDonors(donors).slice(0,20)
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
        const amount = +row.Amount.replace('$','').replace(',','')
        const year = row.Date.slice(-4)
        const amt = +row.Amount.replace('$','').replace(',','')
        const { Contributor, City, State } = row
        totalDonations += amount
        rows++

        if (State !== 'MA') {
          oosDonations += amount
        } else {
          if (City == 'Worcester') {
            worcDonations += amount
          } else {
            maDonations += amount
          }
        }

        // Track top donors
        if (Contributor in currentCycleDonors) {
          currentCycleDonors[Contributor].total += amount
          currentCycleDonors[Contributor].donations.push({
              name: candidate.name,
              date: row.Date,
              amount: amt
          })
        } else {
          currentCycleDonors[Contributor] = {
            total: amt,
            city: City,
            state: State,
            donations: [{
              name: candidate.name,
              date: row.Date,
              amount: amt
            }]
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
        allTimeDonations: allTime.allTimeDonations,
        annualDonations: allTime.annualDonations,
        topDonorsAllTime: allTime.topDonorsAllTime
      }
    })

    // Write Candidate Data
    writeFile('candidates.json', z)

    // Write All-time Donor Data
    writeFile('all-time-donors.json', sortDonors(allTimeDonors).slice(1,101))

    writeFile('current-cycle-top-donors.json', sortDonors(currentCycleDonors).slice(0,100))
  })
})

const writeFile = (filename, data) => {
  const filePath = `../_data/${filename}`
  const dataString = JSON.stringify(data, null, 2)

  fs.writeFile(filePath, dataString, (err) => {
      if (err) {
          console.error("Error writing file:", err)
          return
      }
      console.log(`${filename} written`)
  })
}

