const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    label: { type: String, required: true, unique: true },
    route: { type: String, required: true, unique: true },
    icon:{type:String},
    isSubModule: {
      type: Boolean,
      default: false,
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
    orderPosition: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
const moduleModel = new mongoose.model("Module", schema);
module.exports = moduleModel;
