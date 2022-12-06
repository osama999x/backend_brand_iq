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
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

const favouriteModel = new mongoose.model("Favourite", schema);
module.exports = favouriteModel;
