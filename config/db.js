/* importing package dependencies */
const mongoose = require("mongoose");
mongoose.set('strictQuery', true)
// Function for connecting to Mongo DB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_MASTER_URI);
    console.log(`MongoDB MASTER Connected: ${conn.connection.host}`);
  } catch (err) {
    console.log("MASTER err",err);
    process.exit(1);
  }
};

/*exporting module for the global usage */
module.exports = connectDB;
