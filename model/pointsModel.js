const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
  {
    membershipCategory: {
      type: mongoose.Types.ObjectId,
      ref: "Membership",
      unique: true,
    },
    returnValue: {
      type: Number,
      required: true,
    },
    createdOn: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: true }
);

const pointsModel = new mongoose.model("Points", schema);
module.exports = pointsModel;
