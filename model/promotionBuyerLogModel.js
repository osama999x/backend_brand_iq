const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },
  promotion: {
    type: Schema.Types.ObjectId,
    ref: "MPromotion",
  },
  launchDate: {
    type: Date,
    default: Date.now,
  },
  endingDate: {
    type: Date,
    default: Date.now,
  },
});
const promotionBuyerLogModel = mongoose.model("PromotionBuyerLog", schema);
module.exports = promotionBuyerLogModel;
