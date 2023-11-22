const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const customerModel = require("../model/customerModel");
const authIdServices = require("../services/authIdServices");
const customerServices = require("../services/customerServices");
const systemNotificationServices = require("../services/systemNotificationServices");
const notificationInfo = require("../utils/notificationInfo");
const customerRouter = express.Router();
const validator = require("../utils/passwordValidator");
const uploadFile = require("../utils/uploadFile");
const { v4: uuidv4 } = require("uuid");
const saveOtp = require("../utils/saveOtp");
const jwtService = require("../utils/jwtService");
const validateMobileNumber = require("../utils/validateMobileNumber");
customerRouter.post(
  "/signup",
  expressAsyncHandler(async (req, res) => {
    let {
      firstName,
      lastName,
      email,
      contact,
      address,
      gender,
      password,
      reEnterPassword,
      cnic,
    } = req.body;
    let isValidContact = validateMobileNumber(contact);
    if (!isValidContact) {
      return res.status(400).send({
        msg: "Please enter valid mobile number!",
      });
    }
    if (password !== reEnterPassword) {
      return res.status(400).send({ msg: "Passwords Don't Match" });
    }
    if (!validator.schema.validate(password)) {
      return res.status(400).send({
        msg: "Password must have at least:1 uppercase letter,1 lowercase letter,1 number and 1 special character",

        //validator.schema.validate(password, { list: true }),
      });
    }
    console.log(contact);
    const result = await customerServices.addNew(
      firstName,
      lastName,
      email,
      contact,
      address,
      gender,
      password,
      cnic
    );
    if (result) {
      const uuid = uuidv4();
      const refreshToken = jwtService.create({ uuid, type: "user" });
      const accessToken = jwtService.create(
        { userId: result._id, type: "user" },
        "5m"
      );
      authIdServices.add(result._id, uuid);
      return res.status(200).send({
        msg: "Registered Successfully",
        data: result,
        accessToken,
        refreshToken,
      });
    } else {
      return res.status(400).send({ msg: "Customer Not Registered" });
    }
  })
);
customerRouter.post(
  "/webSignup",
  expressAsyncHandler(async (req, res) => {
    let {
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
    let ValidContact = validateMobileNumber(contact);
    if (!ValidContact) {
      return res.status(400).send({
        msg: "Please enter valid mobile number 03xxxxxxxxx!",
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
          .send({ msg: "Profile Updated Successfully", data: result });
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
    const { customerID, firstName, lastName, contact, address, gender } =
      req.body;
    if (
      !customerID ||
      !firstName ||
      !lastName ||
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
      contact,
      address,
      gender
    );
    if (result) {
      return res
        .status(200)
        .send({ msg: "User profile updated successfully", data: result });
    } else {
      return res.status(400).send({ msg: "User profile not updated" });
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
    const result = await customerServices.login(email, password, fcmToken);
    if (result) {
      const validatePassword = await customerServices.validatePassword(
        password,
        result.password
      );
      if (validatePassword) {
        await customerModel.findOneAndUpdate({ email }, { fcmToken: fcmToken });
        await systemNotificationServices.newNotification(
          notificationInfo.login.body,
          notificationInfo.login.title,
          fcmToken
        );
        res.status(200).send({
          msg: "Logged in Successfully",
          data: result,
        });
      } else {
        res.status(400).send({
          msg: "Password Incorrect!",
        });
      }
    } else {
      res.status(400).send({
        msg: "User doesn't exist!",
      });
    }
    // res.status(200).json({ msg: "Logged In Successfully", data: result });
    // if (result) {
    //   await systemNotificationServices.newNotification(
    //     notificationInfo.login.body,
    //     notificationInfo.login.title,
    //     fcmToken
    //   );
    // }
  })
);
customerRouter.post(
  "/details",
  expressAsyncHandler(async (req, res) => {
    const { customerID } = req.body;
    const result = await customerServices.customerDetails(customerID);
    if (result) {
      res.status(200).json({
        msg: "Customer",
        data: result,
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
    const expireOtp = await saveOtp.validateOTPExpiryByEmail(email);
    if (!expireOtp) {
      res.status(400).send({
        msg: "Otp Expire please try again!",
      });
    } else {
      const user = await saveOtp.verifiyOtp(email, otp);
      if (user) {
        await customerModel.findOneAndUpdate(
          { email },
          { isVarified: true },
          { new: true }
        );
        res.status(200).send({ msg: "OTP Verified" });
      } else {
        res.status(400).send({ msg: "Invalid OTP" });
      }
    }
    // try {
    //   const result = await customerServices.verifyNewPassword(email, otp);
    //   res.status(200).json({ msg: "OTP Verified " });
    // } catch (e) {
    //   res.status(400).json({ msg: e.message });
    // }
  })
);
customerRouter.post(
  "/resetpassword/set",
  expressAsyncHandler(async (req, res) => {
    const { userId, password, reEnterPassword } = req.body;
    if (password !== reEnterPassword) {
      return res.status(400).send({ msg: "Passwords Don't Match" });
    }
    if (!validator.schema.validate(password)) {
      return res.status(400).send({
        msg: "Password must have at least:1 uppercase letter,1 lowercase letter,1 number and 1 special character",

        //validator.schema.validate(password, { list: true }),
      });
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
    if (!validator.schema.validate(password)) {
      return res.status(400).send({
        msg: "Password must have at least:1 uppercase letter,1 lowercase letter,1 number and 1 special character",

        //validator.schema.validate(password, { list: true }),
      });
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
