import React, {FC, useEffect, useState} from 'react'
import { Link } from 'react-router'
import {deleteVideo, getProjects} from '../api'
import {RippedVideo} from '../types'

export const VideoEntry:FC<RippedVideo & { onChange: any }> = ({
    onChange,
    hash,
    video,
    screens
}) => {
    const confirmDelete = async () => {
        const confirmed = confirm('Are you sure dawg? No Undoing this')
        if(confirmed){
            await deleteVideo(hash)
            onChange()
        }
    }

    const screenCount = screens ? screens.length ?? 0 : 0

    const linkTo = screenCount > 0 ? `view-rip/${hash}` : `rip/${hash}`

    return <div className="videoEntry">
        <div className="name"><Link to={linkTo}>{video}</Link> ({screenCount} Screens)</div>
        <div className="delete" onClick={confirmDelete}>X</div>
    </div>
}

export const Home:FC = () => {
    const [data, setData] = useState<RippedVideo[]>([])
    
    const refreshData = () => getProjects().then((res) => {
            let data:RippedVideo[] = []
            for(var hash in res){
                console.log(res[hash])
                data.push({
                    ...res[hash],
                    hash
                })
            }
            setData(data)
        })

    useEffect(() => {
        refreshData()
    }, [])

    return <div className="home mainColumn">
        <h2>Projects</h2>
        {
          data.map(vid => { console.log(vid); return <VideoEntry {...vid} onChange={refreshData}/>})           
        }
        <Link to="import-rip"><button>Import New Project</button></Link>
    </div>
}