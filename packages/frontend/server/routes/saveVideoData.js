const fs = require('fs')
const path = require('path')
const { DATA_STORE } = require("../constants")

const saveVideoData = (req, res) => {
    const {hash, data} = req.body
    const dataPath = path.resolve(DATA_STORE, hash, 'data.json')

    if(!fs.existsSync(dataPath)){
        return res.status(404).send()
    }

    fs.writeFileSync(dataPath, data)
    
    res.json({
        [hash]: 'saved'
    })
}

module.exports = saveVideoData