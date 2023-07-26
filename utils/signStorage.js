const { pngFilter } = require("./fileFilter")
const { awsStorage } = require("./awsStorage")
const multer = require("multer");


//AWS cloud folder for upload
// Asset image upload folder
exports.signFolder = multer({
    awsStorage,
    pngFilter,
    limits: { fileSize: 15000000, files: 1 },
  }); // max filesize in bytes &  number of file limit is 1
