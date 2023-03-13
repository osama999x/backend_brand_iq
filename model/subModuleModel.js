const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    label: String,
    route: String,
    module: {
      type: Schema.Types.ObjectId,
      ref: "Module",
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
  },
  { timestamps: true }
);
const subModuleModel = new mongoose.model("SubModule", schema);
module.exports = subModuleModel;
