const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
  {
    deliveryPartner: {
      type: Schema.Types.ObjectId,
      ref: "deliveryPartner",
    },
    orderStatus: {
      type: Schema.Types.ObjectId,
      ref: "OrderStatus",
    },
    orderId: {
      type: String,
      required: true,
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
