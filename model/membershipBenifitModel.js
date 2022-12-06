const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
  {
    membershipCategory: {
      type: Schema.Types.ObjectId,
      ref: "Membership",
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    expireDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const membershipBenifitModel = new mongoose.model("MembershipBenifit", schema);
module.exports = membershipBenifitModel;
