const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
  {
    couponCode: {
      type: String,
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    isBuy: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const coupanStatusModel = new mongoose.model("couponStatus", schema);
module.exports = coupanStatusModel;
