const fs = require('fs')
const path = require('path')
const { DATA_STORE } = require('../constants')
const { jsonData } = require('../util')

const getVideo = (req, res) => {
    const dataPath = path.resolve(DATA_STORE, req.params.hash, 'data.json')
    if(!fs.existsSync(dataPath)){
        res.status(400).send()
    }
    const videoData = jsonData(dataPath)
    res.json(videoData)
}

module.exports = getVideo