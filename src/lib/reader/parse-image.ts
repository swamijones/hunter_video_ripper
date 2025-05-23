const testDir = './media'

import fs from 'fs'
import { createWorker } from 'tesseract.js'
import { getScreenshots } from '../util'

(async () => {  
  const shotList = getScreenshots(testDir)
  let shotCounter = 0
  const worker = await createWorker('eng');
  while(shotCounter < shotList.length){
    const fileName = shotList[shotCounter]
    const ret = await worker.recognize(fileName);
    fs.writeFileSync(fileName.replace(/\.png/, '.txt'), ret.data.text)
    shotCounter++
  }
  await worker.terminate();
})();