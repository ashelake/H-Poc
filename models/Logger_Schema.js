const mongoose = require("mongoose");

//DB Schema model
const loggerSchema = new mongoose.Schema(
  {
    module_name: { type: String },
    event_name: { type: String },
    executed_date: { type: String },
    executed_by: { type: String },
    remarks: { type: String },
    event_data: { type: Object }
  },
  {
    collection: "logger",
    timestamps: true,
  }
);

/*exporting module for the global usage */
module.exports = mongoose.model("logger", loggerSchema);
  // module.exports = { subscribersSchema, subscriberContactsSchema };