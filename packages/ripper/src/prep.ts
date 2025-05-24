import fs from 'fs'
import path from 'path'

const outputDir = path.resolve(__dirname, '..', '..', '..', 'packages/frontend/')
const dataPath = path.resolve(__dirname, '..', '..', '..', 'media')

const { screens } = require(`${dataPath}/screenData.json`)

if(!fs.existsSync(`${outputDir}/public/data`)){
    fs.mkdirSync(`${outputDir}/public/data`)
}

if(!fs.existsSync(`${outputDir}/src/data`)){
    fs.mkdirSync(`${outputDir}/src/data`)
}

for(let i = 0; i<screens.length; i++){
    const srcFile = screens[i].screenShot
    const baseFile = path.basename(srcFile)
    const outFile = path.resolve(outputDir, 'public/data', baseFile) 
    fs.copyFileSync(srcFile, outFile)
    screens[i].screenShot = baseFile
    console.log(baseFile)
}

fs.copyFileSync(`${dataPath}/sample.mp4`, `${outputDir}/sample.mp4`)
fs.writeFileSync(`${outputDir}/src/data/screenData.json`, JSON.stringify({screens}, null, 2))