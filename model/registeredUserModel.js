const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
  },
  membershipId: {
    type: Schema.Types.ObjectId,
    ref: "Membership",
  },
  status: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});
const registeredUserModel = mongoose.model("registeredUser", schema);
module.exports = registeredUserModel;
