import { FC, FormEventHandler, ReactEventHandler, useEffect, useMemo, useRef, useState } from "react"

import { Link, useParams } from "react-router"
import { exportSlides, getVideo, saveVideoData } from "../api"
import { timecode } from "../util"
import { RippedVideo, VideoScreen } from "../types"

type ScreenEntryProps = {
    showAll:boolean
    screen:VideoScreen
    onClick: () => void
    current:boolean
}

const ScreenEntry:FC<ScreenEntryProps> = ({current, screen, showAll, onClick}) => {
    const {hash} = useParams()
    const {label, status, start, end, screenShot} = screen

    if(status === 'gray' && !showAll){
        return <></>
    }
    return <div className={`row screen ${status} ${current ? 'current' : ''}`} onClick={onClick}>
        <img className="thumbnail" src={`http://localhost:4000/api/videoImage/${hash}/${screenShot}`} />
        <div className="labels">
            <div className="label">{label} <span className="timespan">{timecode(start)}-{timecode(end)}</span></div>
        </div>
    </div>
}

type ScreenBrowserProps = {
    screens: Required<RippedVideo>['screens']
    chooseScreen: (screen:number) => void
    currentIndex: number 
    onShowAllChange: (showAll: boolean) => void
    showAll: boolean
}

const ScreenBrowser:FC<ScreenBrowserProps> = ({currentIndex, chooseScreen, screens, showAll, onShowAllChange}) => {
    const toggleAll = () => {
        onShowAllChange(!showAll)
    }
    return (
        <div className="screenBrowser">
            <label>
                <input type="checkbox" checked={showAll} onClick={toggleAll}/>
                Show all Screens
            </label>
            <div className="screenList" tabIndex={0}    >
                {screens.map((screen, index) => {
                    const entryChange = () => {
                        chooseScreen(index)
                    }
                    return <ScreenEntry current={currentIndex === index} showAll={showAll} screen={screen} onClick={entryChange} />
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
        // {status: 'red', label: 'Need Discussion'},
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
    const [previewVideo, setPreviewVideo] = useState(false)
    const [screenText, setScreenText] = useState(screen.text)
    const [screenNotes, setScreenNotes] = useState(screen.notes)
    const screenImgUrl = `http://localhost:4000/api/videoImage/${hash}/${screen.screenShot}`
    const videoRef = useRef<HTMLVideoElement>(null)
    const [productData, setProductData] = useState<VideoScreen['productRefs']>(screen.productRefs ?? {})

    useEffect(() => {
        setProductData(screen.productRefs ?? {})
    }, [screen])

    useEffect(() => {
        setPreviewVideo(false)
        videoRef.current?.pause()
    }, [screen.start])

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

    const handleProductAudio = () => {
        setProductData({
            ...productData,
            audio: !productData?.audio
        })
    }
    const handleProductVideo = () => {
        setProductData({
            ...productData,
            video: !productData?.video
        })
    }
    const handleProductRefs:React.ChangeEventHandler<HTMLInputElement> = (event) => {
        setProductData({
            ...productData,
            num: parseInt(event.target.value),
        })
    }
    const handleProductNotes:React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
        setProductData({
            ...productData,
            notes: event.target.value,
        })
    }
    const handleSave = () => {
        const updatedData = {
            ...screen,
            productRefs: productData,
            text: screenText,
            notes: screenNotes
        }
        onDataChange(updatedData)
    }

    const toggleVideo = () => {
        if(videoRef.current){
            videoRef.current.currentTime = screen.start
            if(!previewVideo){
                videoRef.current.play();
            }else{
                videoRef.current.pause();
            }
        }
        setPreviewVideo(!previewVideo)
    }

    const prevent:React.KeyboardEventHandler = (event) => {
        event.stopPropagation()
    }

    return <div className="screenEdit">
        <div className="editHeader">
            <div className="row between aligncenter">
                <h3>{screen.label}</h3>
                <StatusChooser onChange={changeStatus} status={screen.status} />
            </div>
        </div>
            <div className="mainImage">
                <img title="click for fullsize" onClick={viewFullImage} src={screenImgUrl} />
                <video controls ref={videoRef} className={previewVideo ? 'visible' : 'hidden'}><source src={`http://localhost:4000/api/media/${hash}#t=${screen.start}`} type="video/mp4" /></video>
                <button className="vidPreview" onClick={toggleVideo}>{previewVideo ? 'Hide' : 'Show'} Video</button>
            </div>
        <div className="row">
            <div className="rippedText">
                <h4>Ripped Text</h4>
                <textarea className="screenText" value={screenText} onChange={handleScreenTextChange} onKeyUp={prevent}/>
            </div>
            <div className="designerNotes">
                <h4>Instructions for Designer/Notes for review</h4>
                <textarea className="notes" value={screenNotes} onChange={handleNotesChange} onKeyUp={prevent}/>
            </div>
        </div>
        <div className="productMentions">
            <h4>Product Mentions</h4>
            <div className="row">
                <div className="col">
                    <label><input checked={productData?.audio} onChange={handleProductAudio} type="checkbox" />Audio</label>
                    <label><input checked={productData?.video} onChange={handleProductVideo} type="checkbox" />Video</label>
                    <label># Refs<input onChange={handleProductRefs} type="number" value={productData?.num} /></label>
                </div>
                <textarea className="productNotes" onChange={handleProductNotes} value={productData?.notes ?? ''} />
            </div>
        </div>
        <div className="row reverse">
            <button className="save" onClick={handleSave}>Save Changes</button>
        </div>
    </div>
}

const getMarkerData = (ripVideo: RippedVideo) => {
    const greenScreens = ripVideo.screens?.filter(screen => screen.status === 'green')
    return greenScreens?.map(screen => [
        timecode(screen.start), 
        timecode(screen.end),
        '3',
        'Comment',
        `Screen ${screen.label}`
    ].join('\t')).join('\n')
}

const setScreenLabels = (screens:VideoScreen[] = []) => {
    let counter = 0
    for(var i = 0; i<screens.length; i++){
        if(screens[i].status == 'gray'){
            screens[i].label = '--'
        }else{
            counter++;
            screens[i].label = counter < 10 ? `0${counter}` : counter.toString()
        }
    }
    return screens
}
const getInitialState = (data:RippedVideo) => {
    return {
        ...data,
        screens: setScreenLabels(
            data.screens?.map(screen => {
                if(!screen.notes){
                    screen.notes = ''
                }
                if(!screen.status && screen.end - screen.start <= 5){
                    screen.status = 'gray'                
                }
                return screen
            })
        )
    }
}

export const ViewRip:FC = () => {
    const {hash} = useParams()
    const [ripData, setRipData] = useState<RippedVideo>()
    const [currentScreen, setCurrentScreen] = useState(-1)
    const [showAllScreens, setShowAllScreens] = useState(false)
    const [markerData, setMarkerData] = useState(false)

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
                screens: setScreenLabels(updatedScreens),
            }
            setRipData(updatedData)
            if(hash){
                saveVideoData(hash, updatedData)
            }
        }
    }

    const getPrevSlide = () => {
        if(ripData?.screens){
            if(showAllScreens && currentScreen > 0){
                return currentScreen - 1
            }
            let screenCounter = currentScreen-1
            while(screenCounter >= 0){
                const {status} = ripData.screens[screenCounter]
                if(status !== 'gray'){
                    return screenCounter
                }
                screenCounter--
            }
        }
        return undefined
    }

    const getNextSlide = () => {
        if(ripData?.screens){
            if(showAllScreens && currentScreen < ripData.screens.length -1){
                return currentScreen + 1
            }
            let screenCounter = currentScreen+1
            while(screenCounter < ripData.screens.length){
                const {status} = ripData.screens[screenCounter]
                if(status !== 'gray'){
                    return screenCounter
                }
                screenCounter++
            }
        }
            
        return undefined
    }
    const setCurrentScreenStatus = (status:VideoScreen['status']) => {
       if(ripData?.screens){
            handleDataChange({
                ...ripData?.screens[currentScreen],
                status: status
            })
       }
    }
    
    const keyboardStatus = (dir: 'left' | 'right') => {
        if(ripData?.screens){
            const currentStatus = ripData.screens[currentScreen].status
            if(dir === 'left'){
                setCurrentScreenStatus(currentStatus === 'green' ? undefined : 'green')
            }else{
                setCurrentScreenStatus(currentStatus === 'gray' ? undefined : 'gray')
            }
        }
    }

    const handleKeyPress:React.KeyboardEventHandler = (event) => {
        switch(event.key){
            case 'ArrowUp':
                const prevSlide = getPrevSlide()
                if(prevSlide !== undefined){
                    setCurrentScreen(prevSlide)
                }
                break;
            case 'ArrowDown':
                const nextSlide = getNextSlide()
                if(nextSlide !== undefined){
                    setCurrentScreen(nextSlide)
                }
                break;
            case 'ArrowLeft':
                keyboardStatus('left')
                break;
            case 'ArrowRight':
                keyboardStatus('right')
                break;
        }
    }

    const exportDesign = () => exportSlides(hash, 'design')
    // const exportProblem = () => exportSlides(hash, 'problem')
    const exportTracker = () => exportSlides(hash, 'tracker')
    const showMarkers = () => {
        setMarkerData(true)
    }
    const hideMarkers = () => {
        setMarkerData(false)
    }

    if(!ripData) {
        return <></>
    }
    const copyToClipboard = () => {
         navigator.clipboard.writeText(getMarkerData(ripData) ?? '').then(_event => alert('Copied!'))
    }

    return (
    <div className="ripViewer mainColumn" tabIndex={0} onKeyUp={handleKeyPress}>
        {markerData && <div className="markerData">
            <h3>Markerbox Marker Data</h3>
            Copy and paste this data into markerbox's import via text field option.  
            <textarea readOnly value={getMarkerData(ripData)}/> 
            <div className="row between">
                <button className="active" onClick={copyToClipboard}>Copy to Clipboard</button>
                <button className="active" onClick={hideMarkers}>Close Panel</button>
            </div>
        </div>}
        <div className="row between header">
            <Link to="/">&lt; Back to Projects</Link>
            <div className="row">
                <button onClick={exportDesign}>Export Design Slides</button>
                {/* <button onClick={exportProblem}>Export Problem Slides</button> */}
                <button onClick={showMarkers}>Export Marker Data</button>
                <button onClick={exportTracker}>Export Tracker Sheet</button>
            </div>
        </div>
        <h2>Rip of {ripData?.video}</h2>
        <div className="row">
            { ripData.screens && (
                <ScreenBrowser 
                    showAll={showAllScreens}
                    onShowAllChange={(showAll) => setShowAllScreens(showAll)}
                    chooseScreen={handleChooseScreen} 
                    screens={ripData?.screens} 
                    currentIndex={currentScreen} />
            ) }
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