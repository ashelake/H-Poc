const multer = require("multer");

//To allow only jpeg
exports.jpegFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg | image/jpg") {
    cb(null, true);
  }
};


//To allow only png
exports.pngFilter = (req, file, cb) => {
  if (file.mimetype === "png") {
    cb(null, true);
  } else {
    cb(null, false)
  }
};

//To allow multiple image file type
exports.imageFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[0] === "image") {
      cb(null, true);
    } else {
      cb(new Error("Incorect file type"), false)
      // cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }
  };

  //To allow only pdf
exports.pdfFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[0] === "application/pdf") {
      cb(null, true);
    } else {
      // cb(new Error("Incorect file type"), false)
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }
  };
