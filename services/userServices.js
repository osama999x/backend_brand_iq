const userModel = require("../model/userModel");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const projection = require("../config/mongoProjection");
const roleRouter = require("../routes/roleRouter");
const userResetPasswordModel = require("../model/userResetPaswordModel");
const jwt = require("jsonwebtoken");
const userSendEmail = require("../utils/userSendEmail");
const { json } = require("body-parser");
const saveOtp = require("../utils/saveOtp");
const jwtService = require("../utils/jwtService");
const { v4: uuidv4 } = require("uuid");
const authIdServices = require("./authIdServices");
const rolePermissionServices = require("./rolePermissionServices");

const userServices = {
  get: async () => {
    const result = await userModel.find({}, projection.projection).populate({
      path: "role",
      select: { _id: 1, name: 1 },
    }).sort({createdAt:-1});
    return result;
  },
  getByUserID: async (_id) => {
    var _id = mongoose.Types.ObjectId(_id);
    const result = await userModel.findById({ _id }, projection.projection).lean();
    // .populate({
    //   path: "role",
    //   select: { _id: 1, name: 1 },
    // });
    if (result) {
      const role_permission = await rolePermissionServices.getRolePermission(
        result.role
      );
      if (role_permission) {
        result.modules = role_permission.modules;
      } else {
        result.modules = [];
      }
    }
    return result;
  },
  validatePassword: async (password, realPassword) => {
    console.log(password, realPassword);
    const valid = await bcrypt.compare(password, realPassword);
    return valid;
  },
  login: async (email) => {
    const result = await userModel.findOne(
      { email: email },
      { createdAt: 0, updatedAt: 0, __v: 0 }
    ).lean();
    if (result) {
      const role_permission = await rolePermissionServices.getRolePermission(
        result.role
      );
      console.log(role_permission)
      if (role_permission) {
        result.modules = role_permission.modules;
      } else {
        result.modules = [];
      }
      const uuid = uuidv4();
      console.log("uuid", uuid);
      const refreshToken = jwtService.create({ uuid, type: "admin" });
      const accessToken = jwtService.create(
        { userId: result._id, type: "admin" },
        "5m"
      );
      authIdServices.add(result._id, uuid);
      await userModel.findOneAndUpdate(
        { _id: result._id },
        { token: accessToken },
        { new: true }
      );
      // (result.accessToken = accessToken),
      result.refreshToken = refreshToken;
    }
    return result;
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
    const expireOtp = await saveOtp.adminValidateOTPExpiryByEmail(email);
    if (expireOtp) {
      const user = await saveOtp.adminVerifiyOtp(email, otp);
      if (!user) {
        throw "OTP not varified!";
      } else {
        return true;
      }
    } else {
      throw "OTP Expire Please Try Again";
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
  update: async (_id, role, name, email, contact) => {
    var _id = mongoose.Types.ObjectId(_id);
    // const salt = await bcrypt.genSalt(10);
    // password = await bcrypt.hash(password, salt);
    const result = await userModel.findOneAndUpdate(
      { _id },
      { role: mongoose.Types.ObjectId(role), name, email, contact },
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
