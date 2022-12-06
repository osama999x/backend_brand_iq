const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    dealTitle: {
      type: String,
      required: true,
    },
    dealType: {
      type: String,
      required: true,
      enum: ["today", "other"],
    },
    image: {
      type: String,
    },
    buyDeal: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          unique: true,
        },
        sku: {
          type: String,
          unique: true,
        },
      },
    ],
    free: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          unique: true,
        },
        sku: {
          type: String,
          unique: true,
        },
      },
    ],
    isPercentage: {
      type: Boolean,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    dealFrom: {
      type: Date,
    },
    dealTo: {
      type: Date,
    },
  },
  { timestamps: true }
);

const dealsProductModel = new mongoose.model("DealProduct", schema);
module.exports = dealsProductModel;
