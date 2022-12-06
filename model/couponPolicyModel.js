const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
    },
    isProductCoupon: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
    },
    activeFrom: {
      type: Date,
      required: true,
    },
    activeTo: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isPercentage: {
      type: Boolean,
      default: true,
    },
    couponValue: {
      type: Number,
      required: true,
      default: null,
    },
  },
  { timestamps: true }
);
const couponPolicyModel = new mongoose.model("Coupon", schema);
module.exports = couponPolicyModel;
