const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    customer: {
      type: String,
      ref: "Customer",
      required: true,
    },
    time: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const WebSignupLogModel = new mongoose.model("WebSignupLog", schema);
module.exports = WebSignupLogModel;
