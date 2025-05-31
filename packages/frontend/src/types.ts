export type VideoScreen = {
  start: number
  end: number
  screenShot: string
  text:string
  status?: 'green' | 'red' | 'gray'
  notes?: string
}

export type RippedVideo = {
    hash: string
    video: string
    screens?: VideoScreen[]
}