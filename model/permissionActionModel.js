const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    perm_name: String,
    route: String,
  },
  {
    timestamps: true,
  }
);
const permissionActionModel = new mongoose.model("Action", schema);
module.exports = permissionActionModel;
