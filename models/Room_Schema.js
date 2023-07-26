const mongoose = require("mongoose");

//DB Schema model
const roomSchema = new mongoose.Schema(
  {
    companyName: { type: String },
    site: { type: String },
    department: { type: String },
    annexureNo: { type: String },
    annexureTitle: { type: String },
    versionNo: { type: String },
    module: { type: String },
    id: { type: String },
    type: { type: String },//type1 type2
    name: { type: String },
    status: { type: String },
    reviewBy: { type: String },
    reviewDate: { type: Date },
    approveBy: { type: String },
    approveDate: { type: Date },
    activity_type: { type: String },
    batch_number: { type: String },
    product_code: { type: String },
    product_name: { type: String },
    lot_number: { type: String },
    cleaning_type:{ type: String },
    stage: { type: String },
    remarks: { type: String },
    created_by: { type: String },
    modified_by: { type: String },
  },
  {
    collection: "room",
    timestamps: true,
  }
);

/*exporting module for the global usage */
module.exports = mongoose.model("room", roomSchema);
  // module.exports = { subscribersSchema, subscriberContactsSchema };