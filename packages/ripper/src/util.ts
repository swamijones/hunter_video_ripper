import fs from 'fs'

export type Scene = {
    start: number 
    end?: number 
    screenShot?: string
    text?: string 
}

export const getScreenshots = (screenshotDir: string) => {
    const files = fs.readdirSync(screenshotDir)
    return files.filter(fileName => fileName.includes('.png'))
        .map(fileName => `${screenshotDir}/${fileName}`)  
}