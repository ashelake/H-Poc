/* importing local dependencies */
const allowedOrigins = require("./allowedOrigins");

// Verify allowed origins from the allowed origin URL list
const corsOptions = {
  origin: (origin, callback) => {
    allowedOrigins.indexOf(origin) !== -1 || !origin
      ? callback(null, true)
      : callback(new Error("Not allowed by CORS policy"));
  },
  optionsSuccessStatus: 200,
};

/*exporting module for the global usage */
module.exports = corsOptions;
