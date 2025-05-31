const { v4 } = require('uuid')
const path = require('path')
const fs = require('fs');
const { DATA_STORE } = require('../constants');

const fileUpload = (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const hashID = v4()
    const uploadPath = path.resolve(DATA_STORE, hashID)
    
    fs.mkdirSync(uploadPath)
    fs.writeFileSync(`${uploadPath}/data.json`, JSON.stringify({
        video: req.files.uploadForRip.name
    }, null, 2))

    req.files.uploadForRip.mv(`${uploadPath}/${req.files.uploadForRip.name}`, function(err) {
    if (err)
      return res.status(500).send(err);

    res.status(201).json({ uploadID: hashID });
  });
}

module.exports = fileUpload