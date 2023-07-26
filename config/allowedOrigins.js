//Allowed URL list to access the (App or Website) that prevent from CORS policy block
const allowedOrigins = [
  "https://app.zongovita.com", //Web UI URL (frondend)
  "https://dev.zongovita.com", //API URL (backend)
  "http://18.60.249.165:49092",
  "http://13.233.102.135:8010",
  "https://d1zcs2a52o3nke.cloudfront.net",
  "http://zongotestweb.s3-website.ap-south-1.amazonaws.com",
  "https://zvrepo.s3.ap-south-1.amazonaws.com",
  "http://18.60.249.165:4000",
  //local development URL's
  "http://localhost:3500",
  "http://localhost:3000",
  "http://localhost:8081",
  "http://localhost:9000",
];

/*exporting module for the global usage */
module.exports = allowedOrigins;
