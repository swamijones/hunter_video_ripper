import fs from 'fs';
import {PNG} from 'pngjs';
import pixelmatch from 'pixelmatch';
import path from 'path'
import { getScreenshots, Scene } from './util';

type CompareOptions = {
    output?: string
    threshold?: number
}

const isSameImage = (img1Path:string, img2Path:string, options:CompareOptions = {}) => {
    const {
        output,
        threshold = 0.05
    } = options

    const img1 = PNG.sync.read(fs.readFileSync(img1Path));
    const img2 = PNG.sync.read(fs.readFileSync(img2Path));
    const {width, height} = img1;
    const diff = new PNG({width, height});

    const pixelDiff = pixelmatch(img1.data, img2.data, diff.data, width, height, {threshold: 0.1});

    if(output){
        fs.writeFileSync(output, PNG.sync.write(diff));
    }
    
    const pixelDiffPercent = pixelDiff/(width*height)
    return pixelDiffPercent < threshold
}

const { workingDirectory } = process.env
const shotList = getScreenshots(workingDirectory)

const screenData:Scene[] = [{
    start: 0,
}]

const capScene = (endFrame: number) => {
    const scene = screenData[screenData.length-1]
    scene.end = endFrame
    
    const midPoint = scene.start + Math.floor((scene.end - scene.start)/2)
    scene.screenShot = path.basename(shotList[midPoint])
}

const runDuration = shotList.length
for(var i = 1; i<runDuration; i++){
    const isSame = isSameImage(shotList[i-1], shotList[i])
    
    if(!isSame){ 
        capScene(i-1)
        screenData.push({
            start: i,
        })       
    }
    console.log(`PROGRESS:${i/runDuration}`)
}
capScene(i)

const dataPath = `${workingDirectory}/data.json`
const existingData = require(dataPath)

fs.writeFileSync(dataPath, JSON.stringify({
    ...existingData,
    screens:screenData
}, null, 2))

console.log('PROGRESS:COMPLETE')