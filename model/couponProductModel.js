const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");

const schema = new Schema(
  {
    couponId: {
      type: Schema.Types.ObjectId,
    },
    couponProduct: [
      {
        product: { type: Schema.Types.ObjectId },
        sku: {
          type: String,
          unique: true,
        },
      },
    ],
    orderPriceLimit: {
      type: Number,
    },
    expireDate: {
      type: Date,
    },
  },
  { timestamps: true }
);
const couponProductModel = mongoose.model("couponProduct", schema);
module.exports = couponProductModel;
