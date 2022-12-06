const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    taxType: {
      type: Schema.Types.ObjectId,
      ref: "TaxType",
      required: true,
    },
    taxHead: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const taxHeadModel = new mongoose.model("TaxHead", schema);
module.exports = taxHeadModel;
