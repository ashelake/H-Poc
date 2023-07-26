const multer = require("multer");

//To create AWS bucket storage
exports.awsStorage = multer.memoryStorage();