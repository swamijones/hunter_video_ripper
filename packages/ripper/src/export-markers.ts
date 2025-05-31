import fs from 'fs'
import path from 'path'

const { screens } = require('../../../media/screenData.json')

const template = fs.readFileSync(path.resolve(__dirname, '../../../media/premiere_template.xml')).toString()

  const timecode = (seconds:number) => {
    const sigfig = (n:number) => n>10 ? n : `0${n}`

    let minutes = 0
    let hours = 0
    while (seconds >= 60){
      minutes++
      seconds -= 60
    }
    while (minutes >= 60){
      hours++
      minutes -= 60
    }
    return sigfig(hours) + ':' + sigfig(minutes) + ':' + sigfig(seconds)
  }

const markers = screens.map((screen:any, index:number) => `<marker><comment></comment><name</name><in>${timecode(screen.start)}</in><out>${timecode(screen.end)}</out></marker>`)

const output = template.replace('{{markers}}', markers.join('\n'))

console.log(output)
