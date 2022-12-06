const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
  {
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
    product: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
    originalPrice: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: true,
    },
    fromDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    toDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: true }
);

const discountModel = new mongoose.model("Discount", schema);
module.exports = discountModel;
