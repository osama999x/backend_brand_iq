const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const schema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: { type: Number, required: true },
        sku: { type: String, required: true, unique: true },
        size: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const addToCartModel = new mongoose.model("AddToCart", schema);
module.exports = addToCartModel;
