const { response } = require("express");
const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const webSignupLogServices = require("../services/webSignupLogServices");
const webSignupLogRouter = express.Router();

webSignupLogRouter.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const result = await webSignupLogServices.get();
    if (result.length !== 0) {
      return res.status(200).send({ msg: "users", data: result });
    } else {
      return res.status(400).send({ msg: "Users Not Found" });
    }
  })
);
module.exports = webSignupLogRouter;
