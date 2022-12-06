const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    points: {
      type: Number,
      required: true,
      min: 0,
    },
    orderId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const pointModel = new mongoose.model("MyPoint", schema);
module.exports = pointModel;
