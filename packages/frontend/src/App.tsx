import React, {FC, ReactEventHandler, useEffect, useMemo, useRef, useState} from 'react';
import './App.css';
import screenData from './data/screenData.json'


type ScreenProps = {
  index: number
  start: number
  end: number
  screenShot: string
  text:string
  visible: boolean
}

const Screen:FC<ScreenProps> = ({
  end,
  index,
  start,
  screenShot,
  text,
  visible
}) => {
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

  const header = useMemo(() => <div className="screenHeader">
      <div className="title">Screen {index+1}</div>
      <div className="timecode">{timecode(start)} - {timecode(end)}</div>
    </div>, [index, start, end])

  return visible ? (
    <div className="screen">
      {header}
      <div className="screenContents">
        <img src={`./data/${screenShot}`} />
        <textarea className="parseText">{text}</textarea>
      </div>
    </div>
  ) : <></>
}

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)

  const [currentVideoTime, setCurrentVideoTime] = useState(0)
  const handleVideoSeek:ReactEventHandler<HTMLVideoElement> = (e) => {
    const time = videoRef.current?.currentTime
    setCurrentVideoTime(Math.round(time ?? 0))
  }

  useEffect(() => {
    const videoPoll = setInterval(() => {
      setCurrentVideoTime(Math.round(videoRef.current?.currentTime ?? 0))
    }, 1000)
    
    return () => clearInterval(videoPoll)
  })

  return (
    <div className="App">
      <video ref={videoRef} src="./data/sample.mp4" controls onSeeked={handleVideoSeek}/>
      {
        screenData.screens.map((screen, index) => (
          <Screen 
            index={index} 
            {...screen} 
            visible={currentVideoTime >= screen.start &&
              currentVideoTime <= screen.end
            }
          />
        ))
      }
    </div>
    
  )
}

export default App;
