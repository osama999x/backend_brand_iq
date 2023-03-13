const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Customer" },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    transaction_amount: { type: String },
    method: {
      type: String,
      default: "zindigi",
    },
    paymentDetails: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

const paymentModel = new mongoose.model("Payment", schema);

module.exports = paymentModel;
