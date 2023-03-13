const resetPasswordModel = require("../model/resetPasswordModel");
const userResetPasswordModel = require("../model/userResetPaswordModel");
const saveOtp = {
  otpById: async (email, otp) => {
    let date = new Date();
    let expireOtp = new Date(date.getTime() + 3 * 60000);
    expireOtp = new Date(expireOtp.toLocaleString());
    const user = await resetPasswordModel.findOne({ email: email });
    if (user) {
      const updateUser = await resetPasswordModel.findOneAndUpdate(
        { email: email },
        { otp, expireOtp },
        { new: true }
      );
      return updateUser;
    } else {
      const data = await resetPasswordModel({
        email,
        otp,
        expireOtp,
      });
      const result = data.save();
      return result;
    }
  },
  adminOtpById: async (email, otp) => {
    let date = new Date();
    let expireOtp = new Date(date.getTime() + 3 * 60000);
    expireOtp = new Date(expireOtp.toLocaleString());
    const user = await userResetPasswordModel.findOne({ email: email });
    if (user) {
      const updateUser = await userResetPasswordModel.findOneAndUpdate(
        { email: email },
        { otp, expireOtp },
        { new: true }
      );
      return updateUser;
    } else {
      const data = await userResetPasswordModel({
        email,
        otp,
        expireOtp,
      });
      const result = data.save();
      return result;
    }
  },
  validateOTPExpiryByEmail: async (email) => {
    const now = new Date();
    const user = await resetPasswordModel.findOne({
      email: email,
      expireOtp: { $gt: now },
    });
    return user;
  },
  adminValidateOTPExpiryByEmail: async (email) => {
    const now = new Date();
    const user = await userResetPasswordModel.findOne({
      email: email,
      expireOtp: { $gt: now },
    });
    return user;
  },
  verifiyOtp: async (email, otp) => {
    const customer = await resetPasswordModel.findOne({
      email: email,
      otp: otp,
    });
    return customer;
  },
  adminVerifiyOtp: async (email, otp) => {
    const customer = await userResetPasswordModel.findOne({
      email: email,
      otp: otp,
    });
    return customer;
  },
};
module.exports = saveOtp;
