const fs = require('fs')

const jsonData = (path) => {
    const data = fs.readFileSync(path).toString()
    return JSON.parse(data)
}
module.exports = {
    jsonData 
}