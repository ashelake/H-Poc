/* importing local dependencies */
const allowedOrigins = require("../config/allowedOrigins");

// Function for validate the headers in the allowed origins
const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", true);
  }
  next();
};

/*exporting module for the global usage */
module.exports = credentials;
