// Function for cenrtalized error handler
const errorHandler = function (err, req, res, next) {
  // Wrong Mongoose Object ID Error
  if (err.name === "CastError") {
    const message = `Invalid input: ${err.path} : ${err.value}`;
    err = new Error(message);
    return res.status(400).json({ success: false, message: err.message });
  }

  // Handling Mongoose Validation Error
  else if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((value) => value.message);
    err = new Error(message);
    return res.status(400).json({ success: false, message: err.message });
  }

  // Handling Mongoose duplicate key errors
  else if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new Error(message);
    return res.status(400).json({ success: false, message: err.message });
  }

  //All other common error
  else {
    // console.log(err)
    return res.status(500).json({ success: false, message: err.message });
  }
};

/*exporting module for the global usage */
module.exports = { errorHandler };
