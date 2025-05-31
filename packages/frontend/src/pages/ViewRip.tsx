import { FC, FormEventHandler, ReactEventHandler, useEffect, useMemo, useRef, useState } from "react"

import { Link, useParams } from "react-router"
import { getVideo, saveVideoData } from "../api"
import { timecode } from "../util"
import { RippedVideo, VideoScreen } from "../types"

type ScreenEntryProps = {
    index:number
    showAll:boolean
    screen:VideoScreen
    onClick: () => void
}

const ScreenEntry:FC<ScreenEntryProps> = ({index, screen, showAll, onClick}) => {
    const {status, start, end} = screen

    if(status === 'gray' && !showAll){
        return <></>
    }
    return <div className={`screen ${status}`} onClick={onClick}>
        <div className="label">Screen {index+1} <span className="timespan">{timecode(start)}-{timecode(end)}</span></div>
    </div>
}

type ScreenBrowserProps = {
    screens: Required<RippedVideo>['screens']
    chooseScreen: (screen:number) => void
}

const ScreenBrowser:FC<ScreenBrowserProps> = ({chooseScreen, screens}) => {
    const [showAllScreens, setAllScreens] = useState(false)
    const toggleAll = () => setAllScreens(!showAllScreens)
    return (
        <div className="screenBrowser">
            <label>
                <input type="checkbox" checked={showAllScreens} onClick={toggleAll}/>
                Show all Screens
            </label>
            <div className="screenList">
                {screens.map((screen, index) => {
                    const entryChange = () => {
                        chooseScreen(index)
                    }
                    return <ScreenEntry showAll={showAllScreens} screen={screen} index={index} onClick={entryChange} />
                })}
            </div>
        </div>
    )
}

type StatusChooserProps = {
    status: VideoScreen['status']
    onChange: (status: VideoScreen['status']) => void
}

const StatusChooser:FC<StatusChooserProps> = ({
    status,
    onChange,
}) => {
    const statuses = [
        {status: 'green', label: 'Ready for Design'}, 
        {status: 'red', label: 'Need Discussion'},
        {status: 'gray', label: 'Unecessary Screen'},
    ] as {status:VideoScreen['status'], label:string}[]

    return <div className="statusChooser">
        {statuses.map(s => {
            const handleClick = () => onChange(s.status)
            return (
                <button onClick={handleClick} 
                    className={`${s.status} ${s.status === status ? 'active': ''}`} key={`status.${s.status}`}>
                    {s.label}
                </button>
            )
        })}
    </div>
}

type ScreenViewerProps = {
    screen: VideoScreen
    index: number
    onDataChange: (screen:VideoScreen) => void
}

const ScreenViewer:FC<ScreenViewerProps> = ({onDataChange, index, screen}) => {
    const {hash} = useParams()
    const [screenText, setScreenText] = useState(screen.text)
    const [screenNotes, setScreenNotes] = useState(screen.notes)
    const screenImgUrl = `http://localhost:4000/api/videoImage/${hash}/${screen.screenShot}`

    useEffect(() => {
        setScreenText(screen.text)
    }, [screen.text])

    useEffect(() => {
        setScreenNotes(screen.notes)
    }, [screen.notes])

    const handleScreenTextChange:React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
        setScreenText(event.target.value)
    }

    const handleNotesChange:React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
        setScreenNotes(event.target.value)
    }
    const viewFullImage = () => {
        const newTab = window.open(screenImgUrl)
        newTab?.focus()
    }
    const changeStatus = (status:VideoScreen['status']) => {
        onDataChange({
            ...screen,
            status,
        }) 
    }

    const handleSave = () => {
        const updatedData = {
            ...screen,
            text: screenText,
            notes: screenNotes
        }
        onDataChange(updatedData)
    }

    return <div className="screenEdit">
        <div className="editHeader">
            <div className="row between aligncenter">
                <h3>Screen {index + 1}</h3>
                <StatusChooser onChange={changeStatus} status={screen.status} />
            </div>
        </div>
        <div className="row">
            <img title="click for fullsize" onClick={viewFullImage} className="mainImage" src={screenImgUrl} />
            <textarea className="screenText" value={screenText} onChange={handleScreenTextChange} />
        </div>
        <h4>Instructions for Designer/Notes for review</h4>
        <textarea className="notes" value={screenNotes} onChange={handleNotesChange}/>
        <div className="row reverse">
            <button className="save" onClick={handleSave}>Save Changes</button>
        </div>
    </div>
}

const getInitialState = (data:RippedVideo) => {
    return {
        ...data,
        screens: data.screens?.map(screen => {
            if(!screen.notes){
                screen.notes = ''
            }
            if(!screen.status && screen.end - screen.start <= 10){
                screen.status = 'gray'                
            }
            return screen
        })
    }
}

export const ViewRip:FC = () => {
    const {hash} = useParams()
    const [ripData, setRipData] = useState<RippedVideo>()
    const [currentScreen, setCurrentScreen] = useState(-1)

    useEffect(() => {
        if(hash){
            getVideo(hash).then(data => {
              setRipData(getInitialState(data))
            })
        }
    }, [])

    const handleChooseScreen = (screen:number) => {
        setCurrentScreen(screen)
    }

    const handleDataChange = (screenData:VideoScreen) => {
        if(ripData?.screens){
            const updatedScreens = [...ripData.screens]
            updatedScreens[currentScreen] = screenData
            const updatedData = {
                ...ripData,
                screens: updatedScreens,
            }
            setRipData(updatedData)
            if(hash){
                saveVideoData(hash, updatedData)
            }
        }
    }

    if(!ripData) {
        return <></>
    }
    return (
    <div className="ripViewer mainColumn">
        <Link to="/">&lt; Back to Projects</Link>
        <h2>Rip of {ripData?.video}</h2>
        <div className="row">
            { ripData.screens && <ScreenBrowser chooseScreen={handleChooseScreen} screens={ripData?.screens} /> }
            { 
                currentScreen >= 0 && 
                ripData.screens && 
                <ScreenViewer onDataChange={handleDataChange} index={currentScreen} screen={ripData.screens[currentScreen]} />
            }
        </div>
    </div>
    
  )
}

export {}