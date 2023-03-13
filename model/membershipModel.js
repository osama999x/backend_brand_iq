const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
  {
    membershipCategory: {
      type: String,
      enum: ["Silver", "Gold", "Platinum", "Diamond"],
      required: true,
      unique: true,
    },
    thresholdFrom: {
      type: Number,
      required: true,
    },
    thresholdTo: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const membershipModel = new mongoose.model("Membership", schema);
module.exports = membershipModel;
