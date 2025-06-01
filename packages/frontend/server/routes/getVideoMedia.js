const fs = require('fs')
const path = require('path')
const { DATA_STORE } = require('../constants')
const { jsonData } = require('../util')

const getVideo = (req, res) => {
    const exportPath = path.resolve(DATA_STORE, req.params.hash)
    const dataPath = path.resolve(exportPath, 'data.json')

    if(!fs.existsSync(dataPath)){
        res.status(400).send()
    }
    const {video} = jsonData(dataPath)
    const videoData = fs.readFileSync(path.resolve(exportPath, video))
    res.contentType('video/mp4').end(videoData, 'binary')
}

module.exports = getVideo