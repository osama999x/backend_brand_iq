const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
  {
    campaignName: {
      type: String,
      required: true,
    },
    banner: {
      type: String,
    },
    product: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    discount: {
      type: String,
      required: true,
    },
    launchDate: {
      type: Date,
      default: Date.now,
    },
    endingDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

const promotionModel = new mongoose.model("Promotion", schema);
module.exports = promotionModel;
