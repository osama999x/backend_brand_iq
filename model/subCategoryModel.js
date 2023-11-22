const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const schema = new Schema(
  {
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    icon: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
      default: "",
    },
    description: {
      type: String,
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const subcategoryModel = new mongoose.model("SubCategory", schema);
module.exports = subcategoryModel;
