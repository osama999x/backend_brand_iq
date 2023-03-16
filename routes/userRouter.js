const { response } = require("express");
const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const authIdServices = require("../services/authIdServices");
const userServices = require("../services/userServices");
const userRouter = express.Router();
const validator = require("../utils/passwordValidator");
const verfyToken = require("../utils/verfyToken");
const { v4: uuidv4 } = require("uuid");
const saveOtp = require("../utils/saveOtp");
const jwtService = require("../utils/jwtService");

userRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await userServices.get();
    res.status(200).send({ msg: "users", data: result });
  })
);
userRouter.post(
  "/userDetails",
  expressAsyncHandler(async (req, res) => {
    let { userID } = req.body;
    const result = await userServices.getByUserID(userID);
    if (result) {
      return res.status(200).send({ msg: "user", data: result });
    } else {
      return res.status(400).send({ msg: "User Not Found" });
    }
  })
);
userRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { roleId, name, email, password, contact } = req.body;
    if (!name || !roleId || !email || !password || !contact) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    if (!validator.schema.validate(password)) {
      return res.status(400).send({
        msg: "Password must have at least:1 uppercase letter,1 lowercase letter,1 number and 1 special character",

        //validator.schema.validate(password, { list: true }),
      });
    }
    const result = await userServices.addNew(
      roleId,
      name,
      email,
      password,
      contact
    );
    if (result) {
      const uuid = uuidv4();
      const refreshToken = jwtService.create({ uuid, type: "admin" });
      const accessToken = jwtService.create(
        { userId: result._id, type: "admin" },
        "5m"
      );
      authIdServices.add(result._id, uuid);
      return res.status(200).send({
        msg: "User added",
        data: result,
        accessToken,
        refreshToken,
      });
    } else {
      return res.status(400).send({ msg: "User Not added" });
    }
  })
);
userRouter.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const user = await userServices.login(email);
    console.log(user);
    if (user) {
      const validatePassword = await userServices.validatePassword(
        password,
        user.password
      );
      if (validatePassword) {
        res.status(200).send({
          msg: "Logged in Successfully",
          data: user,
        });
      } else {
        res.status(400).send({
          msg: "Invalid Credentials!",
        });
      }
    } else {
      res.status(400).send({
        msg: "Invalid Credentials!",
      });
    }
  })
);
userRouter.post(
  "/resetpassword/otp",
  expressAsyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await userServices.resetPassword(email);
    if (result) {
      res.status(200).json({ msg: "OTP sent" });
    } else {
      res.status(400).json({ msg: "OTP not sent" });
    }
  })
);
userRouter.post(
  "/resetpassword/verify",
  expressAsyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const expireOtp = await saveOtp.adminValidateOTPExpiryByEmail(email);
    if (!expireOtp) {
      res.status(400).send({
        msg: "Otp Expire please try again!",
      });
    } else {
      const user = await saveOtp.adminVerifiyOtp(email, otp);
      if (user) {
        res.status(200).send({ msg: "OTP Verified" });
      } else {
        res.status(400).send({ msg: "Invalid OTP" });
      }
    }
  })
);
userRouter.post(
  "/resetpassword/set",
  expressAsyncHandler(async (req, res) => {
    const { userId, password, NewPassword } = req.body;
    console.log(password, NewPassword);
    if (password !== NewPassword) {
      return res.status(400).send({ msg: "Passwords Don't Match" });
    }
    if (!validator.schema.validate(password)) {
      return res.status(400).send({
        msg: "Password must have at least:1 uppercase letter,1 lowercase letter,1 number and 1 special character",

        //validator.schema.validate(password, { list: true }),
      });
    }
    const result = await userServices.setNewPassword(userId, password);
    if (result) {
      res.status(200).json({ msg: "Password Updated", data: result });
    } else {
      res.status(400).json({ msg: "Password Not Updated" });
    }
  })
);
userRouter.post(
  "/forgetPassword",
  expressAsyncHandler(async (req, res) => {
    const { email, password, newPassword } = req.body;
    if (!email || !password || !newPassword) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    if (password !== newPassword) {
      res.status(400).send({
        msg: "Password And NewPaswword don't Match",
      });
    } else if (!validator.schema.validate(password)) {
      return res.status(400).send({
        msg: "Password must have at least:1 uppercase letter,1 lowercase letter,1 number and 1 special character",

        //validator.schema.validate(password, { list: true }),
      });
    } else {
      const result = await userServices.forgetPassword(email, password);
      if (result) {
        return res.status(200).send({ msg: "Password Updated", data: result });
      } else {
        return res.status(400).send({ msg: "Password not Updated" });
      }
    }
  })
);
userRouter.patch(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { userId, roleId, name, email, contact } = req.body;
    if (!userId || !name || !roleId || !email || !contact) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    // if (!validator.schema.validate(password)) {
    //   return res.status(400).send({
    //     msg: "Password must have at least:1 uppercase letter,1 lowercase letter,1 number and 1 special character",

    //     //validator.schema.validate(password, { list: true }),
    //   });
    // }
    const result = await userServices.update(
      userId,
      roleId,
      name,
      email,
      contact
    );
    if (result) {
      return res.status(200).send({ msg: "User updated.", data: result });
    } else {
      return res.status(400).send({ msg: "Id Not found" });
    }
  })
);
userRouter.delete(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await userServices.delete(userId);
    if (result.deletedCount == 0) {
      return res.status(400).send({ msg: "ID Not found" });
    }
    if (result) {
      return res.status(200).send({ msg: "User deleted.", data: result });
    } else {
      return res.status(400).send({ msg: "User not deleted" });
    }
  })
);

module.exports = userRouter;
