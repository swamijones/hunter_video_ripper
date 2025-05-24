import fs from 'fs'
import path from 'path';
import { createWorker } from 'tesseract.js'

(async () => {  
  const dataPath = path.resolve(__dirname, '..', '..', '..', 'media', 'screenData.json')
  const {screens} = require(dataPath)
  let screenCounter = 0
  const worker = await createWorker('eng');
  while(screenCounter < screens.length){
    const {screenShot} = screens[screenCounter]
    const ret = await worker.recognize(screenShot);
    screens[screenCounter].text = ret.data.text
    screenCounter++
  }
  await worker.terminate();

  fs.writeFileSync(dataPath, JSON.stringify({screens}, null, 2))
})();