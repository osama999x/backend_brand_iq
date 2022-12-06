const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
  {
    deliveryPartner: {
      type: Schema.Types.ObjectId,
      ref: "deliveryPartner",
      required: true,
    },
    orderStatus: {
      type: Schema.Types.ObjectId,
      ref: "OrderStatus",
      required: true,
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

const orderLogModel = new mongoose.model("OrderLog", schema);
module.exports = orderLogModel;
