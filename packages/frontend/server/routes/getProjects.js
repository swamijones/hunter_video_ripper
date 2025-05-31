const fs = require('fs')
const path = require('path')

const { DATA_STORE } = require('../constants')
const { jsonData } = require('../util')

const getProjects = (req, res) => {
    const dataStore = fs.readdirSync(DATA_STORE)
    const data = dataStore.reduce((result, hash) => {
        const vidData = jsonData(path.resolve(DATA_STORE, hash, 'data.json'))
        result[hash] = {
            screens: vidData.screens,
            video: vidData.video
        }
        return result
    }, {})
    res.status(200).json(data)
}

module.exports = getProjects