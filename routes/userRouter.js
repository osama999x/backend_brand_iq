const { response } = require("express");
const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const userServices = require("../services/userServices");
const userRouter = express.Router();
const validator = require("../utils/passwordValidator");
const verfyToken = require("../utils/verfyToken");

userRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await userServices.get();
    if (result.length !== 0) {
      return res.status(200).send({ msg: "users", data: result });
    } else {
      return res.status(400).send({ msg: "Users Not Found" });
    }
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
    const result = await userServices.addNew(
      roleId,
      name,
      email,
      password,
      contact
    );
    if (result) {
      return res.status(200).send({ msg: "User added", data: result });
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
    try {
      const result = await userServices.login(email, password);
      return res.status(200).send({ data: result });
    } catch (e) {
      res.status(400).send({ msg: e });
    }
  })
);
userRouter.post(
  "/resetpassword/otp",
  expressAsyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await userServices.resetPassword(email);
    if (result) {
      res.status(200).json({ msg: "link sent" });
    } else {
      res.status(400).json({ msg: "link not sent" });
    }
  })
);
userRouter.post(
  "/resetpassword/verify",
  expressAsyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    try {
      const result = await userServices.verifyNewPassword(email, otp);
      res.status(200).json({ msg: "OTP Verified" });
    } catch (e) {
      res.status(400).json({ msg: e });
    }
  })
);
userRouter.post(
  "/resetpassword/set",
  expressAsyncHandler(async (req, res) => {
    const { userId, password, NewPassword } = req.body;
    if (password !== NewPassword) {
      return res.status(400).send({ msg: "Passwords Don't Match" });
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
    const { userId, roleId, name, email, password, contact } = req.body;
    if (!userId || !name || !roleId || !email || !password || !contact) {
      return res.status(400).send({ msg: "Fields Missing" });
    }
    const result = await userServices.update(
      userId,
      roleId,
      name,
      email,
      password,
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
