const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
  {
    orderStatus: {
      type: String,
    },
    orderId: {
      type: String,
      required: true,
    },
    time: {
      type: Date,
      default: Date.now(),
    },
  },

  { timestamps: true }
);

const returnOrderStatusLogModel = new mongoose.model("OrderStatusLog", schema);
module.exports = returnOrderStatusLogModel;
