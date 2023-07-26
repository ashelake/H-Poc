/* importing package dependencies */
const mongoose = require("mongoose");

// Function for validate the email address
var validateEmail = function (email) {
  var result = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return result.test(email);
};

//DB Schema model for User related operations
const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      // required: [true, "'First Name' is mandatory"],
      // maxlength: [25, "25 character's Maximum allowed"],
    },
    middle_name: {
      type: String,
      // maxlength: [25, "25 character's Maximum allowed"],
    },
    last_name: {
      type: String,
      // required: [true, "'Last Name' is mandatory"],
      // maxlength: [25, "25 character's Maximum allowed"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      // immutable: true,
      // unique: [true, "Entered 'Email ID' is already exists"],
      // required: [true, "'Email ID' is mandatory"],
      // validate: [validateEmail, "Please fill a valid Email ID"],
      // match: [
      //   /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      //   "Please fill a valid Email ID",
      // ],
    },
    country_code: { type: String, enum: ["+91", "+1"] },
    mobile_number: {
      type: Number,
      // immutable: true,
      // validate: {
      //   validator: function (v) {
      //     return /\d{3}\d{3}\d{4}/.test(v);
      //   },
      //   message: (props) => `${props.value} is not a valid mobile number!`,
      // },
      // required: [true, "'Mobile Number' is mandatory"],
    },
    department: {
      type: Array,
    //   maxlength: [25, "25 character's Maximum allowed"],
    //   required: [true, "'Department' is mandatory"],
    },
    designation: {
      type: String,
      // maxlength: [25, "25 character's Maximum allowed"],
      // required: [true, "'designation' is mandatory"],
    },
    pass: {
      type: String,
      // required: [true, "'Password' is mandatory"],
      // minlength: 8,
    },
    role: {
      type: Array,
      // required: [true, "'Role' is mandatory"],
    },
    refresh_token: { type: String },
    fcm_token: { type: String },
    // user_status: { type: Boolean, default: true },
    profile_pic: { type: String },
    subscriber_id: { type: String },
    db_name: { type: String },
    sites: { type: Array },
    is_active:{type: Boolean, default: true},
    created_by: { type: String },
    modified_by: { type: String },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

/*exporting module for the global usage */
module.exports = mongoose.model("users", userSchema);
