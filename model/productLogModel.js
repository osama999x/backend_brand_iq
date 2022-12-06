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

    description: {
      type: String,
      required: true,
    },
    variant: [
      {
        colorName: { type: String, default: "" },
        colorHex: { type: String, default: "" },
        price: { type: Number },
        quantity: { type: Number },
      },
    ],
    time: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

const productLogModel = new mongoose.model("ProductLog", schema);
module.exports = productLogModel;
