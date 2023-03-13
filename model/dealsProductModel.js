const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    dealId: {
      type: Schema.Types.ObjectId,
      ref: "Deal",
      required: true,
    },
    buyDeal: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        sku: {
          type: String,
        },
      },
    ],
    getDeal: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        sku: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

const dealsProductModel = new mongoose.model("DealProduct", schema);
module.exports = dealsProductModel;
