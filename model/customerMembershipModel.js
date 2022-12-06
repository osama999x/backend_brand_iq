const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    membershipId: {
      type: Schema.Types.ObjectId,
      ref: "Membership",
      required: true,
    },
    membershipCategory: {
      type: String,
      required: true,
    },
    customerPoints: {
      type: Number,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const customerMembership = new mongoose.model("customerMembership", schema);
module.exports = customerMembership;
