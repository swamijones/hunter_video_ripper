import React, {FC, useEffect, useRef, useState} from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { getRipProgress, getVideo, ripVideo } from '../api'

export const RipVideo:FC = () => {
    const [isRipping, setIsRipping] = useState(false)
    const [isRipped, setIsRipped] = useState(false)
    const { hash } = useParams()
    const [videoName, setVideoName] = useState<string>()
    const pollingRef = useRef<NodeJS.Timer>(null)
    const [progressData, setProgressData] = useState<number[]>([0,0,0])
    const navigate = useNavigate()

    if(progressData[0] == 1 && progressData[1] ==1 && progressData[2] == 1){
        navigate(`/view-rip/${hash}`)
    }

    useEffect(()=>{
        if(hash){
            getVideo(hash).then(({ripStatus, video}) => {
                setVideoName(video)
                if(ripStatus === 'complete'){
                    setIsRipped(true)
                }
            })
        }
    }, [])

    const startRip = () => {
        if(!hash){
            throw 'Failed to read hash.'
        }
        setIsRipping(true)
        ripVideo(hash)
        pollingRef.current = setInterval(() => {
            getRipProgress(hash).then(({rip, slides, text}) => {
                setProgressData([rip, slides, text])
            })
        }, 3000)
    }

    const progress = [
        { label: 'Dump Screens' , level: progressData[0]},
        { label: 'Find Scenes' , level: progressData[1]},
        { label: 'Parse Text' , level: progressData[2]},
    ]

    return <div className="videoRip mainColumn">
        <h2>Ripping Video {videoName}</h2>
        {isRipped ? <>
                <p>Video already ripped.</p>
                <Link to={`/view-rip/${hash}`}>View Video</Link>
            </>
            : <><div className="progress">
                {progress.map((task, index) => (
                    <div key={`progress.${index}`} className="progressRow">
                        <div className="label">{task.label}</div>
                        <div className="bar">
                            <div className="track" style={{width: `${Math.round(task.level*100)}%`}}></div>
                        </div>
                    </div>
                ))}
            </div>
            {!isRipping && <button onClick={startRip}>Start Video Rip</button>}
            </>
        }
    </div>
}