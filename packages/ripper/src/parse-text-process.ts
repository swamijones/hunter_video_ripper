import fs from 'fs'
import path from 'path';
import { createWorker } from 'tesseract.js'

(async () => {  
  const { workingDirectory } = process.env
  const dataPath = path.resolve(workingDirectory, 'data.json')
  const {screens, ...existingData} = require(dataPath)
  
  let screenCounter = 0
  const worker = await createWorker('eng');
  while(screenCounter < screens.length){
    const {screenShot} = screens[screenCounter]
    const ret = await worker.recognize(`${workingDirectory}/${screenShot}`);
    screens[screenCounter].text = ret.data.text
    console.log(`PROGRESS:${(screenCounter / screens.length)}`)
    screenCounter++
  }
  await worker.terminate();
  
  const savedData = JSON.stringify({
    ...existingData,
    screens,
  }, null, 2)

  fs.writeFileSync(dataPath, savedData)
  console.log('PROGRESS:COMPLETE')
})()
