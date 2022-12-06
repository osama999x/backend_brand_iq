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
    metaData: [String],
    metaDescription: [String],
  },
  { timestamps: true }
);

const productMetaModel = new mongoose.model("ProductMeta", schema);
module.exports = productMetaModel;
