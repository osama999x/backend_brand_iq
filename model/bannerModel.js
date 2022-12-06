const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    banner: [String],
    screenRefrence: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

const bannerModel = new mongoose.model("Banner", schema);
module.exports = bannerModel;
