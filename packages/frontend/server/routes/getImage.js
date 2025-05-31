const fs = require('fs')
const path = require('path')
const { DATA_STORE } = require('../constants')

const getImage = (req, res) => {
    const {hash, image} = req.params

    const imgPath = path.resolve(DATA_STORE, hash, image)

    if(!fs.existsSync(imgPath)){
        return res.status(404).send()
    }
    const imgData = fs.readFileSync(imgPath)
    res.set({'Content-Type': 'image/png'})

    res.end(imgData, 'binary')
}

module.exports = getImage