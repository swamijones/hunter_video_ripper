const { DATA_STORE } = require("../constants")
const { jsonData } = require("../util")
const path = require('path')
const fs = require('fs')
const archiver = require('archiver')
const xl = require('excel4node')

const buildSpreadSheet = (slides, sourceFolder, outputFile) => {    
    return new Promise((resolve) =>  {
        const wb = new xl.Workbook()
        const ws = wb.addWorksheet('Sheet 1')

        const wrap = wb.createStyle({
            alignment: {
                wrapText: true
            }
        })
        ws.cell(1,1).string('Image')
        ws.cell(1,2).string('Screen')
        ws.cell(1,3).string('Notes')
        ws.cell(1,4).string('Extracted Text')

        for(var i = 0; i<slides.length; i++){
            const {screenShot, label, index, notes, text} = slides[i]
            const row = i+2
            ws.row(row).setHeight(200)
            ws.cell(row,2).string(label ?? `Screen ${index+1}`)
            ws.cell(row,3).string(notes).style(wrap)
            ws.cell(row,4).string(text).style(wrap)

            ws.addImage({
                path: path.resolve(sourceFolder, screenShot),
                type: 'picture',
                position: {
                    type: 'twoCellAnchor',
                    from: {
                        col: 1, colOff:0, row, rowOff: 0
                    },
                    to: {
                        col: 2, colOff:0, row: row + 1, rowOff: 0
                    }
                }
            })
        }

        ws.column(1).setWidth(70)
        ws.column(2).setWidth(10)
        ws.column(3).setWidth(40)
        ws.column(4).setWidth(40)

        wb.write(outputFile, (args) => {
            resolve(outputFile)
        })
    })
}

const zipFolder = (archiveFolder, zipFile) => {
    return new Promise((resolve) => {
        const output = fs.createWriteStream(zipFile);
        output.on("close", function () {
            resolve(zipFile)
        });
        const archive = archiver('zip', {
            zlib: { level: 9 }
        })
        archive.pipe(output)
        archive.on('error', err => { throw err })

        archive.directory(archiveFolder, false)
        archive.finalize()
    })
}

const filterScreens = (screens, status) => screens.filter(screen => screen.status === status)

const tagScreenIndexes = (screens) => screens.map((screen, index) => ({
    ...screen,
    index,
}))

const buildDesignExport = async (projectData, dataStore) => {
    const designSlides = filterScreens(tagScreenIndexes(projectData.screens), 'green')

    const exportFolder = path.resolve(dataStore, 'exports', 'design')
    if(fs.existsSync(exportFolder)){
        fs.rmSync(exportFolder, { recursive: true })
    }
    fs.mkdirSync(exportFolder)

    const fileName = path.basename(projectData.video).replace(/\.mp4/, '.xlsx')
    const outputFile = path.resolve(exportFolder, fileName)
    
    await buildSpreadSheet(designSlides, dataStore, outputFile)

    for(var i = 0; i< designSlides.length; i++){
        const { index, screenShot, label }= designSlides[i];
        const fileID = label ?? `Screen_${index+1}`
        // fs.writeFileSync(path.resolve(exportFolder, `${fileID}.txt`), [
        //     '===========DESIGN NOTES============',
        //     notes,
        //     '===========EXTRACTED TEXT==========',
        //     text,
        // ].join('\n\n'))
        fs.copyFileSync(`${dataStore}/${screenShot}`, `${exportFolder}/${fileID}.png`)
    }

    const archive = await zipFolder(exportFolder, path.resolve(dataStore, 'exports', 'design.zip') )
    return {
        contentType: 'zip',
        data: archive,
    }
}

const buildProblemExport = async (projectData, dataStore) => {
    const problemSlides = filterScreens(tagScreenIndexes(projectData.screens), 'red')
    
    const exportFolder = path.resolve(dataStore, 'exports')
    if(fs.existsSync(exportFolder)){
        fs.rmSync(exportFolder, { recursive: true })
    }
    fs.mkdirSync(exportFolder)
    
    const fileName = path.basename(projectData.video).replace(/\.mp4/, '.xlsx')
    const outputFile = path.resolve(dataStore, 'exports', fileName)

    await buildSpreadSheet(problemSlides, dataStore, outputFile)
    return {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
        data: outputFile
    }    
}

const getExport = async (req, res) => {
    const {hash, type} = req.params

    const dataStore = path.resolve(DATA_STORE, hash)
    const projectData = jsonData(path.resolve(dataStore, 'data.json'))
    const {contentType, data} = type === 'design'
        ? await buildDesignExport(projectData, dataStore)
        : await buildProblemExport(projectData, dataStore)

    const binaryData = fs.readFileSync(data)
    res.contentType(contentType)
        .setHeader('Content-Disposition', `attachment; filename=${path.basename(data)}`)
        .end(binaryData, 'binary')
}

module.exports = getExport