const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const schema = new Schema(
  {
    taxType: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const taxTypeModel = new mongoose.model("TaxType", schema);
module.exports = taxTypeModel;
