import React, {FC, useRef, useState} from 'react'
import { uploadForRip } from '../api'
import { useNavigate } from  'react-router'

export const ImportRip:FC = () => {
    const [isUploading, setUploading] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)
    const navigate = useNavigate()

    const handleSubmit = async (event:any) => {
        event.preventDefault()
        if(formRef.current === null){
            return
        }
 
        const {uploadID} = await uploadForRip(new FormData(formRef.current))
        navigate(`/rip/${uploadID}`)
        return false
    }

    return <div className="mainColumn importRip">
        { !isUploading 
        ? <>
        <h2>Rip new Video</h2>
        <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">
            <input name="uploadForRip" type="file" />
            <input type="submit" value="Import" />
        </form>
        </>
        : <>ripping</>}
    </div>
}