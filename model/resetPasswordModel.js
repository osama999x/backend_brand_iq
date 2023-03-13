const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    email: {
      type: String,
    },
    otp: {
      type: Number,
    },
    expireOtp: {
      type: Date,
      //default: Date.now() + 300000,
    },
  },
  { timestamps: true }
);

const resetPasswordModel = new mongoose.model("ResetPassword", schema);
module.exports = resetPasswordModel;
