import {spawn} from 'child_process'
import path from 'path'

type ParseTextOptions = {
  onComplete: () => void
  onProgress: (percent: number) => void
  workingDirectory: string
}

export const parseText = async ({
  onComplete,
  onProgress,
  workingDirectory,
}:ParseTextOptions) => {
    const script = path.resolve(__dirname, 'parse-text-process.js')

    const textParser = spawn('node', [script], {
        env: {workingDirectory}
    })
    
    textParser.stderr.on('data', (data) => console.warn(data.toString()))

    textParser.stdout.on('data', (data) => {
        const progress = data.toString().split(':')[1].trim()
        
        if(progress === 'COMPLETE'){
            onComplete()
        }else{
            onProgress(Number(progress))
        }        
    })
}