const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const cipherServices = require("../services/cipherServices");
const cipherRouter = express.Router();
const validator = require("../utils/passwordValidator");

cipherRouter.post(
  "/encrypt",
  expressAsyncHandler(async (req, res) => {
    const result = await cipherServices.encrypt(req.body);
    if (result) {
      return res.status(200).send({ msg: "encrypted cipher", data: result });
    } else {
      return res.status(400).send({ msg: "Could Not Encrypt Cipher" });
    }
  })
);
cipherRouter.post(
  "/decrypt",
  expressAsyncHandler(async (req, res) => {
    let { cipher } = req.body;
    const result = await cipherServices.decrypt(cipher);
    if (result) {
      return res.status(200).send({ msg: "decrypted cipher", data: result });
    } else {
      return res.status(400).send({ msg: "Could Not Decrypt Cipher" });
    }
  })
);
module.exports = cipherRouter;
