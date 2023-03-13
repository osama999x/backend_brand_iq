const mongoose = require("mongoose");
const { isValidPassword } = require("mongoose-custom-validators");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter a valid email",
      },
    },
    password: {
      type: String,
      //required: true,
      validate: {
        validator: isValidPassword,
        message:
          "Password must have at least: 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.",
      },
    },
    cnic: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "images/profile.png",
    },
    isVarified: {
      type: Boolean,
      default: false,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    membershipCategory: {
      type: String,
      default: null,
    },
    fcmToken: {
      type: String,
      default: null,
    },
    token: {
      type: String,
      default: null,
    },
    zindigiWallet: {
      zindigiWalletNumber: {
        type: String,
        default: null,
      },
      title: { type: String, default: null },
      linked: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

const customerModel = new mongoose.model("Customer", schema);
module.exports = customerModel;
