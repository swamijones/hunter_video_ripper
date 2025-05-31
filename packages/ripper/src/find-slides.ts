import {spawn} from 'child_process'
import path from 'path'

type FindSlidesOptions = {
    onComplete: () => void
    onProgress: (percent: number) => void
    workingDirectory: string
}

export const findSlides = ({
    onComplete,
    onProgress,
    workingDirectory,
}:FindSlidesOptions) => {
   const script = path.resolve(__dirname, 'find-slides-process.js')

   const slideFinder = spawn('node', [script], {
        env: {workingDirectory}
    })

   slideFinder.stdout.on('data', (data) => {
        const progress = data.toString().split(':')[1].trim()
        
        if(progress === 'COMPLETE'){
            onComplete()
        }else{
            onProgress(Number(progress))
        }        
   })
}