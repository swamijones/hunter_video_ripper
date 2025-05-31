const fs = require('fs')
const path = require('path')
const { DATA_STORE } = require('../constants')

const deleteVideo = (req, res) => {
    const deletePath = path.resolve(DATA_STORE, req.body.hash)
    
    fs.rmSync(deletePath, {recursive: true})
    res.status(200).json({
        deleted: req.body.hash
    })
}

module.exports = deleteVideo