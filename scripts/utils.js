const titlecase = (v) => {
  let name = v.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  )
  // Irish cases
  name = name.replace("O'c", "O'C")
  name = name.replace("O'h", "O'H")

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

  // Joe Petty Rule
  n = n.replace ("Joseph M.", "Joseph")

  // Donna Colorio Rule
  n = n.replace ("Donna M.", "Donna")

  //Rosen Rule
  n = n.replace ("S. Gary", "Gary")

  // Sarkodieh rule
  n = n.replace ("Owura-kwaku P.", "Owura")
  n = n.replace ("Owura-kwaku", "Owura")


  return n.trimEnd()
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

module.exports = {
  titlecase: titlecase,
  normalizeNames: normalizeNames,
  writeFile: writeFile
}
