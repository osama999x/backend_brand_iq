const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
  {
    membershipCategory: {
      type: mongoose.Types.ObjectId,
      ref: "Membership",
    },
    feeSlabFrom: {
      type: Number,
      required: true,
    },
    feeSlabTo: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const feeSlabModel = new mongoose.model("feeSlab", schema);
module.exports = feeSlabModel;
