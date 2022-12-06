const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const { generateLongLowercaseUuid, generateShortUuid } = require("custom-uuid");

const schema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    product: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        categoryId: {
          type: Schema.Types.ObjectId,
          ref: "Category",
        },
        subcategoryId: {
          type: Schema.Types.ObjectId,
          ref: "SubCategory",
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        sku: {
          type: String,
          required: true,
        },
        size: {
          type: String,
          required: true,
        },
      },
    ],
    address: {
      type: String,
      required: true,
    },
    contact: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
    },
    totalBill: {
      type: Number,
      required: true,
    },
    paymentMode: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
    },
    trackingId: {
      type: String,
    },
    placedOn: {
      type: Date,
      default: Date.now(),
    },
    isDeletedByUser: {
      type: Number,
      default: 0,
    },
    isDeletedByAdmin: {
      type: Number,
      default: 0,
    },
    channel: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const orderModel = new mongoose.model("Order", schema);
module.exports = orderModel;
