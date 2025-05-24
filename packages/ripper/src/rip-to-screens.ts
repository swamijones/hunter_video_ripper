import { spawnSync } from 'child_process'
// rip one frame
// ffmpeg -i inputvideo.mp4 -ss 00:00:03 -frames:v 1 foobar.jpeg

// img sequence at 1 frame sec
// ffmpeg -i input1080p.mp4 -r 1 -s 1280x720 -f image2 screenshot-%03d.jpg
const ffmpegExec = `./lib/ffmpeg/bin/ffmpeg` 

// const frameRip = spawnSync(ffmpegExec, [
//     '-i','./media/sample.mp4',
//     '-ss','00:00:03',
//     '-frames:v','1',
//     'foobar.jpeg'
// ], {stdio: 'inherit'})

const frameRip = spawnSync(ffmpegExec, [
    '-i','../../media/sample.mp4',
    '-r','1',
    '-f','image2',
    '-c:v', 'png',
    '../../media/screenshot-%05d.png'
], {stdio: 'inherit'})

console.log('Doneski')