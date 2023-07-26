const mongoose = require("mongoose");

//DB Schema model
const equipmentSchema = new mongoose.Schema(
  {
    id: { type: String },
    type: { type: String },
    name: { type: String },
    status: { type: String },
    type_b_dt: { type: Date },
    dht_type_b: { type: String },
    type_a_dt: { type: Date },
    dht_type_a: { type: String },
    performed_count: { type: String },
    status: { type: String },
    created_by: { type: String },
    modified_by: { type: String },
  },
  {
    collection: "equipment",
    timestamps: true,
  }
);

/*exporting module for the global usage */
module.exports = mongoose.model("equipment", equipmentSchema);
  // module.exports = { subscribersSchema, subscriberContactsSchema };