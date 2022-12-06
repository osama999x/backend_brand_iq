const userModel = require("../model/userModel");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const projection = require("../config/mongoProjection");
const roleRouter = require("../routes/roleRouter");
const userResetPasswordModel = require("../model/userResetPaswordModel");
const jwt = require("jsonwebtoken");
const userSendEmail = require("../utils/userSendEmail");
const { json } = require("body-parser");

const userServices = {
  get: async () => {
    const result = await userModel.find({}, projection.projection).populate({
      path: "role",
      select: { _id: 1, name: 1 },
    });
    return result;
  },
  getByUserID: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await userModel
      .findById({ _id }, projection.projection)
      .populate({
        path: "role",
        select: { _id: 1, name: 1 },
      });
    return result;
  },
  login: async (email, password, res) => {
    const customer = await userModel.findOne({ email: email });
    if (customer) {
      // check customer password with hashed password stored in the database
      const validPassword = await bcrypt.compare(password, customer.password);
      if (validPassword) {
        await userModel.findOneAndUpdate({ email: email }, { isLogin: true });
        const result = await userModel
          .findOne(
            { email: email },
            { createdAt: 0, updatedAt: 0, __v: 0, password: 0 }
          )
          .lean();
        if (result) {
          const token = jwt.sign(
            {
              email: result.email,
              password: result.password,
            },
            process.env.SECRET_KEY,
            {
              expiresIn: "1 hours",
            }
          );
          result.token = token;
        }
        return result;
      } else {
        throw "Password Incorrect";
        // return;
      }
    } else {
      throw "User Doesn't Exist";
      // return;
    }
  },
  addNew: async (role, name, email, password, contact) => {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    user = new userModel({
      role: mongoose.Types.ObjectId(role),
      name,
      email,
      password,
      contact,
    });
    const result = await user.save();
    return result;
  },
  resetPassword: async (email) => {
    const customer = await userModel.findOne({ email: email });
    if (customer) {
      result = await userSendEmail(email);
      return result;
    } else {
      return null;
    }
  },
  verifyNewPassword: async (email, otp) => {
    const customer = await userResetPasswordModel
      .findOne({
        email: email,
        otp: otp,
      })
      .limit(1)
      .sort({ $natural: -1 });
    if (customer) {
      const currentTime = new Date();
      expireOtp = customer.expireOtp;
      if (currentTime > expireOtp) {
        throw "OTP expire please try again";
      } else {
        return customer;
      }
    } else {
      throw "OTP Not Verified";
    }
  },
  setNewPassword: async (_id, password) => {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    const result = await userModel.findOneAndUpdate(
      { _id: _id },
      {
        password,
      },
      {
        new: true,
      }
    );
    return result;
  },
  forgetPassword: async (email, password) => {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    const result = await userModel.findOneAndUpdate(
      { email },
      { password },
      { new: true }
    );
    return result;
  },
  update: async (_id, role, name, email, password, contact) => {
    var _id = mongoose.Types.ObjectId(_id);
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    const result = await userModel.findOneAndUpdate(
      { _id },
      { role: mongoose.Types.ObjectId(role), name, email, password, contact },
      { new: true }
    );
    return result;
  },
  delete: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await userModel.deleteOne({ _id });
    return result;
  },
};

module.exports = userServices;
