const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const convertMobileFormate = require("../utils/convertMobileFormate");
const customerServices = require("../services/customerServices");
const encryptRequest = require("../middleware/encryptRequest");
const convertDate = require("../utils/convertDate");
const converCNICFormate = require("../utils/convertCNICFormate");
const customerModel = require("../model/customerModel");
const paymentHistoryServices = require("../services/paymentHistoryServices");
const smsServices = require("../utils/sendSMS");
const { rmSync } = require("fs");
const otp = require("../utils/otp");
const saveOtp = require("../utils/saveOtp");
const { resetPassword } = require("../services/customerServices");
const zindigiWalletPayment = require("../utils/zindigiWalletPayment");
const zindigiWalletRouter = express.Router();
zindigiWalletRouter.post(
  "/varifyAcounToLink",
  expressAsyncHandler(async (req, res) => {
    const { userId } = req.body;
    const user = await customerServices.getUser(userId);
    if (!user) {
      return res.status(400).send({ msg: "user not found!" });
    }
    cnic = user.cnic;
    let mobileNo = user.contact;
    // cnic = converCNICFormate(user.cnic);
    // let mobileNo = convertMobileFormate(cnic.contact);
    let dateTime = convertDate(new Date(new Date().toLocaleString()));
    const result = await zindigiWalletPayment.verifyAcountToLink(
      cnic,
      mobileNo,
      dateTime
    );
    if (result.ResponseCode === 0) {
      res.status(200).send({ msg: "Otp sent to your mobile" });
    } else if (result.ResponseCode === 14) {
      res.status(403).send({
        msg: result.ResponseDescription,
      });
    } else {
      if (result.ResponseCode === 67) {
        res.status(400).send({
          msg: "This mobile number is register against an other CNIC!",
        });
      } else if (result.ResponseCode == 70) {
        res.status(400).send({
          msg: "This CNIC is register against an other mobile number!",
        });
        return;
      }
      res.status(400).send({
        msg: result.ResponseDescription,
      });
    }
  })
);
zindigiWalletRouter.post(
  "/linkAccount",
  expressAsyncHandler(async (req, res) => {
    let { userId, mPin } = req.body;
    const user = await customerServices.getUser(userId);
    if (!user) {
      return res.status(400).send({ msg: "user not found!" });
    }
    cnic = user.cnic;
    let mobileNo = user.contact;
    // cnic = converCNICFormate(user.cnic);
    // let mobileNo = convertMobileFormate(user.contact);
    let dateTime = convertDate(new Date(new Date().toLocaleString()));
    const result = await zindigiWalletPayment.linkAccount(
      cnic,
      mobileNo,
      dateTime,
      mPin
    );
    if (!result) {
      return res.status(400).send({ msg: "unknown!" });
    }
    if (result.ResponseCode === 0) {
      const linkZindigiAccount = await customerServices.addZindigiAccount(
        userId,
        mobileNo,
        result.accountTitle
      );
      console.log("linkZindigiAccount", linkZindigiAccount);
      if (linkZindigiAccount) {
        res.status(200).send({
          msg: "Your wallet zindigi account has been linked",
          date: linkZindigiAccount,
        });
      } else {
        res.status(400).send({
          msg: "Failed to link account!",
        });
      }
    } else {
      res.status(403).send({ msg: result.ResponseDescription });
    }
  })
);
zindigiWalletRouter.get(
  "/deLinkAccountOtp",
  expressAsyncHandler(async (req, res) => {
    const { email } = req.query;
    const Otp = otp();
    let customer = await customerModel.findOne({ email: email });
    if (customer) {
      let user = await saveOtp.otpById(email, Otp);
      await smsServices.sendSMS(customer.contact, user.otp);
      res.status(200).send({ msg: "Otp Send to Your Mobile!" });
    } else {
      res.status(400).send({ msg: "User Not Found" });
    }
  })
);
zindigiWalletRouter.post(
  "/deLinkAccount",
  expressAsyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const validateOtp = await saveOtp.validateOTPExpiryByEmail(email);
    if (!validateOtp) {
      return res
        .status(400)
        .send({ msg: "Otp has been expired please try Again!" });
    }
    const varifyOtp = await saveOtp.verifiyOtp(email, otp);
    console.log("verfiyotp", varifyOtp);
    if (!varifyOtp) {
      return res.status(400).send({ msg: "Invalid Otp!" });
    }
    const user = await customerServices.deLinkZindigiAccount(email);
    console.log("user", varifyOtp);
    if (user) {
      return res.status(200).send({
        msg: "Your Zindigi wallet account has been deLinked",
        data: user,
      });
    } else {
      return res.status(400).send({
        msg: "Failed to deLink account with user",
      });
    }
  })
);
zindigiWalletRouter.post(
  "/payment",
  expressAsyncHandler(async (req, res) => {
    let { userId, orderId, amount } = req.body;
    const user = await customerModel.findOne({ _id: userId });

    if (!user) {
      res.status(400).send({ msg: "User Not Found!" });
    }
    let mobileNo = user.contact;
    // let mobileNo = convertMobileFormate(user.contact);
    let dateTime = convertDate(new Date(new Date().toLocaleString()));
    console.log("date", dateTime);
    const result = await zindigiWalletPayment.payment(
      dateTime,
      mobileNo,
      amount
    );
    if (!result) {
      return res.status(400).send({
        msg: "Unknown error occur!",
      });
    }
    if (result.ResponseCode === 00) {
      const history = await paymentHistoryServices.new(
        userId,
        orderId,
        "zindigi",
        result.data
      );
      console.log(history);
      res.status(200).send({ msg: result.ResponseDescription });
    } else {
      return res.status(403).send({ msg: result.ResponseDescription });
    }
  })
);
zindigiWalletRouter.post(
  "/paymentInquiry",
  expressAsyncHandler(async (req, res) => {
    let { userId, amount } = req.body;
    const user = await customerServices.getUser(userId);
    if (!user) {
      return res.status(400).send({ msg: "User not found!" });
    }
    let mobileNo = user.contact;
    let dateTime = convertDate(new Date(new Date().toLocaleString()));
    const result = await zindigiWalletPayment.paymentInquiry(
      mobileNo,
      amount,
      dateTime
    );
    console.log("result", result);
    if (result.ResponseCode === 00) {
      return res.status(200).send({ msg: result.ResponseDescription });
    } else {
      return res.status(403).send({ msg: result.ResponseDescription });
    }
  })
);
zindigiWalletRouter.post(
  "/balanceInquiry",
  expressAsyncHandler(async (req, res) => {
    let { userId, otpPin } = req.body;
    const user = await customerModel.findOne({ _id: userId });
    if (!user) {
      return res.status(400).send({
        msg: "User Not Found",
      });
    }
    let mobileNo = user.contact;
    dateTime = convertDate(new Date(new Date().toLocaleString()));
    const result = await zindigiWalletPayment.balanceInquiry(
      mobileNo,
      dateTime
    );
    console.log("result", result);
    if (result.ResponseCode === 00) {
      res.status(200).send({ msg: "Balance Details", data: result });
    } else {
      res.status(403).send({
        msg: result.ResponseDescription,
      });
    }
  })
);
module.exports = zindigiWalletRouter;
