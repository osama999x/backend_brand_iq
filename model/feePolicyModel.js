const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
  {
    membershipCategory: {
      type: mongoose.Types.ObjectId,
      ref: "Membership",
    },
    feeSlab: {
      type: mongoose.Types.ObjectId,
      ref: "feeSlab",
    },
    isPercentage: {
      type: Boolean,
      required: true,
    },
    charges: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const feePolicyModel = new mongoose.model("feePolicy", schema);
module.exports = feePolicyModel;
