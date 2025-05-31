process.env.DEBUG = 'express:*'

const express = require('express')
const fileupload = require('express-fileupload')
const cors = require('cors')
const parser = require('body-parser')

const uploadFile = require('./routes/uploadFile')
const getProjects = require('./routes/getProjects')
const getVideo = require('./routes/getVideo')
const deleteVideo = require('./routes/deleteVideo')
const {ripVideo, ripProgress} = require('./routes/ripVideo')
const getImage = require('./routes/getImage')
const saveVideoData = require('./routes/saveVideoData')
const getExport = require('./routes/getExport')

const app = express()
const port = 4000

app.use(cors())
app.use(fileupload())
app.use(parser.urlencoded())

app.use(express.static('./build'))

app.get('/api/projects', getProjects)
app.get('/api/video/:hash', getVideo)
app.post('/api/uploadFile', uploadFile)
app.post('/api/deleteVideo', deleteVideo)
app.get('/api/ripVideo/:hash', ripVideo)
app.get('/api/ripProgress/:hash', ripProgress)
app.get('/api/videoImage/:hash/:image', getImage)
app.post('/api/saveVideoData', saveVideoData)
app.get('/api/export/:hash/:type', getExport)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
