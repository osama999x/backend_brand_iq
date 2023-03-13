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
    dealDescription: {
      type: String,
      default: "",
    },
    image: {
      type: String,
    },
    isPercentage: {
      type: Boolean,
    },
    discount: {
      type: Number,
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

const dealModel = new mongoose.model("Deal", schema);
module.exports = dealModel;
