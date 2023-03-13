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
    product: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Product",
        unique: true,
      },
    ],
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
      unique: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    expireDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "pending",
    },
  },
  { timestamps: true }
);

const promotionModel = new mongoose.model("Promotion", schema);
module.exports = promotionModel;
