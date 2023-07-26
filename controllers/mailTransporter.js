/* importing package dependencies */
const nodemailer = require("nodemailer");

//Creating an email configuration with credentials (nodemailer)
let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "app@zongovita.com",
    pass: "oiwultvfhwzovbdu",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/*exporting module for the global usage */
module.exports = { mailTransporter };
