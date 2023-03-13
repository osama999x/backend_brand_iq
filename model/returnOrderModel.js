const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const { generateLongLowercaseUuid, generateShortUuid } = require("custom-uuid");

const schema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      unique: true,
    },
    isOrderReturn: {
      type: Boolean,
      default: false,
    },
    shipmentType: {
      type: String,
      enum: ["pickup", "dropOff"],
    },
    returnProduct: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
        },
        price: {
          type: Number,
        },
        sku: {
          type: String,
        },
        size: {
          type: String,
        },
      },
    ],
    returnDate: {
      type: Date,
    },
    exchangeReason: {
      type: String,
    },
    images: [String],
  },
  { timestamps: true }
);

const returnOrderModel = new mongoose.model("returnOrder", schema);
module.exports = returnOrderModel;
