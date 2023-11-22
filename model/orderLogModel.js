const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
  {
    deliveryPartner: {
      type: String,
    },
    orderStatus: {
      type: String,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    time: {
      type: Date,
      default: Date.now(),
    },
    message: {
      type: String,
      default: "",
    },
  },

  { timestamps: true }
);

const orderLogModel = new mongoose.model("OrderLog", schema);
module.exports = orderLogModel;
