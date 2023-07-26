const mongoose = require("mongoose");

//DB Schema model
const roomTransSchema = new mongoose.Schema(
  {
    companyName: { type: String },
    site: { type: String },
    department: { type: String },
    annexureNo: { type: String },
    annexureTitle: { type: String },
    versionNo: { type: String },
    module: { type: String },
    id: { type: String },
    type: { type: String },
    activity_type: { type: String },
    name: { type: String },
    status: { type: String },
    reviewBy: { type: String },
    reviewDate: { type: Date },
    approveBy: { type: String },
    approveDate: { type: Date },
    batch_number: { type: String },
    product_code: { type: String },
    product_name: { type: String },
    lot_number: { type: String },
    cleaning_type:{ type: String },
    stage: { type: String },
    signature: { type: String },
    remarks: { type: String },
    created_by: { type: String },
    modified_by: { type: String },
    activities: [],
  },
  {
    collection: "roomTrans",
    timestamps: true,
  }
);

/*exporting module for the global usage */
module.exports = mongoose.model("roomTrans", roomTransSchema);
  // module.exports = { subscribersSchema, subscriberContactsSchema };