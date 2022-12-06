const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    actualPrice: {
      type: Number,
      required: true,
      min: 1,
    },
    discountedPrice: {
      type: Number,
      required: true,
      min: 1,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

const ProductQuantityLogModel = new mongoose.model(
  "ProductQuantityLog",
  schema
);
module.exports = ProductQuantityLogModel;
