const mongoose = require("mongoose");

//DB Schema model
const logSchema = new mongoose.Schema(
  {
    module: { type: String },
    log: { type: String },
    activity: { type: [String] },
    annexureNo: { type: String },
    annexureTitle: { type: String },
    versionNo: { type: String },
    companyName: { type: String },
    department: { type: String },
    site: { type: String },
    created_by: { type: String },
    modified_by: { type: String },
  },
  {
    collection: "log",
    timestamps: true,
  }
);

/*exporting module for the global usage */
module.exports = mongoose.model("log", logSchema);
  // module.exports = { subscribersSchema, subscriberContactsSchema };