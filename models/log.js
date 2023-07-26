const mongoose = require("mongoose");

//DB Schema model
const NewLogSchema = new mongoose.Schema(
    {
        version: { type: Number },
        doc_name: { type: String },
        doc_id: { type: String },
        event: { type: String },
        prev_status: { type: String },
        curr_status: { type: String },
        created_by: { type: String },
        reviewed_by: { type: String },
        created_date: { type: Date },
        modified_date: { type: Date },
    },
    {
        collection: "logs",
        timestamps: true,
    }
);

/*exporting module for the global usage */
module.exports = mongoose.model("logs", NewLogSchema);