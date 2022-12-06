const { truncate } = require("fs/promises");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
  {
    campaignName: {
      type: String,
      required: true,
      unique: true,
    },
    banner: {
      type: String,
    },
    promotion: [
      {
        product: [
          {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            unique: true,
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
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        launchDate: {
          type: Date,
          required: true,
        },
        endingDate: {
          type: Date,
          required: true,
        },
        status: {
          type: String,
          required: true,
          default: "pending",
        },
      },
    ],
    // customer: {
    //   type: Schema.Types.ObjectId,
    //   default: "",
    // },
    // product: [String],
  },
  { timestamps: true }
);

const mPromotionModel = new mongoose.model("MPromotion", schema);
module.exports = mPromotionModel;
