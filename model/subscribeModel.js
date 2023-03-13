const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid");
const validator = require("validator");
const schema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: "Email address is required",
      validate: {
        validator: validator.isEmail,
        message: "{VALUE} is not a valid email",
        isAsync: false,
      },
    },
  },
  { timestamps: true }
);

const SubscribeModel = new mongoose.model("Subscribe", schema);
module.exports = SubscribeModel;
