import { spawn } from 'child_process'
import path from 'path'

type RipOptions = {
    onComplete: () => void
    onProgress: (percent: number) => void
    videoPath: string,
    workingPath: string,
}

const timecodeToSeconds = (timecode:string) => {
    const codes = timecode.split(':')
    return parseInt(codes[0]) * 3600 + parseInt(codes[1]) * 60 + parseInt(codes[2])
}

export const ripToScreens = ({
    onComplete,
    onProgress,
    videoPath, 
    workingPath,
}:RipOptions) => {
    // rip one frame
    // ffmpeg -i inputvideo.mp4 -ss 00:00:03 -frames:v 1 foobar.jpeg

    // img sequence at 1 frame sec
    // ffmpeg -i input1080p.mp4 -r 1 -s 1280x720 -f image2 screenshot-%03d.jpg
    const ffmpegExec = path.resolve(__dirname, '../lib/ffmpeg/bin/ffmpeg')

    // const frameRip = spawnSync(ffmpegExec, [
    //     '-i','./media/sample.mp4',
    //     '-ss','00:00:03',
    //     '-frames:v','1',
    //     'foobar.jpeg'
    // ], {stdio: 'inherit'})

    let videoDuration = 0;

    const frameRip = spawn(ffmpegExec, [
            '-i', videoPath,
            '-r','1',
            '-f','image2',
            '-c:v', 'png',
            `${workingPath}/screenshot-%05d.png`
        ],
    )


    frameRip.stderr.on('data', (data) => {
        const output = data.toString()
        if(output.startsWith('Input')){
            const duration = output.split('Duration: ')[1].split(',')[0]
            videoDuration = timecodeToSeconds(duration)
        }
        if(output.startsWith('frame=')){
            const encoded = output.split('time=')[1].split(' ')[0]
            const progress = timecodeToSeconds(encoded) / videoDuration
            onProgress(progress)
        }
    })

    frameRip.on('exit', (code) => {
        if(code === 0){
            onComplete()
        }
    })
}
