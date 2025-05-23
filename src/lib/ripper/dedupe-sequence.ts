const testDir = './media'

import fs from 'fs';
import {PNG} from 'pngjs';
import pixelmatch from 'pixelmatch';
import { getScreenshots } from '../util';

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
    console.log(pixelDiffPercent)
    return pixelDiffPercent < threshold
}

const shotList = getScreenshots(testDir)

for(var i = 1; i<shotList.length; i++){
    const isSame = isSameImage(shotList[i-1], shotList[i])
    
    if(isSame){
        console.log('removing', shotList[i-1])
        fs.rmSync(shotList[i-1])
    }
}