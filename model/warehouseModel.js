const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    warehouses: [Object],
  },
  { timestamps: true }
);
const warehouseModel = new mongoose.model("Warehouse", schema);
module.exports = warehouseModel;
