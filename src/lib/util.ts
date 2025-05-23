import fs from 'fs'

export const getScreenshots = (screenshotDir: string) => {
    const files = fs.readdirSync(screenshotDir)
    return files.filter(fileName => fileName.includes('.png'))
        .map(fileName => `${screenshotDir}/${fileName}`)  
}