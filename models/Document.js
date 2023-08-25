const mongoose = require("mongoose");

//DB Schema model
const CommentSchema = new mongoose.Schema(
  {
    comment: { type: String },
    userName: { type: String },
    date: { type: Date },
    created_by: { type: String },
  },
  {
    collection: "document",//"comment",
    timestamps: true,
  }
);

/*exporting module for the global usage */
const docVersionSchema = new mongoose.Schema(
  {
    draft: { type: Number },
    final: { type: Number },
  },
  {
    collection: "document",//"docVersion",
    timestamps: true,
  }
);
//DB Schema model
const DocumentSchema = new mongoose.Schema(
  {
    name: { type: String },
    file: { type: String }, //path
    doc_number: { type: String },
    version: { type: String },
    status: { type: String },
    department: { type: String },
    comments: [CommentSchema],
    category: { type: String },
    created_by: { type: String },
    modified_by: { type: String },
    created_date: { type: Date },
    modified_date: { type: Date },
    reviewer: { type: String },
    approver: { type: String },
    reviewer_date: { type: Date },
    approver_date: { type: Date },
  },
  {
    collection: "document",
    timestamps: true,
  }
);

/*exporting module for the global usage */
module.exports = mongoose.model("document", DocumentSchema);