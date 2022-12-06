const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const customerModel = require("../model/customerModel");
const customerServices = require("../services/customerServices");
const systemNotificationServices = require("../services/systemNotificationServices");
const notificationInfo = require("../utils/notificationInfo");
const customerRouter = express.Router();
const validator = require("../utils/passwordValidator");
const uploadFile = require("../utils/uploadFile");
customerRouter.post(
  "/signup",
  expressAsyncHandler(async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      contact,
      address,
      gender,
      password,
      reEnterPassword,
    } = req.body;

    if (password !== reEnterPassword) {
      return res.status(400).send({ msg: "Passwords Don't Match" });
    }
    if (!validator.schema.validate(password)) {
      return res.status(400).send({
        msg: "Password must have at least:1 uppercase letter,1 lowercase letter,1 number and 1 special character",

        //validator.schema.validate(password, { list: true }),
      });
    }
    const result = await customerServices.addNew(
      firstName,
      lastName,
      email,
      contact,
      address,
      gender,
      password
    );
    if (result) {
      return res.status(200).send({ msg: "Registered Succesfully" });
    } else {
      return res.status(400).send({ msg: "Customer Not Registered" });
    }
  })
);
customerRouter.post(
  "/webSignup",
  expressAsyncHandler(async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      contact,
      address,
      gender,
      cnic,
      fcmToken,
    } = req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !contact ||
      !address ||
      !gender ||
      !cnic
    ) {
      res.status(400).send({
        msg: "Fields Missing",
      });
    }
    const result = await customerServices.addNewWeb(
      firstName,
      lastName,
      email,
      contact,
      address,
      gender,
      cnic,
      fcmToken
    );
    if (result) {
      return res.status(200).send({ msg: "customer added.", data: result });
    } else {
      return res.status(400).send({ msg: "customer not added" });
    }
  })
);
customerRouter.patch(
  "/uploadProfileImage",
  expressAsyncHandler(async (req, res) => {
    let { customerId, image } = req.body;
    image = await uploadFile(image);
    if (image) {
      const result = await customerServices.uploadProfileImage(
        customerId,
        image
      );
      if (result) {
        res
          .status(200)
          .send({ msg: "Image Updated Succesfully", data: result });
      } else {
        res.status(400).send({ msg: "Failed to update profile image!" });
      }
    } else {
      res.status(400).send({ msg: "Failed to upload image" });
    }
  })
);
customerRouter.patch(
  "/updateCustomerProfile",
  expressAsyncHandler(async (req, res) => {
    const { customerID, firstName, lastName, email, contact, address, gender } =
      req.body;
    if (
      !customerID ||
      !firstName ||
      !lastName ||
      !email ||
      !contact ||
      !address ||
      !gender
    ) {
      return res.status(400).send({ msg: "Fields Missing" });
    }

    const result = await customerServices.updateDetails(
      customerID,
      firstName,
      lastName,
      email,
      contact,
      address,
      gender
    );
    if (result) {
      return res.status(200).send({ msg: "customer updated.", data: result });
    } else {
      return res.status(400).send({ msg: "customer not updated" });
    }
  })
);
customerRouter.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    const { email, password, fcmToken } = req.body;
    if (!email || !password || !fcmToken) {
      res.status(400).send({ msg: "Fields Missing" });
    }
    try {
      const result = await customerServices.login(email, password, fcmToken);
      res.status(200).json({ msg: "Logged In Succesfully", data: result });
      if (result) {
        await systemNotificationServices.newNotification(
          notificationInfo.login.body,
          notificationInfo.login.title,
          fcmToken
        );
      }
    } catch (e) {
      res.status(400).send({ msg: e });
    }
  })
);
customerRouter.post(
  "/details",
  expressAsyncHandler(async (req, res) => {
    const { customerID } = req.body;
    const result = await customerServices.customerDetails(customerID);
    if (result) {
      res.status(400).json({
        msg: "Customer",
        Detail: result,
      });
    } else {
      res.status(200).json({ msg: "Customer doesn't exists" });
    }
  })
);
customerRouter.post(
  "/resetpassword/otp",
  expressAsyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await customerServices.resetPassword(email);
    if (result) {
      res.status(200).json({ msg: "OTP sent" });
      const customerFcm = await customerModel.findOne({ email: email });
      await systemNotificationServices.newNotification(
        notificationInfo.otpSend.body,
        notificationInfo.otpSend.title,
        customerFcm.fcmToken
      );
    } else {
      res.status(400).json({ msg: "OTP not sent" });
    }
  })
);
// })
// )};
customerRouter.post(
  "/resetpassword/verify",
  expressAsyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    try {
      const result = await customerServices.verifyNewPassword(email, otp);
      res.status(200).json({ msg: "OTP Varified" });
    } catch (e) {
      res.status(400).json({ msg: e });
    }
  })
);
customerRouter.post(
  "/resetpassword/set",
  expressAsyncHandler(async (req, res) => {
    const { userId, password, reEnterPassword } = req.body;
    if (password !== reEnterPassword) {
      return res.status(400).send({ msg: "Passwords Don't Match" });
    }
    const result = await customerServices.setNewPassword(userId, password);
    if (result) {
      res.status(200).json({ msg: "Password Updated", data: result });
      const customerFcm = await customerModel.findOne(
        { _id: userId },
        { fcmToken: 1 }
      );
      await systemNotificationServices.newNotification(
        notificationInfo.password.body,
        notificationInfo.password.title,
        customerFcm.fcmToken
      );
    } else {
      res.status(400).json({ msg: "Password Not Updated" });
    }
  })
);
customerRouter.post(
  "/resetpassword/forgot",
  expressAsyncHandler(async (req, res) => {
    const { email, password, reEnterPassword } = req.body;
    if (password !== reEnterPassword) {
      return res.status(400).send({ msg: "Passwords Don't Match" });
    }
    const result = await customerServices.setForgotPassword(email, password);
    if (result) {
      res.status(200).json({ msg: "Password Updated" });
      const customerFcm = await customerModel.findOne(
        { email: email },
        { fcmToken: 1 }
      );
      await systemNotificationServices.newNotification(
        notificationInfo.password.body,
        notificationInfo.password.title,
        customerFcm.fcmToken
      );
    } else {
      res.status(400).json({ msg: "Password Not Updated" });
    }
  })
);
customerRouter.get(
  "/registeredCustomer",
  expressAsyncHandler(async (req, res) => {
    const result = await customerServices.registerCustomer();
    if (result.length != 0) {
      res.status(200).json({ msg: "Registered Customers ", data: result });
    } else {
      res.status(400).json({ msg: "Registered Customers Not Found" });
    }
  })
);
customerRouter.get(
  "/registeredCustomerDetails",
  expressAsyncHandler(async (req, res) => {
    const { customerId } = req.query;
    const result = await customerServices.registerCustomerDetails(customerId);
    if (result) {
      res
        .status(200)
        .json({ msg: "Registered Customers Details ", data: result });
    } else {
      res.status(400).json({ msg: "Registered Customers Not Found" });
    }
  })
);
customerRouter.get(
  "/membership",
  expressAsyncHandler(async (req, res) => {
    const { customerId } = req.query;
    const result = await customerServices.customerMembership(customerId);
    if (result) {
      res.status(200).json({ msg: "Customers Membership ", data: result });
    } else {
      res.status(400).json({ msg: "Customers Membership Not Found" });
    }
  })
);
module.exports = customerRouter;
