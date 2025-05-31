import { RippedVideo } from "./types";

const apiURL = 'http://localhost:4000/api/'

const getRequest = async(url:string) => {
  try {
    const response = await fetch(apiURL + url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    return response
  } catch (error) {
    throw(error)
  }
}

const postRequest = async(url: string, formData:FormData) => {
  try{
    const response = await fetch(apiURL + url, {
        method: 'POST',
        body: formData,
    })

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    return response
  } catch (error) {
    throw(error)
  }
}

export const getProjects = async () => {    
    const response = await getRequest('projects')
    return await response.json();
}

export const getVideo = async (hash:string) => {    
    const response = await getRequest(`video/${hash}`)
    return await response.json();
}

export const uploadForRip = async (formData:FormData) => {
   const response = await postRequest("uploadFile", formData);
   return await response.json()
}

export const deleteVideo = async (hash:string) => {
  const formBody = new FormData()
  formBody.append('hash', hash)
  const response = await postRequest('deleteVideo', formBody)
  return await response.json()
}

export const ripVideo = async (hash: string) => {
  const response = await getRequest(`ripVideo/${hash}`)
  return await response.json()
}

export const getRipProgress = async (hash:string) => {
  const response = await getRequest(`ripProgress/${hash}`)
  return await response.json()
}

export const saveVideoData = async (hash:string, data?: RippedVideo) => {
  if(data){
    const formBody = new FormData()
    formBody.append('hash', hash)
    formBody.append('data', JSON.stringify(data, null, 2))
    
    const response =  await postRequest('saveVideoData', formBody)
    return await response.json()
  }
}