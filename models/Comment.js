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
    collection: "comment",
    timestamps: true,
  }
);

/*exporting module for the global usage */
module.exports = mongoose.model("comment", CommentSchema);