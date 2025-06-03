export const timecode = (seconds:number) => {
    const sigfig = (n:number) => n>=10 ? n : `0${n}`

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