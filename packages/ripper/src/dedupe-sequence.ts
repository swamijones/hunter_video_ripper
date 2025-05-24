const testDir = '../../media'

import fs from 'fs';
import {PNG} from 'pngjs';
import pixelmatch from 'pixelmatch';
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

const shotList = getScreenshots(testDir)

const screenData:Scene[] = [{
    start: 0,
}]

const capScene = (endFrame: number) => {
    const scene = screenData[screenData.length-1]
    scene.end = endFrame

    const midPoint = scene.start + Math.round((scene.end - scene.start)/2)
    scene.screenShot = shotList[midPoint]  
}

const runDuration = process.env.DEV_MODE ? 300 : shotList.length
for(var i = 1; i<runDuration; i++){
    const isSame = isSameImage(shotList[i-1], shotList[i])
    
    if(!isSame){ 
        console.log(`Parsing Screens... ${Math.round((i/shotList.length)*100)}%`)
        capScene(i-1)
        screenData.push({
            start: i,
        })       
    }
}
console.log(`Parsing Screens... 100}%`)
capScene(i)

fs.writeFileSync(`${testDir}/screenData.json`, JSON.stringify({
    screens:screenData
}, null, 2))