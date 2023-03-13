const { truncate } = require("fs/promises");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    promotionId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const promotionProductModel = new mongoose.model("PromotionProduct", schema);
module.exports = promotionProductModel;
