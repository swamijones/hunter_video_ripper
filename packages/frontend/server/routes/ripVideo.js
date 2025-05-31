const path = require('path')
const {DATA_STORE} = require('../constants')
const fs = require('fs')

const { findSlides, parseText, ripToScreens } = require('@hunterlearning/video-ripper')
const { jsonData } = require('../util')

class RipJob {
    constructor(hash){
        this.progress = {
            rip: 0,
            slides: 0,
            text: 0,
        }
        this.hash = hash
        this.workingDirectory = path.resolve(DATA_STORE, hash)
        this.dataPath = path.resolve(this.workingDirectory, 'data.json')
        this.data = jsonData(this.dataPath)
        this.startRip()
    }

    getProgress = () => this.progress

    startRip = () => {
        console.log('staring rip for', this.data.video)
        this.ripToScreens()
        // this.findSlides()
        // this.parseText()
    }
    ripToScreens = () => {
        console.log('ripping screens')
        const progressUpdate = (percent) => {
            this.progress.rip = percent
            console.log(this.progress)
        }

        const ripComplete = () => {
            this.progress.rip = 1
            this.findSlides()
        }

        ripToScreens({
            onComplete: ripComplete,
            onProgress: progressUpdate,
            videoPath: `${this.workingDirectory}/${this.data.video}`, 
            workingPath: this.workingDirectory,
        })
    }
    findSlides = () => {
        console.log('finding slides')
        const slidesComplete = () => {
            this.progress.slides = 1
            this.parseText()
        }
        const progressUpdate = (percent) => {
            this.progress.slides = percent
            console.log(this.progress)
        }

        findSlides({
            onComplete: slidesComplete,
            onProgress: progressUpdate,
            workingDirectory: this.workingDirectory,
        })
    }
    parseText = () => {
        console.log('parsing text')
        const slidesComplete = () => {
            this.progress.text = 1
            this.jobComplete()
        }
        const progressUpdate = (percent) => {
            this.progress.text = percent
            console.log(this.progress)
        }

        parseText({
            onComplete: slidesComplete,
            onProgress: progressUpdate,
            workingDirectory: this.workingDirectory,
        })
    }
    jobComplete = () => {
        console.log('job complete')
        const data = jsonData(this.dataPath)

        fs.writeFileSync(this.dataPath, JSON.stringify({
            ...data,
            ripStatus: 'complete',
        }, null, 2))
    }

}

const activeRunners = {}

const ripProgress = (req, res) => {
    const { hash } = req.params

    if(activeRunners[hash]){
        return res.json(activeRunners[hash].getProgress())
    }

    const { ripStatus } = jsonData(path.resolve(DATA_STORE, hash, 'data.json'))

    res.json(ripStatus === 'complete'
        ? {
            rip: 1,
            slides: 1,
            text: 1,
        }: {
            rip: 0,
            slides: 0,
            text: 0,
        }
    )
}

const ripVideo = (req, res) => {
    const {hash} = req.params
    const {ripStatus} = jsonData(path.resolve(DATA_STORE, hash, 'data.json'))

    if(ripStatus === 'complete'){
        return res.json({
            state: 'complete',
            progress: {
                rip: 1,
                slides: 1,
                text: 1,
            }
        })
    }

    if(activeRunners[hash]){
        return res.json({
            state: 'inprogress',
            progress: activeRunners[hash].getProgress()
        })
    }

    activeRunners[hash] = new RipJob(hash)

    res.json({
        state: 'started',
        hash,
    })
}

module.exports = {
    ripProgress,
    ripVideo,
}