const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  token: { type: String, required: true },
});
const tokenModel = mongoose.model("token", schema);
module.exports = tokenModel;
