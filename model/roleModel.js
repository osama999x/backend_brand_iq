const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permission",
        required: true,
      },
    ],
    name: {
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

const roleModel = new mongoose.model("Role", schema);
module.exports = roleModel;
