const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
  {
    orderStatusName: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "Pending",
        "Confirmed",
        "Canceled",
        "Rejected",
        "Delivered",
        "Returned",
      ],
    },
  },
  { timestamps: true }
);

const orderStatusModel = new mongoose.model("OrderStatus", schema);
module.exports = orderStatusModel;
