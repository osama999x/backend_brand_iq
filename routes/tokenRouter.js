const express = require("express");
const tokenRouter = express.Router();
const verifyToken = require("../utils/verfyToken");
const jwt = require("jsonwebtoken");
const customerModel = require("../model/customerModel");
const expressAsyncHandler = require("express-async-handler");
const encryptRequest = require("../middleware/encryptRequest");
const decryptRequest = require("../middleware/decryptRequest");
tokenRouter.post(
  "/refreshToken",
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await customerModel.findOne({ email: email });
    if (!user) {
      res.status(400).send({ msg: "User doesn't exist" });
    } else {
      let refrestKoken = jwt.sign(
        {
          email: user.email,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "5m",
        }
      );
      refrestKoken = encryptRequest(refrestKoken);
      res.status(200).send({
        msg: "Refresh Token",
        refreshToken: refrestKoken,
      });
    }
  })
);
module.exports = tokenRouter;
