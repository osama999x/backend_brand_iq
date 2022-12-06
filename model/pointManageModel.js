const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    initialPoint: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    pointOrderPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    pointPerOrder: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
  },
  { timestamps: true }
);

const pointManageModel = new mongoose.model("PointManagement", schema);
module.exports = pointManageModel;
