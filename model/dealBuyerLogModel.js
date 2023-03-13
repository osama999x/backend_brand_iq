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
  expireDate: {
    type: Date,
  },
});
const DealBuyerLogModel = mongoose.model("DealBuyerLog", schema);
module.exports = DealBuyerLogModel;
