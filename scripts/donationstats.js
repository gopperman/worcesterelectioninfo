const fs = require('fs')
const { parse } = require('csv-parse')
const converter = require('json-2-csv')

let candidates = [
  { name: 'Candy Mero-Carlson'},
  { name: 'Cayden Davis' },
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

const titlecase = (v) => {
  let name = v.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  )
  // Irish cases
  name = name.replace("O'c", "O'C")
  name = name.replace("O'h", "O'H")
  name = name.replace("O'd", "O'D")

  // Corp cases
  name = name.replace(" Pac", " PAC")
  name = name.replace(" Llc", " LLC")

  return name
}

const normalizeNames = (name) => {
  let n = name

  // Mello Rule
  if (n.includes("Generations Mello All")) {
    n = "Generations Mello All PAC"
  }

  // Chip Norton Rule
  n = n.replace("Chip", "Charles")

  // Candidate loan rule
  n = n.replace (" (Candidate Loan)", "")
  n = n.replace (" (Loan)", "")

  // Normalize Committees
  n = n.replace ("Commitee", "Committee")
  n = n.replace ("Comm ", "Committee ")
  n = n.replace ("Comm.", "Committee")

  // Joe Petty Rule
  n = n.replace ("Joseph M.", "Joseph")

  // Donna Colorio Rule
  n = n.replace ("Donna M.", "Donna")

  //Rosen Rule
  n = n.replace ("S. Gary", "Gary")

  // Sarkodieh rule
  n = n.replace ("Owura-kwaku P.", "Owura")
  n = n.replace ("Owura-kwaku", "Owura")

  // The Krocks
  n = n.replace ("Janet, Krock", "Krock, Janet") // Janet appears in the wrong order for one donation
  n = n.replace ("Krock, Kathryn E", "Krock, Kathryn")
  n = n.replace ("Parvin, Kathryn", "Parvin, Kathryn (Krock)")
  n = n.replace ("Krock, Kathryn", "Parvin, Kathryn (Krock)")

  n = n.replace ("Gavel, Adam", "Gaval, Adam")

  // Sallooms
  // // Donna's more recently listed as Salloom, not Salloom George
  n = n.replace ("Salloom George", "Salloom")
  n = n.replace ("George, Donna Saloom", "Salloom, Donna")
  n = n.replace ("George, Donna Salloom", "Salloom, Donna")

  if (n === "George, Donna") {
    n = n.replace ("George, Donna", "Salloom, Donna")
  }
 // n = n.replace ()

  n = n.replace ("Saloom, Jr., Edwards", "Salloom Jr., Edward")
  n = n.replace ("Salloom, Jr., Edward", "Salloom Jr., Edward")
  n = n.replace ("Saloom, Jr.", "Salloom Jr.")
  n = n.replace ("Salloom, Edward Jr", "Salloom Jr., Edward")

  n = n.replace ("Salloom, Edward G", "Salloom Jr., Edward")
  if (n === "Salloom, Edward") n = "Salloom Jr., Edward"

  // O'Connors
  n = n.replace ("O'Connor, Daniel", "O'Connor, Dan")
  n = n.replace ("O'Conner, Daniel", "O'Connor, Dan")
  n = n.replace ("O'Conner, Claire", "O'Connor, Claire")

  // Rucker Rule
  n = n.replace ("Rucker, Clifford", "Rucker, Cliff")

  // O'Days
  n = n.replace ("James  O'Day", "James O'Day")
  n = n.replace ("Murphy-o'day", "O'Day")
  n = n.replace ("Elect James J. O'Day", "Elect James O'Day")
  n = n.replace ("James J O'Day", "James O'Day")
  if (n === "O'Day Committee") n = "James O'Day Committee"

  // Tim Murray
  n = n.replace ("Murray, Timothy", "Murray, Tim")

  // Jeremiah Bianculi
  n = n.replace ("Bianculli, Jeremiah J", "Bianculli, Jeremiah")

  // Jeff Burk
  n = n.replace ("Burk, Jeffrey", "Burk, Jeff")

  return n.trimEnd()
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
        const { City, State } = row
        const Contributor = normalizeNames(titlecase(row.Contributor))

        allTimeDonations += amt

        const cycleYear = electionCycle(year)
        if (cycleYear in annualDonations) {
          annualDonations[cycleYear] += amt
        } else {
          annualDonations[cycleYear] = amt
        }
        if (Contributor !== "Aggregated Unitemized Receipts" && Contributor !== "") {
          if (Contributor in donors) {
            donors[Contributor].total += amt
          } else {
            donors[Contributor] = {
              total: amt,
              city: City,
              state: State.toUpperCase()
            }
          }

          if (Contributor in allTimeDonors) {
            allTimeDonors[Contributor].total += amt
            allTimeDonors[Contributor].donations.push({
                name: candidate.name,
                date: row.Date,
                amount: amt
            })
            if (candidate.name in allTimeDonors[Contributor].donationTotals) {
              allTimeDonors[Contributor].donationTotals[candidate.name] += amt
            } else {
              allTimeDonors[Contributor].donationTotals[candidate.name] = amt
            }
          } else {
            allTimeDonors[Contributor] = {
              total: amt,
              city: City,
              state: State.toUpperCase(),
              donations: [{
                name: candidate.name,
                date: row.Date,
                amount: amt
              }],
              donationTotals: {
                [candidate.name]: amt
              }
            }
          }
        }
      })
      .on('end', () => {
        resolve({
          ...candidate,
          allTimeDonations,
          annualDonations,
          topDonorsAllTime: sortDonors(donors).slice(0,50)
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
        const { City, State } = row
        const Contributor = normalizeNames(titlecase(row.Contributor))
        totalDonations += amount
        rows++

        if (State.toUpperCase() !== 'MA') {
          oosDonations += amount
        } else {
          if (City == 'Worcester') {
            worcDonations += amount
          } else {
            maDonations += amount
          }
        }

        // Track top donors
        if (Contributor !== "Aggregated Unitemized Receipts" && Contributor !== "") {
          if (Contributor in currentCycleDonors) {
            currentCycleDonors[Contributor].total += amount

            const canIndex = currentCycleDonors[Contributor].donations.findIndex((v) => v.name === candidate.name)
            if (canIndex !== -1) {
              currentCycleDonors[Contributor].donations[canIndex].amount += amt
            } else {
              currentCycleDonors[Contributor].donations.push({
                name: candidate.name,
                amount: amt
              })
            }

            /* Flip this back on if you want granular donations, by date */
            /*
            currentCycleDonors[Contributor].donations.push({
                name: candidate.name,
                date: row.Date,
                amount: amt
            })
            */
          } else {
            currentCycleDonors[Contributor] = {
              total: amt,
              city: City,
              state: State.toUpperCase(),
              donations: [{
                name: candidate.name,
                amount: amt
              }]
            }
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
    const sortedAllTimeDonors = sortDonors(allTimeDonors)
    writeFile('all-time-donors.json', sortedAllTimeDonors)

    //Build Current Donors
    const sortedCurrentDonors = sortDonors(currentCycleDonors)
    aggregateDonorData(sortedCurrentDonors, sortedAllTimeDonors).then((data) => {
      writeFile('current-cycle-donors.json', data.donors)
      writeFile('current-cycle-stats.json', data.donorStats)
    })

    // Write Current Donor Files
    writeFile('current-cycle-top-donors.json', sortedCurrentDonors.slice(0,100))

    // Remove donors for CSV export
    const currentDonorsForCSV = sortedCurrentDonors.map(({donations, ...keep}) => keep)
    writeFile('current-cycle-all-donors.csv', converter.json2csv(currentDonorsForCSV), false)
  })
})


/**
 * Add lifetime donation totals to current cycle donors, and metadata from external spreadsheet
 * @param  {array} currentCycleDonors [description]
 * @param  {array} allTimeDonors      [description]
 * @return {array}                    [description]
 */
const aggregateDonorData = (currentCycleDonors, allTimeDonors) => {
  return new Promise( (resolve, reject) => {
    let donorStats = {
      tags: {},
      CoC: {
        total: 0,
        count: 0
      }
    }

    let aggregate = currentCycleDonors.map( (donor) => {
      const donorMatch = allTimeDonors.find(d => d.name === donor.name)
      if (donorMatch) {
        return {
          ...donor,
          lifetimeTotal: donorMatch.total,
          donationTotals: donorMatch.donationTotals
        }
      } else {
        let donationTotals = {}
        donor.donations.forEach( i => {
          if (donationTotals[donor.name]) {
            donationTotals[donor.name] += i.amount
          } else {
            donationTotals[donoor.name] = amount
          }
        })
        return {
          ...donor,
          lifetimeTotal: donor.total,
          donationTotals
        }
      }
    })

    // Add metadata
    const donorMetaFile = './data/donor-info.csv'
    fs.createReadStream(donorMetaFile)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => {

        const index = aggregate.findIndex( d => d.name === normalizeNames(titlecase(row.Name)))

        if (index !== -1) {
          aggregate[index] = {
            ...aggregate[index],
            CoC: row['Chamber of Commerce?'] === 'TRUE' ? true : false,
            job: row.Job,
            company: row.Company,
            source: row.Source,
            description: row.Description,
            notes: row['Additional Notes']
          }
          if (row['Category 1']) {
            aggregate[index].tags = [row['Category 1']]
            if (row['Category 1'] in donorStats.tags) {
              donorStats.tags[row['Category 1']].total += aggregate[index].total
              donorStats.tags[row['Category 1']].count++
            } else {
              donorStats.tags[row['Category 1']] = {
                total: aggregate[index].total,
                count: 1
              }
            }
          }
          if (row['Category 2']) {
            aggregate[index].tags.push(row['Category 2'])

            if (row['Category 2'] in donorStats.tags) {
              donorStats.tags[row['Category 2']]['total'] += aggregate[index].total
              donorStats.tags[row['Category 2']].count++
            } else {
              donorStats.tags[row['Category 2']] = {
                total: aggregate[index].total,
                count: 0
              }
            }
          }

          // Chamber of Commerce Stats
          if (row['Chamber of Commerce?'] === 'TRUE') {
            donorStats.CoC.total += aggregate[index].total
            donorStats.CoC.count++
          }
        }
      })
      .on('end', () => {
        resolve({
          donorStats,
          donors: aggregate
        })
      })
      .on('error', (err) => {
        reject(err)
      })
  })
}

const writeFile = (filename, data, stringify = true) => {
  const filePath = `../_data/${filename}`
  const dataString = stringify ? JSON.stringify(data, null, 2) : data

  fs.writeFile(filePath, dataString, (err) => {
      if (err) {
          console.error("Error writing file:", err)
          return
      }
      console.log(`${filename} written`)
  })
}

